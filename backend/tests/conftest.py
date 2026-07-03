import os
import sys
import uuid
from datetime import time

import pytest
from flask_jwt_extended import create_access_token

os.environ.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "this-is-a-very-long-secret-key-for-testing-123456")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from backend.core import create_app
from backend.core.extensions import db
from backend.models.booking import Reservation
from backend.models.category import CategoryFood
from backend.models.confirmbooking import Booking
from backend.models.cuisine import Cuisine
from backend.models.food import Food
from backend.models.menu import Menu
from backend.models.orders import Order
from backend.models.ordersitem import OrderItem
from backend.models.payment import Payment
from backend.models.restaurant import Restaurant
from backend.models.review import Review
from backend.models.table import Table
from backend.models.tables import Tables
from backend.models.user import User

import backend.app as backend_app
import backend.app.api as backend_api
import backend.app.api.v1 as backend_api_v1
import backend.app.api.v1.customer as backend_customer
import backend.app.api.v1.customer.routes as customer_routes
import backend.app.api.v1.customer.service as customer_service
import backend.app.api.v1.restaurant as backend_restaurant
import backend.app.api.v1.restaurant.routes as restaurant_routes
import backend.app.api.v1.restaurant.service as restaurant_service

sys.modules.setdefault("app", backend_app)
sys.modules.setdefault("app.api", backend_api)
sys.modules.setdefault("app.api.v1", backend_api_v1)
sys.modules.setdefault("app.api.v1.customer", backend_customer)
sys.modules.setdefault("app.api.v1.customer.routes", customer_routes)
sys.modules.setdefault("app.api.v1.customer.service", customer_service)
sys.modules.setdefault("app.api.v1.restaurant", backend_restaurant)
sys.modules.setdefault("app.api.v1.restaurant.routes", restaurant_routes)
sys.modules.setdefault("app.api.v1.restaurant.service", restaurant_service)


@pytest.fixture
def app():
    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        JWT_SECRET_KEY="this-is-a-very-long-secret-key-for-testing-123456",
        SECRET_KEY="test-secret-key",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    with app.app_context():
        db.create_all()
        restaurant = Restaurant(
            RestaurantName="Default Test Restaurant",
            Address="HCM",
            Phone="0900000000",
            Email="default@example.com",
            Opentime=time(8, 0),
            Closetime=time(22, 0),
            description="Default restaurant for route tests",
            status="Đang hoạt động",
        )
        restaurant.RestaurantID = 1
        table = Tables(
            RestaurantID=1,
            TableNumber="A1",
            Capacity=4,
            Status="Available",
        )
        table.TableID = 1
        db.session.add_all([restaurant, table])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(autouse=True)
def active_app_context(app):
    with app.app_context():
        yield


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def app_context(app):
    with app.app_context():
        yield


@pytest.fixture
def auth_header(app):
    def _get(user_id=1):
        with app.app_context():
            token = create_access_token(identity=user_id)
        return {"Authorization": f"Bearer {token}"}

    return _get


@pytest.fixture
def staff_headers(app):
    user = User(
        Username="staffroute",
        Password="secret",
        Email="staffroute@example.com",
        Phone="0912345678",
        Role="STAFF",
        RestaurantID=1,
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(
        identity=str(user.UserID),
        additional_claims={"role": "STAFF", "restaurant_id": 1},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def customer_headers(app):
    user = User(
        Username="customerroute",
        Password="secret",
        Email="customerroute@example.com",
        Phone="0912345678",
        Role="CUSTOMER",
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(
        identity=str(user.UserID),
        additional_claims={"role": "CUSTOMER", "restaurant_id": None},
    )
    return {"Authorization": f"Bearer {token}"}


def create_test_restaurant():
    unique = str(uuid.uuid4())[:8]

    restaurant = Restaurant(
        RestaurantName=f"Test Restaurant {unique}",
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
