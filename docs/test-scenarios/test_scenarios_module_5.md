# Kịch bản kiểm thử Module 5 - Logic tính toán & Thông báo tự động (Notification Engine)

Tài liệu này cung cấp các kịch bản kiểm thử từng bước (step-by-step) dành cho Module 5, bao gồm cả kiểm thử qua API Endpoints (Backend) và kiểm thử qua giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND)

### Bước 1: Đăng nhập tài khoản Chủ xe (User)
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "user@acoh.com",
    "password": "user123"
  }
  ```
* **Kết quả:** Nhận về JSON chứa `"token": "eyJ..."`. Lưu token này dưới tên `${USER_TOKEN}`.

---

### Bước 2: Kiểm thử luồng API thông báo

#### 1. Lấy danh sách thông báo ban đầu của User
* **API Route:** `GET http://localhost:3000/api/notifications`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về danh sách chứa ít nhất 2 thông báo mẫu từ seed data:
  * "Chào mừng bạn đến với ACOH"
  * "Cảnh báo giấy tờ hết hạn" (Bảo hiểm vật chất xe 59A-123.45 đã quá hạn)

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
  *(Hệ thống phát hiện ra chu kỳ Đăng kiểm định kỳ của xe 59A-123.45 sắp đến hạn nên tự động tạo 1 thông báo mới).*

#### 3. Lấy lại danh sách thông báo sau khi quét
* **API Route:** `GET http://localhost:3000/api/notifications`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Danh sách tăng lên thành 3 thông báo, trong đó thông báo mới nhất ở vị trí đầu tiên:
  * Tiêu đề: `[ACOH] Cảnh báo giấy tờ xe 59A-123.45 sắp hết hạn`
  * Nội dung: báo về giấy tờ Đăng kiểm định kỳ sắp hết hạn vào ngày 31/12/2026.

#### 4. Gara gửi thông báo hoàn tất bảo dưỡng xe cho khách hàng
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
* **Kết quả mong đợi:** HTTP `201 Created`. backend tạo thông báo thành công đồng thời gửi mail thông báo chúc mừng qua hòm thư của khách hàng.

#### 5. Đánh dấu đã đọc một thông báo cụ thể
* Lấy ID của thông báo hoàn tất xe từ danh sách thông báo của User (Ví dụ: `4`).
* **API Route:** `PATCH http://localhost:3000/api/notifications/4/read`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Đã đánh dấu đọc thông báo!" }`. Cột `IsRead` chuyển thành `1` (True).

#### 6. Đánh dấu đọc tất cả các thông báo còn lại
* **API Route:** `PATCH http://localhost:3000/api/notifications/read-all`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Đã đánh dấu đọc tất cả thông báo!" }`. Tất cả thông báo của user chuyển trạng thái đã đọc.

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

### Kịch bản 1: Quét thông báo & Đọc thông báo của Chủ xe

1. Truy cập `http://localhost:5173/login`, đăng nhập với tài khoản `user@acoh.com` / `user123`.
2. Tại Header điều hướng trên cùng, bạn sẽ thấy biểu tượng **Quả chuông thông báo** kèm chấm đỏ và số đếm hiển thị: **"2"** (tương ứng với 2 thông báo chưa đọc trong DB).
3. Nhấp chuột vào quả chuông:
   * Một Dropdown panel hiện ra hiển thị chi tiết 2 thông báo dạng danh sách, các tin chưa đọc sẽ có chấm màu xanh dương nổi bật.
4. Bấm vào nút **"Quét thử"** trong dropdown:
   * Hệ thống hiển thị hộp thoại xác nhận báo: *"Đã kích hoạt quét hệ thống! Phát hiện & tạo thêm 1 thông báo."*
   * **Kết quả mong đợi:** Dropdown tải lại và hiển thị thêm thông báo cảnh báo Đăng kiểm sắp hết hạn ở vị trí đầu tiên. Số lượng unread badge tăng từ **"2"** lên **"3"**.
5. Nhấp chuột vào dòng thông báo mới nhất (Cảnh báo Đăng kiểm):
   * **Kết quả mong đợi:** Chấm xanh dương của tin nhắn đó biến mất (chuyển sang màu xám đã đọc). Số unread badge trên quả chuông giảm từ **"3"** xuống **"2"**.
6. Bấm vào chữ **"Đọc tất cả"** ở đầu dropdown:
   * **Kết quả mong đợi:** Tất cả các tin còn lại chuyển sang màu xám đã đọc. Chấm đỏ và số badge biến mất hoàn toàn trên biểu tượng quả chuông.

---

### Kịch bản 2: Đồng bộ hóa thông báo tức thời khi Gara hoàn tất dịch vụ

1. Đăng xuất tài khoản User. Đăng nhập lại với tài khoản Gara `garage@acoh.com` / `garage123`.
2. Chọn nút **"Ghi nhận bảo dưỡng mới"** ở góc đầu trang:
   * Tìm kiếm xe bằng biển số: `59A-123.45` và bấm **Tìm xe**.
   * Nhập số kilomet: `36500`.
   * Nhập tổng chi phí: `1200000`.
   * Nhập chi tiết dịch vụ: `"Thay dầu nhớt động cơ và kiểm tra hệ thống treo."`
   * Nhấn **Ghi nhận lịch sử**. Hệ thống báo ghi sổ thành công.
3. Đăng xuất tài khoản Gara và đăng nhập lại tài khoản User `user@acoh.com` / `user123`.
4. Quan sát Header ngay khi vừa đăng nhập:
   * **Kết quả mong đợi:** Quả chuông lập tức xuất hiện chấm đỏ chưa đọc số **"1"**.
   * Nhấp chuột vào quả chuông, bạn sẽ thấy tin nhắn mới nhất có tiêu đề: `[ACOH] Thông báo hoàn tất bảo dưỡng xe 59A-123.45` kèm thông tin chi tiết dịch vụ và tên Gara thực hiện.
5. Kiểm tra log backend để xác thực email chúc mừng cũng đã được Nodemailer gửi thành công tới hòm thư của khách hàng.
