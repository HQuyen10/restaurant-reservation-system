from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from backend.app.api.v1.restaurant.service import pay_order_service


def _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, orders=None, table=None):
    orders = [] if orders is None else orders
    mock_order.query.filter_by.return_value.all.return_value = orders
    mock_tables.query.get.return_value = table
    mock_db_session.commit.return_value = None
    mock_db_session.rollback.return_value = None


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_pay_order_success(mock_db_session, mock_tables, mock_order):
    # Đóng order đang mở thành đã thanh toán.
    order = SimpleNamespace(status="active")
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order], table)

    result, status = pay_order_service(1)

    assert status == 200
    assert result["message"] == "Thanh toán thành công"
    assert order.status == "paid"
    assert table.Status == "Available"
    mock_db_session.commit.assert_called_once()
    mock_db_session.rollback.assert_not_called()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_pay_multiple_items_success(mock_db_session, mock_tables, mock_order):
    # Nhiều order đang mở cùng bàn đều được thanh toán.
    order_one = SimpleNamespace(status="active")
    order_two = SimpleNamespace(status="active")
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order_one, order_two], table)

    result, status = pay_order_service(7)

    assert status == 200
    assert result["table_status"] == "Available"
    assert order_one.status == "paid"
    assert order_two.status == "paid"
    mock_order.query.filter_by.assert_called_once_with(table_id=7, status="active")
    mock_db_session.commit.assert_called_once()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_pay_updates_table_status(mock_db_session, mock_tables, mock_order):
    # Thanh toán xong thì bàn trống.
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], table)

    result, status = pay_order_service(2)

    assert status == 200
    assert result["table_status"] == "Available"
    assert table.Status == "Available"
    mock_tables.query.get.assert_called_once_with(2)


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_pay_closes_active_order(mock_db_session, mock_tables, mock_order):
    # Order đang mở chuyển sang đã thanh toán.
    order = SimpleNamespace(status="active")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order], SimpleNamespace(Status="Reserved"))

    result, status = pay_order_service("3")

    assert status == 200
    assert result["message"] == "Thanh toán thành công"
    assert order.status == "paid"


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_order_not_found(mock_db_session, mock_tables, mock_order):
    # Không có order đang mở vẫn trả phản hồi ổn định.
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], SimpleNamespace(Status="Reserved"))

    result, status = pay_order_service(4)

    assert status == 200
    assert result["message"] == "Thanh toán thành công"
    mock_db_session.commit.assert_called_once()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_table_not_found(mock_db_session, mock_tables, mock_order):
    # Không tìm thấy bàn thì không crash.
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], None)

    result, status = pay_order_service(999)

    assert status == 200
    assert result["table_status"] == "Available"
    mock_tables.query.get.assert_called_once_with(999)
    mock_db_session.commit.assert_called_once()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_order_already_paid(mock_db_session, mock_tables, mock_order):
    # Order đã thanh toán không nằm trong query đang mở.
    paid_order = SimpleNamespace(status="paid")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], SimpleNamespace(Status="Reserved"))

    result, status = pay_order_service(5)

    assert status == 200
    assert paid_order.status == "paid"
    mock_order.query.filter_by.assert_called_once_with(table_id=5, status="active")
    mock_db_session.commit.assert_called_once()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_no_active_order(mock_db_session, mock_tables, mock_order):
    # Danh sách order đang mở rỗng vẫn xử lý an toàn.
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], table)

    result, status = pay_order_service(6)

    assert status == 200
    assert result == {"message": "Thanh toán thành công", "table_status": "Available"}
    assert table.Status == "Available"


def test_payment_invalid_order_id():
    # Thanh toán dựa theo bàn nên id sai là table id không hợp lệ.
    result, status = pay_order_service("bad-id")

    assert status == 400
    assert result["error"] == "Invalid table id"


def test_payment_invalid_table_id():
    # Id bàn không dương là không hợp lệ.
    result, status = pay_order_service(0)

    assert status == 400
    assert result["error"] == "Invalid table id"


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_empty_order_items(mock_db_session, mock_tables, mock_order):
    # Order không có món vẫn được đóng.
    order = SimpleNamespace(status="active", items=[])
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order], table)

    result, status = pay_order_service(8)

    assert status == 200
    assert order.status == "paid"
    assert result["message"] == "Thanh toán thành công"


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_duplicate_payment_request(mock_db_session, mock_tables, mock_order):
    # Gọi lần hai không còn order đang mở nhưng vẫn thành công.
    order = SimpleNamespace(status="active")
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order], table)

    first_result, first_status = pay_order_service(9)
    mock_order.query.filter_by.return_value.all.return_value = []
    second_result, second_status = pay_order_service(9)

    assert first_status == 200
    assert second_status == 200
    assert first_result["table_status"] == "Available"
    assert second_result["table_status"] == "Available"
    assert order.status == "paid"
    assert mock_db_session.commit.call_count == 2


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_idempotent(mock_db_session, mock_tables, mock_order):
    # Thanh toán lặp lại vẫn giữ bàn còn trống.
    table = SimpleNamespace(Status="Available")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], table)

    result, status = pay_order_service(10)

    assert status == 200
    assert result["table_status"] == "Available"
    assert table.Status == "Available"


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_order_total_zero(mock_db_session, mock_tables, mock_order):
    # Order tổng tiền 0 vẫn đóng vì hiện chỉ xử lý trạng thái.
    order = SimpleNamespace(status="active", total=0)
    table = SimpleNamespace(Status="Reserved")
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [order], table)

    result, status = pay_order_service(11)

    assert status == 200
    assert order.status == "paid"
    assert result["message"] == "Thanh toán thành công"


def test_payment_missing_payment_data():
    # Dữ liệu thanh toán phụ hiện không bắt buộc.
    with patch("backend.app.api.v1.restaurant.service.Order") as mock_order, \
            patch("backend.app.api.v1.restaurant.service.Tables") as mock_tables, \
            patch("backend.app.api.v1.restaurant.service.db.session") as mock_db_session:
        _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], SimpleNamespace(Status="Reserved"))

        result, status = pay_order_service(12, payment_data=None)

    assert status == 200
    assert result["message"] == "Thanh toán thành công"


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_db_commit_success(mock_db_session, mock_tables, mock_order):
    # Thanh toán thành công phải commit.
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], SimpleNamespace(Status="Reserved"))

    result, status = pay_order_service(13)

    assert status == 200
    assert result["table_status"] == "Available"
    mock_db_session.commit.assert_called_once()
    mock_db_session.rollback.assert_not_called()


@patch("backend.app.api.v1.restaurant.service.Order")
@patch("backend.app.api.v1.restaurant.service.Tables")
@patch("backend.app.api.v1.restaurant.service.db.session")
def test_payment_db_rollback_on_exception(mock_db_session, mock_tables, mock_order):
    # Commit lỗi thì rollback.
    _mock_payment_dependencies(mock_db_session, mock_tables, mock_order, [], SimpleNamespace(Status="Reserved"))
    mock_db_session.commit.side_effect = RuntimeError("db down")

    result, status = pay_order_service(14)

    assert status == 500
    assert result["error"] == "Thanh toán thất bại"
    mock_db_session.rollback.assert_called_once()
