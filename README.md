# HỆ THỐNG ĐẶT BÀN NHÀ HÀNG
## Mô tả
Hệ Thống Đặt Bàn Nhà Hàng là ứng dụng web hỗ trợ khách hàng tìm kiếm nhà hàng, xem menu, đặt bàn trực tuyến và hỗ trợ nhà hàng quản lý hoạt động kinh doanh trên cùng một nền tảng.

Hệ thống được xây dựng theo mô hình client-server với:

Frontend: HTML, CSS, JavaScript
Backend: Flask Python REST API
Database: MySQL
Authentication: JWT (JSON Web Token)

Ngoài việc phát triển chức năng, project còn tập trung vào kiểm thử phần mềm gồm:

Manual Testing
Unit Test Backend bằng Pytest
Unit Test Frontend bằng Jest + jsdom
Automation Test bằng Playwright

## Công nghệ sử dụng
- Frontend: HTML, CSS, JavaScript
- Backend: Flask Python, SQLAlchemy, Flask-JWT-Extended
- Database: MySQL

## Cài đặt và chạy
1. Clone project
git clone <repository-url>
cd restaurantbooking

2. Cài đặt backend
cd backend
pip install -r requirements.txt

Chạy backend
python -m backend.run


3. Cài đặt frontend
cd frontend
npm install

Chạy frontend: python -m http.server 5500 --directory frontend


4. Cài đặt cấu hình database theo các bước sau:
- Tạo một cơ sở dữ liệu trống trong MySQL với tên: `RESTAURANT_BOOKING`
- Import (Nhập) file cơ sở dữ liệu từ project:
   - Sử dụng file `RESTAURANT_BOOKING.sql` có sẵn trong thư mục gốc của project này để import vào database vừa tạo.
- Cấu hình lại thông tin kết nối (Host, User, Password) trong file code (ví dụ: file `app.py` hoặc `.env`) sao cho khớp với cấu hình MySQL trên máy của thầy.


6. Chạy hệ thống bằng script:
- Windows: ./run.bat
- Linux/Git bash: ./run.sh

## Truy cập
Backend: http://127.0.0.1:5000
Frontend: http://127.0.0.1:5500

## Demo
https://drive.google.com/file/d/1o33DldqAxQluJ0doJ37NZUAnhz-SNU45/view?usp=drive_link

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database design](docs/database-design.md)
- [Test Plan](docs/testplan.md)
- [API Documentation](docs/api-docs.md)
