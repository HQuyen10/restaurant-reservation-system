/**
 * UNIT TEST
 * File: res_orders.test.js
 *
 * Chức năng test:
 * - addItem()
 * - changeQty()
 * - renderOrder()
 * - createOrder()
 * - payOrder()
 * - loadMenu()
 */

// MOCK DOM

document.body.innerHTML = `
    <div id="menu-list"></div>
    <ul id="order-list"></ul>
    <span id="total"></span>
    <div id="table-id"></div>
`;


// MOCK URL PARAM
window.history.pushState(
    {},
    "",
    "/orders.html?table_id=1"
);
// IMPORT MODULE
const {
    addItem,
    changeQty,
    renderOrder,
    createOrder,
    payOrder,
    loadMenu
} = require("../static/js/res_orders");


// MOCK GLOBAL
global.fetch = jest.fn();
global.alert = jest.fn();
global.confirm = jest.fn();


// MOCK localStorage
Storage.prototype.getItem = jest.fn((key) => {

    if (key === "token") {
        return "fake_token";
    }

    return null;
});

Storage.prototype.setItem = jest.fn();

Storage.prototype.removeItem = jest.fn();

// TEST addItem()
describe("addItem()", () => {

    test("Thêm món mới vào order", () => {

        addItem("F1", "Cơm chiên", 50000, "img.jpg");

        expect(
            document.getElementById("order-list").innerHTML
        ).toContain("Cơm chiên");
    });


    test("Tăng số lượng khi món đã tồn tại", () => {

        addItem("F1", "Cơm chiên", 50000, "img.jpg");

        expect(
            document.getElementById("order-list").innerHTML
        ).toContain("2");
    });

});


// TEST changeQty()
describe("changeQty()", () => {

    test("Tăng số lượng món", () => {

        changeQty("F1", 1);

        expect(
            document.getElementById("order-list").innerHTML
        ).toContain("3");
    });


    test("Giảm số lượng món", () => {

        changeQty("F1", -1);

        expect(
            document.getElementById("order-list").innerHTML
        ).toContain("2");
    });

});


// TEST renderOrder()
describe("renderOrder()", () => {

    test("Hiển thị tổng tiền", () => {

        renderOrder();

        expect(
            document.getElementById("total").innerText
        ).not.toBe("");
    });

});


// TEST loadMenu()
describe("loadMenu()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });
    test("Load menu thành công", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                {
                    id: "F1",
                    name: "Pizza",
                    price: 100000,
                    image: "pizza.jpg"
                }
            ])
        });

        await loadMenu();
        expect(
            document.getElementById("menu-list").innerHTML
        ).toContain("Pizza");
    });

});


// TEST createOrder()
describe("createOrder()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });


    test("Tạo order thành công", async () => {

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: "Success"
            })
        });

        await createOrder();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/orders"),
            expect.objectContaining({
                method: "POST"
            })
        );

        expect(alert).toHaveBeenCalledWith("Đã gửi order");
    });


    test("Tạo order thất bại", async () => {

        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                message: "Error"
            })
        });

        await createOrder();

        expect(alert).toHaveBeenCalledWith("Lỗi gửi order");
    });

});


// TEST payOrder()
describe("payOrder()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });


    test("Thanh toán thành công", async () => {

        confirm.mockReturnValue(true);

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: "Paid"
            })
        });

        await payOrder();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/orders/pay/1"),
            expect.objectContaining({
                method: "PUT"
            })
        );

        expect(alert).toHaveBeenCalledWith(
            "Thanh toán thành công"
        );
    });


    test("User hủy thanh toán", async () => {

        confirm.mockReturnValue(false);

        await payOrder();

        expect(fetch).not.toHaveBeenCalled();
    });


    test("Thanh toán thất bại", async () => {

        confirm.mockReturnValue(true);

        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                message: "Fail"
            })
        });

        await payOrder();

        expect(alert).toHaveBeenCalledWith(
            "Lỗi thanh toán"
        );
    });

});


// EXTRA BRANCH COVERAGE
function loadFreshOrderModule(cartValue = null) {
    jest.resetModules();
    document.body.innerHTML = `
        <div id="menu-list"></div>
        <ul id="order-list"></ul>
        <span id="total"></span>
        <div id="table-id"></div>
    `;
    window.history.pushState({}, "", "/orders.html?table_id=1");
    global.fetch = jest.fn();
    global.alert = jest.fn();
    global.confirm = jest.fn();
    Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake_token";
        if (key === "cart_table_1") return cartValue;
        return null;
    });
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    return require("../static/js/res_orders");
}


describe("res_orders branch coverage", () => {

    test("Tạo order khi chưa có món", async () => {
        const fresh = loadFreshOrderModule();

        await fresh.createOrder();

        expect(alert).toHaveBeenCalledWith("Chưa có món");
        expect(fetch).not.toHaveBeenCalled();
    });


    test("Load menu rỗng không render món", async () => {
        const fresh = loadFreshOrderModule();
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await fresh.loadMenu();

        expect(document.getElementById("menu-list").textContent).toContain("Không có món hoặc lỗi");
    });


    test("Load menu bị lỗi fetch không crash", async () => {
        const fresh = loadFreshOrderModule();
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockRejectedValueOnce(new Error("network down"));

        await fresh.loadMenu();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });


    test("Load order từ server thành công", async () => {
        const fresh = loadFreshOrderModule();
        fetch.mockResolvedValueOnce({
            json: async () => ({
                items: [{ food_id: "F2", name: "Phở", price: 40000, qty: 2 }]
            })
        });

        await fresh.loadOrderFromServer();

        expect(document.getElementById("order-list").innerHTML).toContain("Phở");
        expect(Storage.prototype.setItem).toHaveBeenCalled();
    });


    test("Load order lỗi thì fallback từ localStorage", async () => {
        const fresh = loadFreshOrderModule(JSON.stringify([
            { food_id: "F3", name: "Bún", price: 30000, qty: 1 }
        ]));
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        fetch.mockRejectedValueOnce(new Error("server down"));

        await fresh.loadOrderFromServer();

        expect(document.getElementById("order-list").innerHTML).toContain("Bún");
        consoleSpy.mockRestore();
    });


    test("Window onload ưu tiên giỏ hàng localStorage", async () => {
        loadFreshOrderModule(JSON.stringify([
            { food_id: "F4", name: "Mì", price: 25000, qty: 1 }
        ]));
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await window.onload();

        expect(document.getElementById("order-list").innerHTML).toContain("Mì");
    });
});
