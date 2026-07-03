# Test route đặt bàn nhà hàng

def test_restaurant_booking_routes_failures(client, staff_headers, monkeypatch):
    # Giả lập danh sách booking
    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.get_bookings",
        lambda restaurant_id: [{"ReservationID": 1}],
    )
    response = client.get("/api/v1/restaurant/bookings", headers=staff_headers)
    assert response.status_code == 200
    assert response.get_json()[0]["ReservationID"] == 1

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.confirm_booking",
        lambda booking_id: {"error": "Not found"},
    )
    # Confirm booking không tồn tại
    response = client.post("/api/v1/restaurant/bookings/99/confirm", headers=staff_headers)
    assert response.status_code == 200
    assert response.get_json()["error"] == "Not found"

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.reject_booking",
        lambda booking_id: {"error": "Cannot reject confirmed booking"},
    )
    # Reject booking đã confirm
    response = client.post("/api/v1/restaurant/bookings/1/reject", headers=staff_headers)
    assert response.status_code == 200
    assert "error" in response.get_json()

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.delete_booking",
        lambda booking_id: {"error": "Not found"},
    )
    # Xóa booking không tồn tại
    response = client.delete("/api/v1/restaurant/bookings/99")
    assert response.status_code == 200
    assert response.get_json()["error"] == "Not found"

    monkeypatch.setattr(
        "backend.app.api.v1.restaurant.routes.get_booking_by_table_service",
        lambda table_id: [],
    )
    # Bàn chưa có booking
    response = client.get("/api/v1/restaurant/tables/1/bookings")
    assert response.status_code == 200
    assert response.get_json() == []
