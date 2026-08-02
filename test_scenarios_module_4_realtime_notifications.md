# Kịch bản kiểm thử Module 4 - Hệ thống thông báo thời gian thực (Socket.IO Notification Engine)

Tài liệu này cung cấp các kịch bản kiểm thử từng bước (step-by-step) dành cho Module 4, bao gồm cả kiểm thử qua API Endpoints (Backend), kiểm thử kết nối Socket.IO thời gian thực, và kiểm thử giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000` (Socket.IO chạy cùng cổng)
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.
> * Các tài khoản test mẫu:
>   * **Chủ xe (User):** `user@acoh.com` / `user123`
>   * **Gara (Garage):** `garage@acoh.com` / `garage123`

---

## PHẦN 1: KIỂM THỬ TỰ ĐỘNG BẰNG SCRIPT (AUTOMATED SOCKET TEST)

Hệ thống đã chuẩn bị sẵn một script Node.js dùng để kiểm thử kết nối Socket.IO thời gian thực, kết nối phòng (Room), nhận sự kiện push real-time và đo lường số đếm tin nhắn chưa đọc.

### 1. File Script Kiểm thử (`test_socket.js`)
Bạn có thể tìm thấy file này tại thư mục gốc của dự án: [test_socket.js](file:///d:/DOANTOTNGHIEP/test_socket.js).

### 2. Cách chạy Script kiểm thử:
Mở một Terminal mới tại thư mục gốc dự án và chạy lệnh sau:
```bash
node test_socket.js
```

### 3. Kết quả mong đợi (Console Output):
```text
=== LOGIN ===
User: Nguyễn Văn Người Dùng | Role: User

=== CONNECTING TO SOCKET.IO ===
✅ Socket.IO connected! Socket ID: [Socket_ID_Ngẫu_Nhiên]
📡 Joined room: user_3

=== TRIGGERING TEST NOTIFICATION ===
Trigger result: Đã chạy quét hệ thống thành công! | New notifications: 1

🔔 REAL-TIME NOTIFICATION RECEIVED:
  Title: [ACOH] Cảnh báo giấy tờ xe 59A-123.45 sắp hết hạn
  Message: Chào Nguyễn Văn Người Dùng, ...

🔢 UNREAD COUNT UPDATED: 3

=== TEST COMPLETE ===
```

---

## PHẦN 2: KIỂM THỬ API TRỰC TIẾP (BACKEND REST API)

### Bước 1: Đăng nhập để lấy Token
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "user@acoh.com",
    "password": "user123"
  }
  ```
* **Kết quả:** Trả về mã JWT Token. Lưu lại giá trị này dưới tên `${USER_TOKEN}`.

### Bước 2: Kiểm thử luồng API thông báo
#### 1. Lấy danh sách thông báo ban đầu của User
* **API Route:** `GET http://localhost:3000/api/notifications`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về danh sách thông báo mẫu từ seed data.

#### 2. Kích hoạt quét tự động (Cron Job giả lập) để tìm xe/giấy tờ sắp tới hạn
* **API Route:** `POST http://localhost:3000/api/notifications/trigger-cron`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về phản hồi:
  ```json
  {
    "message": "Đã chạy quét hệ thống thành công!",
    "newNotificationsCount": 1
  }
  ```
  *(Hệ thống tự động phát hiện ra chu kỳ Đăng kiểm định kỳ sắp hết hạn để tạo 1 thông báo mới).*

#### 3. Gara gửi thông báo hoàn tất bảo dưỡng xe cho khách hàng
* Đăng nhập với tài khoản Gara (`garage@acoh.com` / `garage123`), lấy token và lưu dưới tên `${GARAGE_TOKEN}`.
* **API Route:** `POST http://localhost:3000/api/notifications/send-completion`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "vehicleId": 1,
    "garageId": 1,
    "details": "Đã thay nhớt máy Castrol Edge và thay má phanh trước."
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Backend tạo thông báo thành công đồng thời gửi mail thông báo chúc mừng qua hòm thư của khách hàng.

#### 4. Đánh dấu đã đọc một thông báo cụ thể
* **API Route:** `PATCH http://localhost:3000/api/notifications/${NOTIFICATION_ID}/read`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Đã đánh dấu đọc thông báo!" }`.

#### 5. Đánh dấu đọc tất cả các thông báo còn lại
* **API Route:** `PATCH http://localhost:3000/api/notifications/read-all`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Đã đánh dấu đọc tất cả thông báo!" }`.

---

## PHẦN 3: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND UI/UX)

### Kịch bản 1: Nhận thông báo Quét hệ thống (In-app Notification Dropdown)

1. Truy cập `http://localhost:5173/login`, đăng nhập với tài khoản `user@acoh.com` / `user123`.
2. Tại Header điều hướng trên cùng, bạn sẽ thấy biểu tượng **Quả chuông thông báo** kèm chấm đỏ và số đếm hiển thị: **"2"** (hoặc số lượng chưa đọc hiện tại).
3. Nhấp chuột vào quả chuông:
   * Một Dropdown panel hiện ra hiển thị chi tiết các thông báo dạng danh sách, các tin chưa đọc sẽ có chấm màu xanh dương nổi bật bên cạnh.
4. Bấm vào nút **"Quét thử"** trong dropdown:
   * Hệ thống hiển thị hộp thoại xác nhận báo: *"Đã kích hoạt quét hệ thống! Phát hiện & tạo thêm X thông báo."*
   * **Kết quả mong đợi:** Dropdown tải lại và hiển thị thêm thông báo cảnh báo Đăng kiểm sắp hết hạn ở vị trí đầu tiên. Số lượng unread badge tăng lên tương ứng.
5. Nhấp chuột vào dòng thông báo mới nhất (Cảnh báo Đăng kiểm):
   * **Kết quả mong đợi:** Chấm xanh dương của tin nhắn đó biến mất (chuyển sang màu xám đã đọc). Số unread badge trên quả chuông giảm xuống.
6. Bấm vào chữ **"Đọc tất cả"** ở đầu dropdown:
   * **Kết quả mong đợi:** Tất cả các tin còn lại chuyển sang màu xám đã đọc. Chấm đỏ và số badge biến mất hoàn toàn trên biểu tượng quả chuông.

---

### Kịch bản 2: Đồng bộ hóa thông báo tức thời khi Gara hoàn tất dịch vụ

1. Mở song song **2 cửa sổ trình duyệt**:
   * **Cửa sổ 1 (Trình duyệt thường):** Đăng nhập tài khoản **Chủ xe** (`user@acoh.com`).
   * **Cửa sổ 2 (Trình duyệt ẩn danh):** Đăng nhập tài khoản **Gara** (`garage@acoh.com`).
2. Ở cửa sổ **Gara**, truy cập vào mục duyệt lịch hẹn hoặc sửa chữa:
   * Tìm xe của Chủ xe (ví dụ xe biển số `59A-123.45`).
   * Nhấp chọn nút **"Xác nhận hoàn tất bảo dưỡng"**.
   * Nhập các thông tin dịch vụ, nhập tổng chi phí, bấm xác nhận hoàn tất.
3. Chuyển sang quan sát ngay cửa sổ **Chủ xe** (không được bấm tải lại trang):
   * **Kết quả mong đợi:** 
     1. Một Popup **Toast Notification** màu xanh lá lập tức bật lên ở góc màn hình hiển thị: `[ACOH] Thông báo hoàn tất bảo dưỡng xe 59A-123.45`.
     2. Hệ thống phát ra **âm thanh báo hiệu** (tone kép ngắn) nhẹ nhàng.
     3. Biểu tượng **Quả chuông thông báo** ở góc trên bên phải lập tức nhấp nháy/nhảy số đếm thông báo chưa đọc.
     4. Nhấp vào quả chuông sẽ thấy thông báo hoàn tất dịch vụ hiển thị ở đầu danh sách.
