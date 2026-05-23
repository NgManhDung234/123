# Hướng Dẫn Chạy Dự Án

File này hướng dẫn từng bước để cài thư viện, setup database MySQL và chạy dự án.

## 1. Yêu cầu cần cài trước

Trước khi chạy dự án, máy cần có:

- **Node.js**: khuyến nghị dùng Node.js 16.x
- **Yarn** hoặc **npm**
- **MySQL Server**
- **MySQL Workbench** hoặc terminal MySQL để chạy file SQL

Kiểm tra Node.js:

```bash
node -v
```

Kiểm tra Yarn:

```bash
yarn -v
```

Nếu chưa có Yarn, cài bằng npm:

```bash
npm install -g yarn
```

## 2. Mở thư mục dự án

Mở terminal tại thư mục gốc của dự án:

```bash
d:\btl ltw
```

Nếu dùng VS Code hoặc Windsurf, chỉ cần mở đúng folder dự án này.

## 3. Cài thư viện cho dự án

Chạy lệnh:

```bash
yarn install
```

Nếu không dùng Yarn, có thể dùng:

```bash
npm install
```

Lưu ý: dự án này dùng Ant Design Pro, Umi, React, Express, MySQL và một số thư viện backend như `bcrypt`, `jsonwebtoken`, `mysql2`.

## 4. Cấu hình file môi trường `.env`

Trong thư mục gốc dự án cần có file:

```text
.env
```

Kiểm tra hoặc thêm các biến sau:

```env
# Cấu hình App
APP_CONFIG_APP_VERSION=231130
APP_CONFIG_TEN_TRUONG='VIỆN KHOA HỌC KỸ THUẬT BƯU ĐIỆN'
APP_CONFIG_TIEN_TO_TRUONG='Học viện'
APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH=RIPT
APP_CONFIG_PRIMARY_COLOR=#CC0D00

# Cấu hình Backend
BACKEND_PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=student_app
DB_PASSWORD=student_app_password
DB_NAME=student_management
JWT_SECRET=student_management_secret_key

# Cấu hình Gmail SMTP (cho chức năng quên mật khẩu)
GMAIL_EMAIL=ltw-group@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

Ý nghĩa:

- **APP_CONFIG_***: cấu hình ứng dụng (tên trường, màu theme, version)
- **BACKEND_PORT**: cổng chạy backend Express
- **DB_HOST**: địa chỉ MySQL
- **DB_PORT**: cổng MySQL, mặc định là 3306
- **DB_USER**: user MySQL dùng cho app
- **DB_PASSWORD**: mật khẩu user MySQL
- **DB_NAME**: tên database
- **JWT_SECRET**: khóa bí mật để tạo token đăng nhập
- **GMAIL_EMAIL**: tài khoản Gmail để gửi email reset mật khẩu
- **GMAIL_APP_PASSWORD**: App Password của Gmail (xem hướng dẫn tạo bên dưới)

## 4.1 Tạo App Password Gmail (cho chức năng quên mật khẩu)

Để sử dụng chức năng quên mật khẩu, cần tạo App Password cho Gmail:

**Bước 1: Truy cập Google Account**
- Vào: https://myaccount.google.com/
- Đăng nhập bằng tài khoản Gmail muốn dùng

**Bước 2: Bật 2-Step Verification**
- Chọn **Security** (Bảo mật)
- Bật **2-Step Verification** (Xác thực 2 bước) nếu chưa bật

**Bước 3: Tạo App Password**
- Trong trang Security, tìm **App passwords** (Mật khẩu ứng dụng)
- Hoặc truy cập trực tiếp: https://myaccount.google.com/apppasswords
- Chọn:
  - **Select app**: Mail
  - **Select device**: Other (Custom name)
  - Nhập tên: "Student Management"
- Nhấn **Generate**

**Bước 4: Copy App Password**
- Google sẽ hiển thị password 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)
- Copy password này

**Bước 5: Cập nhật .env**
```
GMAIL_EMAIL=email_cua_ban@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  (password 16 ký tự vừa tạo)
```

**Lưu ý:**
- Nếu làm dự án nhóm, nên tạo 1 Gmail chung cho nhóm
- Không chia sẻ App Password cho người ngoài
- Mật khẩu mới khi reset không được trùng với mật khẩu cũ

## 5. Setup database MySQL

Dự án đã có sẵn file SQL khởi tạo database tại:

```text
src/backend/database/init.sql
```

File này dùng để:

- Tạo database `student_management`
- Tạo user MySQL `student_app`
- Cấp quyền cho user
- Tạo bảng `roles`
- Tạo bảng `users`
- Tạo bảng `password_reset_tokens` (cho chức năng quên mật khẩu)
- Thêm dữ liệu mẫu cho quản lí và sinh viên

### Cách 1: Chạy bằng terminal MySQL

Mở terminal tại thư mục gốc dự án, sau đó chạy:

```bash
mysql -u root -p < src/backend/database/init.sql
```

Sau đó nhập mật khẩu MySQL root của bạn.

### Cách 2: Chạy bằng MySQL Workbench

Làm theo các bước:

1. Mở MySQL Workbench
2. Đăng nhập bằng tài khoản root
3. Mở file:

```text
src/backend/database/init.sql
```

4. Bấm nút chạy toàn bộ script
5. Kiểm tra database `student_management` đã được tạo

## 6. Tài khoản mẫu sau khi setup database

Sau khi chạy file `init.sql`, có thể đăng nhập bằng các tài khoản mẫu sau.

### Tài khoản quản lí

```text
username: manager01
password: manager123
```

Sau khi đăng nhập sẽ vào:

```text
/manager
```

### Tài khoản sinh viên

```text
username: student01
password: student123
```

Sau khi đăng nhập sẽ vào:

```text
/student
```

## 7. Chạy backend

Mở terminal thứ nhất tại thư mục gốc dự án và chạy:

```bash
yarn start:backend
```

Nếu không dùng Yarn:

```bash
npm run start:backend
```

Nếu chạy thành công sẽ thấy thông báo tương tự:

```text
Backend server đang chạy tại http://localhost:5000
```

Có thể kiểm tra backend bằng đường dẫn:

```text
http://localhost:5000/api/database/health
```

Nếu kết nối database tốt, backend sẽ trả về trạng thái thành công.

## 8. Chạy frontend

Mở terminal thứ hai tại thư mục gốc dự án và chạy:

```bash
yarn start
```

Nếu không dùng Yarn:

```bash
npm run start
```

Khi chạy thành công, terminal sẽ hiển thị địa chỉ frontend, ví dụ:

```text
http://localhost:8000
```

Hoặc có thể là:

```text
http://localhost:8001
http://localhost:8002
http://localhost:8003
```

Tùy cổng nào đang trống trên máy.

## 9. Mở trang đăng nhập

Truy cập đường dẫn:

```text
http://localhost:8000/user/login
```

Nếu frontend chạy ở cổng khác, thay `8000` bằng cổng đang hiển thị trong terminal.

Ví dụ:

```text
http://localhost:8003/user/login
```

## 10. Chức năng quên mật khẩu

Dự án có tích hợp chức năng quên mật khẩu:

### Cách hoạt động
1. User vào trang `/user/forgot-password`
2. Nhập email đã đăng ký
3. Hệ thống gửi email chứa link reset mật khẩu
4. User click link trong email → vào trang `/user/reset-password?token=xxx`
5. User nhập mật khẩu mới
6. Mật khẩu được cập nhật vào database

### Yêu cầu
- Đã cấu hình Gmail SMTP trong `.env`
- Đã tạo bảng `password_reset_tokens` (được tạo trong `init.sql`)
- App Password Gmail đã được tạo và cấu hình

### Lưu ý
- Token reset có hiệu lực trong 1 giờ
- Mật khẩu mới không được trùng với mật khẩu cũ
- Link reset chỉ dùng được 1 lần

## 11. Luồng đăng ký và đăng nhập

### Đăng ký tài khoản mới

Vào:

```text
/user/register
```

Người dùng tự đăng ký sẽ luôn được tạo với quyền:

```text
student
```

Tài khoản tự đăng ký không thể tự chọn quyền quản lí.

**Lưu ý:** Đây là web tuyển sinh, không yêu cầu mã sinh viên khi đăng ký. Mã sinh viên là trường tùy chọn trong database.

### Đăng nhập

Vào:

```text
/user/login
```

Sau khi đăng nhập:

- Nếu user có role `manager` thì chuyển đến `/manager`
- Nếu user có role `student` thì chuyển đến `/student`

## 12. Cấu trúc quan trọng của dự án

### Frontend

```text
src/frontend/pages/user/Login
src/frontend/pages/user/Register
src/frontend/pages/user/ForgotPassword
src/frontend/pages/Manager
src/frontend/pages/Student
src/frontend/services/auth.ts
src/frontend/utils/auth.ts
```

### Backend

```text
src/backend/index.ts
src/backend/routes/auth.routes.ts
src/backend/routes/database.routes.ts
src/backend/services/auth.service.ts
src/backend/config/database.ts
src/backend/types/auth.ts
src/backend/database/init.sql
```

## 13. Một số lỗi thường gặp

### Lỗi không kết nối được database

Kiểm tra lại file `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=student_app
DB_PASSWORD=student_app_password
DB_NAME=student_management
```

Sau đó đảm bảo đã chạy file:

```text
src/backend/database/init.sql
```

### Lỗi port đã được sử dụng

Nếu frontend hoặc backend báo port đã được dùng, hãy tắt terminal cũ hoặc đổi port.

Backend đang dùng:

```text
5000
```

Frontend thường dùng:

```text
8000, 8001, 8002, 8003
```

### Lỗi đăng nhập thất bại

Kiểm tra:

1. Backend đã chạy chưa
2. MySQL đã chạy chưa
3. Đã chạy `init.sql` chưa
4. Tài khoản/mật khẩu nhập đúng chưa
5. File `.env` đã đúng thông tin database chưa

### Lỗi gửi email thất bại

Kiểm tra:

1. Đã cấu hình Gmail SMTP trong `.env` chưa
2. Đã tạo App Password Gmail chưa
3. App Password có đúng không
4. Tài khoản Gmail có bật 2-Step Verification chưa

## 14. Thứ tự chạy chuẩn mỗi lần mở dự án

Mỗi lần muốn chạy dự án, làm theo thứ tự:

1. Mở MySQL Server
2. Mở terminal dự án
3. Chạy backend:

```bash
yarn start:backend
```

4. Mở terminal khác
5. Chạy frontend:

```bash
yarn start
```

6. Mở trình duyệt vào:

```text
http://localhost:8000/user/login
```

Nếu frontend hiển thị cổng khác thì dùng cổng đó.

## 15. Ghi chú

- File SQL chỉ cần chạy lần đầu hoặc khi muốn reset database.
- Backend và frontend phải chạy cùng lúc thì chức năng đăng nhập/đăng ký mới hoạt động đầy đủ.
- Không nên hardcode mật khẩu thật vào code, chỉ nên để trong `.env`.
