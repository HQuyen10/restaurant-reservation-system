from datetime import date, datetime, timedelta, time
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from backend.app.api.v1.customer import service as customer_service
from backend.core.extensions import db
from backend.models.booking import Reservation
from backend.models.payment import Payment
from backend.models.restaurant import Restaurant
from backend.models.tables import Tables


def test_customer_search_empty_keyword_and_cuisine_filter(app):
    # Tìm kiếm không keyword vẫn trả nhà hàng đang hoạt động
    result = customer_service.search_restaurant("", "")
    assert isinstance(result, list)
    assert result[0]["RestaurantID"] == 1

    result = customer_service.search_restaurant("HCM", "")
    # Lọc theo địa chỉ
    assert isinstance(result, list)
    assert result[0]["Address"] == "HCM"

    restaurant = Restaurant.query.get(1)
    restaurant.CuisineID = 7
    db.session.commit()

    # Lọc theo cuisine
    result = customer_service.search_restaurant("", "7")
    assert len(result) == 1
    assert result[0]["RestaurantID"] == 1


def test_customer_get_menu_maps_menu_rows(monkeypatch):
    # Giả lập query menu để kiểm tra mapping dữ liệu trả về
    row = SimpleNamespace(
        FoodName="Pho",
        Price=50000,
        Description="Hot",
        Image="pho.jpg",
    )
    fake_query = MagicMock()
    fake_query.filter_by.return_value.all.return_value = [row]
    # Không dùng DB thật cho menu legacy
    monkeypatch.setattr(customer_service.Menu, "query", fake_query)

    result = customer_service.get_menu(1)

    assert result == [{
        "FoodName": "Pho",
        "Price": 50000.0,
        "Description": "Hot",
        "Image": "pho.jpg",
    }]


def test_customer_check_table_available_and_unavailable(monkeypatch, app):
    # Bàn còn trống trong khung giờ đặt
    result = customer_service.check_table(1, "2099-01-01", "18:00", 2)
    assert result
    assert result[0]["TableID"] == 1

    monkeypatch.setattr(customer_service, "cancel_expired_bookings", lambda: None)

    # Giả lập có booking trùng giờ
    class ConflictQuery:
        def filter(self, *args):
            return self

        def first(self):
            return object()

    monkeypatch.setattr(customer_service.Reservation, "query", ConflictQuery())
    result = customer_service.check_table(1, "2099-01-01", "18:00", 2)
    # Có conflict thì không còn bàn phù hợp
    assert result == []


def test_customer_create_booking_invalid_date_and_table_unavailable(monkeypatch):
    # Bỏ auto-cancel để test tập trung vào validation
    monkeypatch.setattr(customer_service, "cancel_expired_bookings", lambda: None)
    monkeypatch.setattr(customer_service, "get_jwt_identity", lambda: None)

    # Sai format ngày
    result = customer_service.create_booking({
        "name": "A",
        "phone": "0912345678",
        "restaurant_id": 1,
        "table_id": 1,
        "people": 2,
        "date": "bad-date",
        "time": "18:00",
    })
    assert "error" in result

    # TableID không tồn tại
    result = customer_service.create_booking({
        "name": "A",
        "phone": "0912345678",
        "restaurant_id": 1,
        "table_id": 999,
        "people": 2,
        "date": "2099-01-01",
        "time": "18:00",
    })
    assert result["error"] == "Bàn không hợp lệ"


def test_customer_create_booking_success_and_db_rollback(monkeypatch, app):
    # Giả lập dependency phụ để test luồng tạo booking
    monkeypatch.setattr(customer_service, "cancel_expired_bookings", lambda: None)
    monkeypatch.setattr(customer_service, "get_jwt_identity", lambda: None)
    monkeypatch.setattr(customer_service, "generate_vietqr", lambda amount, rid: "qr-url")

    payload = {
        "name": "A",
        "phone": "0912345678",
        "restaurant_id": 1,
        "table_id": 1,
        "people": 2,
        "date": "2099-01-01",
        "time": "18:00",
    }
    result = customer_service.create_booking(payload)
    # Tạo booking thành công và tính tiền cọc
    assert result["reservation_id"]
    assert result["deposit"] == 100000
    assert result["qr"] == "qr-url"

    def fail_commit():
        raise RuntimeError("commit failed")

    # Ép commit lỗi để kiểm tra rollback
    rollback_payload = {
        **payload,
        "time": "20:30",
    }
    monkeypatch.setattr(db.session, "commit", fail_commit)
    result = customer_service.create_booking(rollback_payload)
    assert result["error"] == "Đặt bàn thất bại do lỗi hệ thống"


def test_customer_confirm_payment_wrong_amount_processed_and_success(app):
    # Tạo booking pending để test thanh toán
    booking = Reservation(
        CustomerName="A",
        phone="0912345678",
        RestaurantID=1,
        TableID=1,
        BookingDate=date.today() + timedelta(days=1),
        BookingTime=time(18, 0),
        GuestCount=2,
        Deposit=100000,
        Status="Pending",
    )
    db.session.add(booking)
    db.session.commit()

    # Sai số tiền
    result = customer_service.confirm_payment(booking.ReservationID, 1)
    assert result["error"] == "Sai số tiền"

    result = customer_service.confirm_payment(booking.ReservationID, 100000)
    # Thanh toán đúng số tiền
    assert result["message"] == "Payment success"
    assert Payment.query.filter_by(ReservationID=booking.ReservationID).first()

    booking.Status = "Confirmed"
    db.session.commit()
    # Booking đã xử lý thì không thanh toán lại
    result = customer_service.confirm_payment(booking.ReservationID, 100000)
    assert result["error"] == "Booking already processed"


def test_customer_history_empty_and_with_keyword(app):
    # Chưa đăng nhập hoặc không có lịch sử
    assert customer_service.get_history(None, "") == []
    assert customer_service.get_history("999", "") == []

    booking = Reservation(
        UserID="7",
        CustomerName="History User",
        phone="0912345678",
        RestaurantID=1,
        TableID=1,
        BookingDate=date.today() + timedelta(days=1),
        BookingTime=time(19, 0),
        GuestCount=2,
        Deposit=100000,
        Status="Pending",
    )
    db.session.add(booking)
    db.session.commit()

    # Tìm lịch sử theo keyword
    result = customer_service.get_history("7", "History")
    assert len(result) == 1
    assert result[0]["CustomerName"] == "History User"
