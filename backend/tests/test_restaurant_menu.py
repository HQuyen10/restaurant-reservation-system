from io import BytesIO

from flask_jwt_extended import create_access_token

from backend.core.extensions import db
from backend.models.food import Food
from backend.models.user import User

def test_restaurant_menu_api_success_and_exception(client, staff_headers, monkeypatch):
    # Case lấy menu thành công
    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.get_res_menu",
        lambda restaurant_id: [{"id": "F1", "name": "Pho"}],
    )
    response = client.get("/api/v1/restaurant/menu", headers=staff_headers)
    assert response.status_code == 200
    assert response.get_json()[0]["name"] == "Pho"

    def fail(_restaurant_id):
        raise RuntimeError("menu down")

    # Service lỗi thì route trả 500
    monkeypatch.setattr("backend.app.api.v1.restaurant.routes.get_res_menu", fail)
    response = client.get("/api/v1/restaurant/menu", headers=staff_headers)
    assert response.status_code == 500
    assert "Lỗi server" in response.get_json()["message"]


def test_restaurant_menu_admin_role_assignment_success_and_exception(
    client, staff_headers, customer_headers, monkeypatch
):
    # Sai role thì bị chặn
    response = client.get("/api/v1/restaurant/menu/admin", headers=customer_headers)
    assert response.status_code == 403
    assert "message" in response.get_json()

    staff_without_restaurant = User(
        Username="nostaffres",
        Password="secret",
        Email="nostaffres@example.com",
        Phone="0912345678",
        Role="STAFF",
    )
    db.session.add(staff_without_restaurant)
    db.session.commit()
    # STAFF chưa được gán nhà hàng
    token = create_access_token(
        identity=str(staff_without_restaurant.UserID),
        additional_claims={"role": "STAFF"},
    )
    response = client.get(
        "/api/v1/restaurant/menu/admin",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "message" in response.get_json()

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.get_menu_res_admin",
        lambda restaurant_id: [{"id": "F1"}],
    )
    # STAFF hợp lệ lấy menu admin thành công
    response = client.get("/api/v1/restaurant/menu/admin", headers=staff_headers)
    assert response.status_code == 200
    assert response.get_json() == [{"id": "F1"}]

    def fail(_restaurant_id):
        raise RuntimeError("admin menu down")

    # Giả lập lỗi server khi lấy menu admin
    monkeypatch.setattr("backend.app.api.v1.restaurant.routes.get_menu_res_admin", fail)
    response = client.get("/api/v1/restaurant/menu/admin", headers=staff_headers)
    assert response.status_code == 500
    assert "admin menu down" in response.get_json()["message"]


def test_restaurant_create_food_success_and_unassigned(client, staff_headers, monkeypatch):
    # Giả lập tạo món thành công cho STAFF có nhà hàng
    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.create_food",
        lambda data, restaurant_id: {"msg": "created", "restaurant_id": restaurant_id},
    )
    response = client.post(
        "/api/v1/restaurant/menu",
        json={"name": "Pho", "price": 50000},
        headers=staff_headers,
    )
    assert response.status_code == 200
    assert response.get_json()["msg"] == "created"

    unassigned = User(
        Username="unassigned",
        Password="secret",
        Email="unassigned@example.com",
        Phone="0912345678",
        Role="STAFF",
    )
    db.session.add(unassigned)
    db.session.commit()
    # STAFF không có RestaurantID thì không được tạo món
    token = create_access_token(identity=str(unassigned.UserID), additional_claims={"role": "STAFF"})
    response = client.post(
        "/api/v1/restaurant/menu",
        json={"name": "Pho", "price": 50000},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "message" in response.get_json()


def test_restaurant_update_food_json_form_upload_and_delete_not_found(client, monkeypatch):
    # Giả lập update để kiểm tra route nhận JSON và form-data
    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.update_food",
        lambda food_id, data: {"msg": "updated", "has_file": "image_file" in data},
    )
    response = client.put("/api/v1/restaurant/menu/F1", json={"name": "Pho"})
    assert response.status_code == 200
    assert response.get_json()["msg"] == "updated"

    response = client.put(
        "/api/v1/restaurant/menu/F1",
        data={"name": "Pho", "image": (BytesIO(b"fake"), "food.jpg")},
        content_type="multipart/form-data",
    )
    # Form-data có file phải được đưa vào data cho service xử lý
    assert response.status_code == 200
    assert response.get_json()["has_file"] is True

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.delete_food",
        lambda food_id: {"error": "Food not found"},
    )
    # Xóa món không tồn tại
    response = client.delete("/api/v1/restaurant/menu/F404")
    assert response.status_code == 200
    assert response.get_json()["error"] == "Food not found"


def test_restaurant_toggle_visible_routes(client):
    response = client.open("/api/v1/restaurant/menu/F1/toggle", method="OPTIONS")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"

    # Toggle món không tồn tại
    response = client.put("/api/v1/restaurant/menu/NOPE/toggle")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Not found"

    food = Food(
        FoodID="TG001",
        FoodName="Toggle Food",
        RestaurantID=1,
        Price=10000,
        Visible=True,
    )
    db.session.add(food)
    db.session.commit()

    # Toggle 2 lần để kiểm tra bật/tắt Visible
    response = client.put("/api/v1/restaurant/menu/TG001/toggle")
    assert response.status_code == 200
    assert response.get_json()["visible"] is False

    response = client.put("/api/v1/restaurant/menu/TG001/toggle")
    assert response.status_code == 200
    assert response.get_json()["visible"] is True
