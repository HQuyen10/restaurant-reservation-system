import uuid
from datetime import time

from backend.core.extensions import db
from backend.models.food import Food
from backend.models.restaurant import Restaurant


def create_test_restaurant():
    unique = str(uuid.uuid4())[:8]
    restaurant = Restaurant(
        RestaurantName=f"Restaurant {unique}",
        Address="HCM",
        Phone=f"090{unique[:7]}",
        Email=f"test{unique}@gmail.com",
        Opentime=time(8, 0),
        Closetime=time(22, 0),
        description="Test restaurant",
    )
    db.session.add(restaurant)
    db.session.commit()
    return restaurant


def create_test_food(restaurant_id):
    unique = str(uuid.uuid4())[:5]
    food = Food(
        FoodID=unique,
        FoodName="Pizza",
        RestaurantID=restaurant_id,
        Price=100000,
        Description="Test food",
        Visible=True,
    )
    db.session.add(food)
    db.session.commit()
    return food


def test_restaurant_order_routes_invalid_table_create_and_get(client, app):
    # Tạo order với bàn không tồn tại
    response = client.post("/api/v1/restaurant/orders", json={"table_id": 999, "items": []})
    assert response.status_code == 404
    assert response.get_json()["error"] == "Table not found"

    restaurant = create_test_restaurant()
    food = create_test_food(restaurant.RestaurantID)

    # Tạo order với 1 món hợp lệ và 1 món không tồn tại
    response = client.post(
        "/api/v1/restaurant/orders",
        json={"table_id": 1, "items": [{"food_id": food.FoodID, "qty": 2}, {"food_id": "NOPE", "qty": 3}]},
    )
    assert response.status_code == 200
    assert response.get_json()["message"] == "Order created"

    response = client.get("/api/v1/restaurant/orders/1")
    assert response.status_code == 200
    assert response.get_json()["items"][0]["food_id"] == food.FoodID


def test_restaurant_get_order_empty_route(client):
    # Không có order đang mở thì trả danh sách rỗng
    response = client.get("/api/v1/restaurant/orders/999")
    assert response.status_code == 200
    assert response.get_json()["items"] == []
