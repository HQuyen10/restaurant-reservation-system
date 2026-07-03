from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from backend.app.api.v1.admin.service import (
    AdminRestaurantService,
    AdminUserService,
    CuisineService,
    ReportService,
)
from backend.core.extensions import db
from backend.models.cuisine import Cuisine
from backend.models.restaurant import Restaurant
from backend.models.user import User

# Tạo user mẫu để test get/update/delete
def test_admin_user_get_all_update_and_delete_success(app):
    
    user = User(
        Username="adminuser",
        Password="secret",
        Email="old@example.com",
        Phone="0912345678",
        Role="CUSTOMER",
    )
    db.session.add(user)
    db.session.commit()

    # Kiểm tra lấy danh sách user
    users = AdminUserService.get_all_users()
    assert any(item["username"] == "adminuser" for item in users)

    # Gán role STAFF và RestaurantID
    updated = AdminUserService.update_user(user.UserID, {
        "Email": "new@example.com",
        "Role": "STAFF",
        "RestaurantID": "1",
    })
    assert updated.Email == "new@example.com"
    assert updated.RestaurantID == 1

    # Role không phải STAFF thì bỏ liên kết nhà hàng
    updated = AdminUserService.update_user(user.UserID, {"Role": "CUSTOMER"})
    assert updated.RestaurantID is None

    assert AdminUserService.delete_user(user.UserID) is True

# User không tồn tại
def test_admin_user_update_delete_not_found(app):
   
    assert AdminUserService.update_user(9999, {"Email": "x@example.com"}) is None
    assert AdminUserService.delete_user(9999) is False

# Tạo cuisine thành công
def test_admin_cuisine_success_duplicate_update_delete(app):
    
    result, status = CuisineService.create({"CuisineName": "Lau"})
    assert status == 201
    assert "Thêm" in result["message"]

    result, status = CuisineService.create({"CuisineName": "Lau"})
    # Không cho tạo trùng tên
    assert status == 400
    assert "tồn tại" in result["message"]

    cuisine = Cuisine.query.filter_by(CuisineName="Lau").first()
    # Cập nhật cuisine
    result, status = CuisineService.update(cuisine.CuisineID, {"CuisineName": "Nuong"})
    assert status == 200
    assert "Cập nhật" in result["message"]

    #Xóa cuisine
    result, status = CuisineService.delete(cuisine.CuisineID)
    assert status == 200
    assert "xoa" in result["message"].lower()


@pytest.mark.parametrize("payload, expected", [
    ({}, "trống"),
    ({"CuisineName": "Food123"}, "ký tự"),
])

# Validate tên cuisine trống hoặc sai định dạng
def test_admin_cuisine_invalid_name(payload, expected):
    
    result, status = CuisineService.create(payload)

    assert status == 400
    assert expected in result["message"]

# Cuisine không tồn tại
def test_admin_cuisine_update_delete_not_found(app):
    
    result, status = CuisineService.update(9999, {"CuisineName": "Test"})
    assert status == 404
    assert "Không tìm thấy" in result["message"]

    result, status = CuisineService.delete(9999)
    assert status == 404
    assert "tim thay" in result["message"]


def test_admin_restaurant_update_validation_and_success(app):
    restaurant = Restaurant.query.get(1)

    # Các case validation fail khi update nhà hàng
    cases = [
        ({"RestaurantName": ""}, "Tên nhà hàng"),
        ({"RestaurantName": "Bad@Name"}, "không hợp lệ"),
        ({"Phone": ""}, "Số điện thoại"),
        ({"Phone": "123"}, "10 chữ số"),
        ({"Address": ""}, "Địa chỉ"),
        ({"Address": "HCM !!!"}, "không hợp lệ"),
        ({"Email": ""}, "Email"),
        ({"Email": "bad-email"}, "Email không hợp lệ"),
    ]
    for payload, expected in cases:
        result, status = AdminRestaurantService.update_restaurant(restaurant.RestaurantID, payload)
        assert status == 400
        assert expected in result["message"]

    # Cập nhật thành công kèm file ảnh giả
    image = SimpleNamespace(filename="new.png")
    result, status = AdminRestaurantService.update_restaurant(
        restaurant.RestaurantID,
        {
            "RestaurantName": "Updated Name",
            "Phone": "0901234567",
            "Address": "HCM",
            "Email": "updated@example.com",
            "description": "New description",
            "status": "Active",
        },
        image=image,
    )
    assert status == 200
    assert "Cập nhật" in result["message"]
    assert restaurant.RestaurantName == "Updated Name"
    assert restaurant.image_url == "new.png"

# Nhà hàng không tồn tại
def test_admin_restaurant_not_found_and_delete_success(app):
   
    result, status = AdminRestaurantService.update_restaurant(9999, {"RestaurantName": "Name"})
    assert status == 404
    assert "Không tìm thấy" in result["message"]
    
    # Xóa mềm nhà hàng bằng cách đổi trạng thái
    restaurant = Restaurant.query.get(1)

    result, status = AdminRestaurantService.delete_restaurant(restaurant.RestaurantID)
    assert status == 200
    assert "ẩn" in result["message"]
    assert restaurant.status == "Ngưng hoạt động"


def test_admin_restaurant_approve_reject_success_not_found_and_exception(monkeypatch, app):
    restaurant = Restaurant.query.get(1)

    # Duyệt và từ chối nhà hàng thành công
    result, status = AdminRestaurantService.approve(restaurant.RestaurantID)
    assert status == 200
    assert "Da duyet" in result["message"]

    result, status = AdminRestaurantService.reject(restaurant.RestaurantID)
    assert status == 200
    assert "Da tu choi" in result["message"]
    
    # Duyệt nhà hàng không tồn tại
    result, status = AdminRestaurantService.approve(9999)
 
    assert status == 404
    assert "Khong tim thay" in result["message"]

    class BrokenQuery:
        def get(self, _id):
            raise RuntimeError("db down")

    # Giả lập query lỗi để kiểm tra rollback
    monkeypatch.setattr(Restaurant, "query", BrokenQuery())
    result, status = AdminRestaurantService.reject(1)
    assert status == 500
    assert "Loi he thong" in result["message"]


def test_admin_report_empty(monkeypatch):
    # Giả lập query nhà hàng rỗng
    class EmptyRestaurantQuery:
        def filter(self, *args):
            return self

        def order_by(self, *args):
            return self

        def all(self):
            return []

    class EmptyRevenueQuery:
        def join(self, *args):
            return self

        def filter(self, *args):
            return self

        def group_by(self, *args):
            return self

        def order_by(self, *args):
            return self

        def all(self):
            return []

    # Giả lập query doanh thu rỗng
    monkeypatch.setattr(Restaurant, "query", EmptyRestaurantQuery())
    monkeypatch.setattr(db.session, "query", lambda *args: EmptyRevenueQuery())

    result = ReportService.get_report(None, "2024-05")

    # Báo cáo rỗng phải trả tổng bằng 0
    assert result["restaurant_count"] == 0
    assert result["total_report"] == 0.0
    assert result["restaurants"] == []
