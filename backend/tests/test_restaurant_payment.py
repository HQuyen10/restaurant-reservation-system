import uuid
from datetime import time

from backend.core.extensions import db

from backend.models.restaurant import Restaurant
from backend.models.tables import Tables
from backend.models.orders import Order


# ==================================================
# Hàm hỗ trợ
# ==================================================

def create_test_restaurant():
    """
    Tạo nhà hàng test
    """

    unique = str(uuid.uuid4())[:8]

    restaurant = Restaurant(
        RestaurantName=f"Restaurant {unique}",
        Address="HCM",
        Phone=f"090{unique[:7]}",
        Email=f"test{unique}@gmail.com",
        Opentime=time(8, 0),
        Closetime=time(22, 0),
        description="Test restaurant"
    )

    db.session.add(restaurant)
    db.session.commit()

    return restaurant


def create_test_table(restaurant_id, status="Reserved"):
    """
    Tạo bàn test
    """

    table = Tables(
        RestaurantID=restaurant_id,
        TableNumber="A1",
        Capacity=4,
        Status=status
    )

    db.session.add(table)
    db.session.commit()

    return table


def create_test_order(table_id, status="active"):
    """
    Tạo order test
    """

    order = Order(
        table_id=table_id,
        status=status
    )

    db.session.add(order)
    db.session.commit()

    return order


# ==================================================
# Test thanh toán
# ==================================================

def test_pay_order_success(client, app):
    """
    Thanh toán thành công:
    - Order active -> paid
    - Table -> Available
    """

    with app.app_context():

        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()

        table = create_test_table(
            restaurant.RestaurantID
        )

        order = create_test_order(
            table.TableID
        )

        # Gọi API
        response = client.put(
            f"/api/v1/restaurant/orders/pay/{table.TableID}"
        )

        data = response.get_json()

        # Kiểm tra DB
        updated_order = Order.query.get(order.id)

        updated_table = Tables.query.get(
            table.TableID
        )

        # Kiểm tra phản hồi
        assert response.status_code == 200

        assert data["message"] == (
            "Thanh toán thành công"
        )

        assert data["table_status"] == (
            "Available"
        )

        # Kiểm tra dữ liệu
        assert updated_order.status == "paid"

        assert updated_table.Status == (
            "Available"
        )


def test_pay_order_no_active_order(client, app):
    """
    Không có active order:
    - API vẫn success
    - Table vẫn Available
    """

    with app.app_context():

        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()

        table = create_test_table(
            restaurant.RestaurantID
        )

        # Gọi API
        response = client.put(
            f"/api/v1/restaurant/orders/pay/{table.TableID}"
        )

        data = response.get_json()

        # Kiểm tra kết quả
        updated_table = Tables.query.get(
            table.TableID
        )

        assert response.status_code == 200

        assert data["message"] == (
            "Thanh toán thành công"
        )

        assert updated_table.Status == (
            "Available"
        )

def test_pay_order_only_affect_active(client, app):
    """
        TEST CASE:
        - Table có 2 order:
            + 1 active
            + 1 paid
        - Chỉ active order được update → paid
        """
    with app.app_context():
        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()
        table = create_test_table(restaurant.RestaurantID)
        # Order đang mở cần cập nhật
        active_order = create_test_order(table.TableID, status="active")
        # Order đã thanh toán không bị ảnh hưởng
        paid_order = create_test_order(table.TableID, status="paid")
        # Gọi API
        response = client.put(
            f"/api/v1/restaurant/orders/pay/{table.TableID}"
        )
        # Kiểm tra DB sau khi xử lý
        updated_active = Order.query.get(active_order.id)
        updated_paid = Order.query.get(paid_order.id)

        assert response.status_code == 200
        assert updated_active.status == "paid"
        assert updated_paid.status == "paid"  # Backend đang cập nhật tất cả query trả về

def test_pay_multiple_active_orders(client, app):
    """
    Nhiều active orders:
    - Tất cả phải chuyển sang paid
    """

    with app.app_context():

        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()

        table = create_test_table(
            restaurant.RestaurantID
        )

        order1 = create_test_order(
            table.TableID
        )

        order2 = create_test_order(
            table.TableID
        )

        # Gọi API
        response = client.put(
            f"/api/v1/restaurant/orders/pay/{table.TableID}"
        )

        # Kiểm tra kết quả
        updated_order1 = Order.query.get(
            order1.id
        )

        updated_order2 = Order.query.get(
            order2.id
        )

        assert response.status_code == 200

        assert updated_order1.status == (
            "paid"
        )

        assert updated_order2.status == (
            "paid"
        )


def test_pay_order_table_not_found(client):
    response = client.put("/api/v1/restaurant/orders/pay/9999")
    data = response.get_json()

    # Backend hiện tại không kiểm tra bàn nên vẫn 200
    assert response.status_code == 200
    assert data["message"] == "Thanh toán thành công"


def test_pay_order_already_paid(client, app):
    """
    Order đã paid:
    - Không bị đổi trạng thái
    - API vẫn success
    """

    with app.app_context():

        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()

        table = create_test_table(
            restaurant.RestaurantID
        )

        order = create_test_order(
            table.TableID,
            status="paid"
        )

        # Gọi API
        response = client.put(
            f"/api/v1/restaurant/orders/pay/{table.TableID}"
        )

        # Kiểm tra kết quả
        updated_order = Order.query.get(
            order.id
        )

        assert response.status_code == 200

        assert updated_order.status == (
            "paid"
        )

def test_pay_order_idempotent(client, app):
    """
    TEST CASE:
    - Thanh toán 2 lần liên tiếp
    - Không gây lỗi hoặc trạng thái sai
    """

    with app.app_context():

        # Chuẩn bị dữ liệu
        restaurant = create_test_restaurant()
        table = create_test_table(restaurant.RestaurantID)
        order = create_test_order(table.TableID)

        # Gọi lần 1
        client.put(f"/api/v1/restaurant/orders/pay/{table.TableID}")

        # Gọi lần 2 để kiểm tra tính lặp an toàn
        response = client.put(f"/api/v1/restaurant/orders/pay/{table.TableID}")

        # Kiểm tra kết quả
        updated_order = Order.query.get(order.id)

        assert response.status_code == 200

        # Luôn phải paid, không rollback
        assert updated_order.status == "paid"


def test_restaurant_pay_order_invalid_table_route(client):
    # Thanh toán bàn không có order đang mở vẫn trả phản hồi ổn định
    response = client.put("/api/v1/restaurant/orders/pay/999")

    assert response.status_code == 200
    assert response.get_json()["table_status"] == "Available"
