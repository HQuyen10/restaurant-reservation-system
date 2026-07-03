const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Kiểm tra mật khẩu có khớp nhau không
        const pass = document.getElementById('pass').value;
        const confirmPass = document.getElementById('confirm_pass').value;

        if (pass !== confirmPass) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        // 2. Lấy data
        const formData = new FormData(registerForm);
        const username = document.getElementById('user').value;
        const password = pass;
        const role = document.getElementById('roleSelect').value;
        const restaurant_id = document.getElementById('restaurantSelect').value;

        // Đảm bảo restaurant_id được xử lý đúng
        const resId = document.getElementById('restaurantSelect').value;
        if (resId && resId !== "") {
            formData.set('restaurant_id', resId);
        } else {
            formData.delete('restaurant_id');
        }


        try {
            const response = await fetch('http://127.0.0.1:5000/api/v1/auth/registerRequest', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert("Chúc mừng! Đăng ký thành công.");
                window.location.href = "login.html"; // Đăng ký xong cho qua trang Login
            } else {
                alert("Lỗi đăng ký: " + (result.message || "Vui lòng kiểm tra lại"));
            }

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Không kết nối được với Server Flask!");
        }
    });

    // Hàm ẩn/hiện ô chọn nhà hàng dựa vào Role
    async function toggleRestaurantDropdown() {
        const roleSelect = document.getElementById("roleSelect");
        if (!roleSelect) return;

        const role = roleSelect.value;
        const resDiv = document.getElementById("restaurantDiv");
        const select = document.getElementById("restaurantSelect");

        if (role === "STAFF") {
            resDiv.style.display = "block";

            // Chỉ load nếu dropdown đang trống (để tránh load đi load lại)
            if (select.options.length <= 1) {
                try {
                    // Gọi API lấy danh sách nhà hàng đã được duyệt
                    const res = await fetch("http://127.0.0.1:5000/api/v1/restaurant/list");
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        data.forEach(r => {
                            const option = document.createElement("option");
                            option.value = r.id; // ID này sẽ khớp với RestaurantID trong DB
                            option.textContent = r.name;
                            select.appendChild(option);
                        });
                    }
                } catch (err) {
                    console.error("Không lấy được danh sách nhà hàng:", err);
                }
            }
        } else {
            resDiv.style.display = "none";
        }
    }
}

if (typeof window !== 'undefined') {
    window.toggleRestaurantDropdown = toggleRestaurantDropdown;
}

if (typeof module !== 'undefined') {
    module.exports = {
        toggleRestaurantDropdown
    };
}
