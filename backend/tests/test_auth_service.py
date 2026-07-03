import pytest

from backend.app.api.v1.auth.service import AuthService
from backend.core.extensions import db
from backend.models.user import User

# Đăng ký thành công, restaurant_id sai sẽ được bỏ qua
def test_auth_register_success_with_invalid_restaurant_id(app):

    result, status = AuthService.register({
        "username": "newuser",
        "password": "secret",
        "phone": "0912345678",
        "email": "newuser@example.com",
        "role": "CUSTOMER",
        "restaurant_id": "not-a-number",
    })

    # Có token và user_id sau khi tạo tài khoản
    assert status == 201
    assert result["message"] == "Tạo tài khoản thành công"
    assert result["access_token"]
    assert result["user_id"]


@pytest.mark.parametrize("payload, expected", [
    ({"username": "ab", "password": "x", "phone": "0912345678", "email": "a@b.com"}, "Username"),
    ({"username": "bad user", "password": "x", "phone": "0912345678", "email": "a@b.com"}, "Username"),
    ({"username": "validuser", "password": "a b", "phone": "0912345678", "email": "a@b.com"}, "Mật khẩu"),
    ({"username": "validuser", "password": "", "phone": "0912345678", "email": "a@b.com"}, "Mật khẩu"),
    ({"username": "validuser", "password": "x", "phone": "09abc", "email": "a@b.com"}, "Số điện thoại"),
    ({"username": "validuser", "password": "x", "phone": "09123", "email": "a@b.com"}, "Số điện thoại"),
    ({"username": "validuser", "password": "x", "phone": "9912345678", "email": "a@b.com"}, "Số điện thoại"),
    ({"username": "validuser", "password": "x", "phone": "0912345678", "email": "bad-email"}, "email"),
])

# Các case validation fail khi đăng ký
def test_auth_register_validation_errors(payload, expected):
   
    result, status = AuthService.register(payload)

    assert status == 400
    assert expected.lower() in result["message"].lower()

 # Seed username đã tồn tại
def test_auth_register_duplicate_username(app):
   
    db.session.add(User(
        Username="duplicate",
        Password="secret",
        Email="dup@example.com",
        Phone="0912345678",
        Role="CUSTOMER",
    ))
    db.session.commit()

    result, status = AuthService.register({
        "username": "duplicate",
        "password": "secret",
        "phone": "0912345678",
        "email": "dup2@example.com",
        "role": "CUSTOMER",
    })

    # Không cho đăng ký trùng username
    assert status == 400
    assert "tồn tại" in result["message"]


 # Seed user để login thành công
def test_auth_login_success(app):
   
    db.session.add(User(
        Username="loginuser",
        Password="secret",
        Email="login@example.com",
        Phone="0912345678",
        Role="STAFF",
        RestaurantID=1,
    ))
    db.session.commit()

    result, status = AuthService.login("loginuser", "secret")

    # Login đúng trả token và thông tin user
    assert status == 200
    assert result["message"] == "Đăng nhập thành công"
    assert result["role"] == "STAFF"
    assert result["user_info"]["restaurant_id"] == 1
    assert result["access_token"]


@pytest.mark.parametrize("username, password", [
    ("loginuser", "wrong"),
    ("missinguser", "secret"),
])

 # Seed user gốc, parametrize kiểm tra sai mật khẩu và user không tồn tại
def test_auth_login_wrong_password_or_user_not_found(app, username, password):
   
    db.session.add(User(
        Username="loginuser",
        Password="secret",
        Email="login@example.com",
        Phone="0912345678",
        Role="CUSTOMER",
    ))
    db.session.commit()

    result, status = AuthService.login(username, password)

    # Login fail trả 401
    assert status == 401
    assert result == {"message": "Sai tài khoản hoặc mật khẩu"}

# Token sai format hoặc không hợp lệ
