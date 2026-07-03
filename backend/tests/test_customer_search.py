
# Case 1: không lọc
def test_search_empty(client, monkeypatch):
    """
    CASE: Không truyền address và cuisine
    """

    # Giả lập service trả về danh sách rỗng
    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: []
    )

    # Gọi API
    res = client.get("/api/v1/customer/search")

    # Kiểm tra kết quả
    assert res.status_code == 200
    assert res.json == []


# Case 2: lọc theo địa chỉ
def test_search_with_address(client, monkeypatch):
    """
    CASE: Tìm theo địa chỉ (address=HCM)
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: [{"RestaurantName": "Test"}]
    )

    res = client.get("/api/v1/customer/search?address=HCM")

    assert res.status_code == 200
    assert len(res.json) == 1


# Case 3: lọc theo cuisine
def test_search_with_cuisine(client, monkeypatch):
    """
    CASE: Tìm theo loại ẩm thực (cuisine)
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: [{"RestaurantName": "Food"}]
    )

    res = client.get("/api/v1/customer/search?cuisine=1")

    assert res.status_code == 200
    assert len(res.json) == 1


# Case 4: địa chỉ + cuisine
def test_search_address_and_cuisine(client, monkeypatch):
    """
    CASE: Kết hợp address và cuisine
    """

    # Giả lập và kiểm tra input truyền vào
    def mock_search(address, cuisine):
        assert address == "HCM"   # đảm bảo param truyền đúng
        assert cuisine == "1"
        return [{"RestaurantName": "Combo"}]

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        mock_search
    )

    res = client.get("/api/v1/customer/search?address=HCM&cuisine=1")

    assert res.status_code == 200
    assert res.json[0]["RestaurantName"] == "Combo"


# Case 5: cuisine không hợp lệ
def test_search_invalid_cuisine(client, monkeypatch):
    """
    CASE: cuisine không phải số (abc
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: []
    )

    res = client.get("/api/v1/customer/search?cuisine=abc")

    assert res.status_code == 200
    assert res.json == []


# Case 6: ký tự đặc biệt
def test_search_special_character(client, monkeypatch):
    """
    CASE: address chứa ký tự đặc biệt (@@@)
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: [{"RestaurantName": "@@@@"}]
    )

    res = client.get("/api/v1/customer/search?address=@@@")

    assert res.status_code == 200
    assert len(res.json) == 1


# Case 7: một ký tự
def test_search_single_character(client, monkeypatch):
    """
    CASE: address chỉ có 1 ký tự
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: [{"RestaurantName": "A"}]
    )

    res = client.get("/api/v1/customer/search?address=A")

    assert res.status_code == 200
    assert len(res.json) == 1


# Case 8: khoảng trắng
def test_search_whitespace(client, monkeypatch):
    """
    CASE: address = "   " (toàn khoảng trắng)
    EXPECT:
        - Backend nhận đúng giá trị (chưa trim)
        - Không crash
    """

    def mock_search(address, cuisine):
        assert address == "   "  # kiểm tra input giữ nguyên
        return []

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        mock_search
    )

    res = client.get("/api/v1/customer/search?address=   ")

    assert res.status_code == 200


# Case 9: không tìm thấy
def test_search_no_result(client, monkeypatch):
    """
    CASE: không có kết quả phù hợp
    """

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: []
    )

    res = client.get("/api/v1/customer/search?address=XYZ")

    assert res.status_code == 200
    assert res.json == []


# Case 10: input dài
def test_search_long_input(client, monkeypatch):
    """
    CASE: nhập chuỗi rất dài (300 ký tự)
    """
    long_text = "A" * 300

    monkeypatch.setattr(
        "backend.app.api.v1.customer.routes.search_restaurant",
        lambda a, b: []
    )

    res = client.get(f"/api/v1/customer/search?address={long_text}")

    assert res.status_code == 200
