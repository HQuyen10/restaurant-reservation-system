document.body.innerHTML = `
    <h1></h1>

    <table>
        <tbody id="booking-list"></tbody>
    </table>
`;

// IMPORT MODULE
const {
    loadBookings,
    confirmBooking,
    rejectBooking,
    formatDate,
    formatTime
} = require("../static/js/res_confirmbooking");



// MOCK GLOBAL
global.fetch = jest.fn();
global.alert = jest.fn();


// MOCK localStorage
Storage.prototype.getItem = jest.fn((key) => {

    if (key === "token") {
        return "fake_token";
    }

    if (key === "restaurant_name") {
        return "Nhà Hàng ABC";
    }

    return null;
});

// TEST formatDate()
describe("formatDate()", () => {

    test("Format ngày thành công", () => {

        const result = formatDate("2026-05-12 18:30:00");

        expect(result).toBe("2026-05-12");
    });


    test("Format ngày rỗng", () => {

        const result = formatDate(null);

        expect(result).toBe("");
    });

});

// TEST formatTime()
describe("formatTime()", () => {

    test("Format giờ thành công", () => {

        const result = formatTime("2026-05-12 18:30:00");

        expect(result).toBe("18:30");
    });


    test("Format giờ rỗng", () => {

        const result = formatTime(null);

        expect(result).toBe("");
    });

});


// TEST loadBookings()
describe("loadBookings()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });


    test("Load danh sách booking thành công", async () => {

        fetch.mockResolvedValueOnce({
            status: 200,
            json: async () => ([
                {
                    ReservationID: 1,
                    CustomerName: "Nguyen Van A",
                    phone: "0123456789",
                    GuestCount: 4,
                    BookingDate: "2026-05-12 18:30:00",
                    BookingTime: "18:30",
                    TableID: 5,
                    Deposit: 100000,
                    Status: "Pending"
                }
            ])
        });

        await loadBookings();

        expect(
            document.getElementById("booking-list").innerHTML
        ).toContain("Nguyen Van A");

        expect(
            document.querySelector("h1").innerText
        ).toContain("Nhà Hàng ABC");
    });


    test("Hiển thị alert khi token hết hạn", async () => {

        fetch.mockResolvedValueOnce({
            status: 401
        });

        await loadBookings();

        expect(alert).toHaveBeenCalledWith(
            "Hết phiên làm việc, Ngân đăng nhập lại nha!"
        );
    });

});


// TEST confirmBooking()
describe("confirmBooking()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });


    test("Duyệt booking thành công", async () => {

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({})
        });

        await confirmBooking(1);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/bookings/1/confirm"),
            expect.objectContaining({
                method: "POST"
            })
        );
    });

});

// TEST rejectBooking()

describe("rejectBooking()", () => {

    beforeEach(() => {
        fetch.mockClear();
    });


    test("Từ chối booking thành công", async () => {

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({})
        });

        await rejectBooking(1);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/bookings/1/reject"),
            expect.objectContaining({
                method: "POST"
            })
        );
    });

});


// EXTRA BRANCH COVERAGE
describe("res_confirmbooking branch coverage", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <h1></h1>
            <table>
                <tbody id="booking-list"></tbody>
            </table>
        `;
        fetch.mockClear();
        alert.mockClear();
    });


    test("Load danh sách booking rỗng", async () => {
        fetch.mockResolvedValueOnce({
            status: 200,
            json: async () => []
        });

        await loadBookings();

        expect(document.getElementById("booking-list").innerHTML).toBe("");
    });


    test("API trả object không hợp lệ thì không render", async () => {
        fetch.mockResolvedValueOnce({
            status: 200,
            json: async () => ({ message: "invalid" })
        });

        await loadBookings();

        expect(document.getElementById("booking-list").innerHTML).toBe("");
    });


    test("Fetch lỗi thì hiển thị alert", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockRejectedValueOnce(new Error("network down"));

        await loadBookings();

        expect(alert).toHaveBeenCalledWith("Lỗi tải dữ liệu rồi bà ơi!");
        consoleSpy.mockRestore();
    });


    test("Booking thiếu phone vẫn render ổn định", async () => {
        fetch.mockResolvedValueOnce({
            status: 200,
            json: async () => ([{
                ReservationID: 2,
                CustomerName: "Tran B",
                GuestCount: 2,
                BookingDate: "2026-06-01 19:00:00",
                BookingTime: "19:00",
                TableID: 3,
                Deposit: 50000,
                Status: "Confirmed"
            }])
        });

        await loadBookings();

        expect(document.getElementById("booking-list").innerHTML).toContain("Tran B");
        expect(document.getElementById("booking-list").innerHTML).not.toContain("btn confirm");
    });


    test("Click nút confirm gọi đúng flow duyệt", async () => {
        fetch
            .mockResolvedValueOnce({
                status: 200,
                json: async () => ([{
                    ReservationID: 3,
                    CustomerName: "Le C",
                    phone: "090",
                    GuestCount: 2,
                    BookingDate: "2026-06-01 19:00:00",
                    BookingTime: "19:00",
                    TableID: 3,
                    Deposit: 50000,
                    Status: "Pending"
                }])
            })
            .mockResolvedValue({
                status: 200,
                ok: true,
                json: async () => []
            });
        window.confirmBooking = confirmBooking;

        await loadBookings();
        document.querySelector(".btn.confirm").click();
        await Promise.resolve();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/bookings/3/confirm"),
            expect.objectContaining({ method: "POST" })
        );
    });
});
