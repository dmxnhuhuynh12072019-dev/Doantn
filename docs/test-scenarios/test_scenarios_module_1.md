# Kịch bản kiểm thử Module 1 - Chuẩn hóa Khung/Bộ thông số Bảo dưỡng (Maintenance Matrix Standardization)

Tài liệu này cung cấp kịch bản kiểm thử chi tiết từng bước (step-by-step) dành cho **Module 1: Chuẩn hóa Khung/Bộ thông số Bảo dưỡng**, bao gồm cả kiểm thử trực tiếp qua API Endpoints và kiểm thử qua Giao diện Người dùng (Frontend UI).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database SQL Server (`ACOH_DB`) đã nạp dữ liệu mẫu từ `database.sql` và `seed.sql`.
> * Tài khoản test:
>   * Chủ xe: `user@acoh.com` / `user123`
>   * Gara đối tác: `garage@acoh.com` / `garage123`

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND / POSTMAN / SWAGGER)

### Bước 1: Đăng nhập lấy Token xác thực (JWT)

#### 1. Đăng nhập với vai trò Chủ xe (User)
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Header:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "email": "user@acoh.com",
    "password": "user123"
  }
  ```
* **Kết quả:** Trả về HTTP `200 OK` chứa Token. Lưu token này dưới tên `${USER_TOKEN}`.

---

### Bước 2: Kiểm thử các API Chuẩn hóa Khung Bảo Dưỡng (Module 1)

#### 1. Lấy danh sách khung mốc bảo dưỡng và hạng mục chuẩn (Get Categories Matrix)
* **API Route:** `GET http://localhost:3000/api/maintenances/categories?vehicleType=Ô%20tô`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Trả về mảng JSON chứa các mốc số km (5.000 km, 10.000 km, 20.000 km, 75.000 km).
  * Trong mỗi mốc có danh sách `items` chi tiết các công việc kỹ thuật (Thay nhớt, Kiểm tra van, Cảm biến, Áp suất lốp, Nắp cao su, Sục rửa bình xăng...).

#### 2. Lưu bảo dưỡng theo mốc km và checklist được chọn (Save Matrix Checklist)
* **API Route:** `POST http://localhost:3000/api/maintenances/matrix-check`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:**
  ```json
  {
    "vehicleId": 1,
    "odometer": 35500,
    "selectedItemIds": [1, 2, 4],
    "notes": "Kiểm tra định kỳ mốc 5.000km và đọc mã lỗi cảm biến qua OBD-II"
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `201 Created`.
  * Response: `{ "message": "Lưu bảo dưỡng theo mốc km thành công!", "details": "..." }`.
  * Kiểm tra DB: Số Odometer của xe 1 tự động cập nhật lên `35500`, và 1 bản ghi lịch sử sửa chữa mới được thêm vào `MaintenanceHistory`.

---

## PHẦN 2: KIỂM THỬ GIAO DIỆN NGƯỜI DÙNG (FRONTEND UI)

### Kịch bản 1: Kiểm tra Ma trận mốc bảo dưỡng (Maintenance Matrix View)

* **Bước 1:** Mở trình duyệt, truy cập `http://localhost:5173/login`. Đăng nhập bằng `user@acoh.com` / `user123`.
* **Bước 2:** Tại trang Dashboard, click vào thẻ xe Ô tô **Toyota Vios 1.5G** (Biển số: `59A-123.45`).
* **Bước 3:** Đảm bảo tab **📅 Kế hoạch bảo dưỡng** đang mở.
* **Xác nhận:**
  * Khung **📊 Ma Trận Khung Bảo Dưỡng Chuẩn** hiển thị trên cùng.
  * Các mốc 5.000 km, 10.000 km, 20.000 km hiển thị nhãn xanh **✓ Đã qua mốc** (vì Odo hiện tại là 35.200 km).
  * Mốc 75.000 km hiển thị nhãn xanh dương **⚡ Mốc sắp tới**.
  * Dưới mỗi mốc hiển thị danh mục các công việc kỹ thuật chuẩn (Thay nhớt, van, cảm biến, sục rửa bình xăng...).

---

### Kịch bản 2: Thực hiện Tích chọn & Lưu Bảo Dưỡng Theo Mốc Km

* **Bước 1:** Tại khung Ma trận bảo dưỡng, click nút **📋 Tích Chọn Bảo Dưỡng Theo Mốc Km**.
* **Bước 2:** Hộp thoại Modal `PresetOdometerChecklist` xuất hiện.
* **Bước 3:** Tại mục chọn mốc km, chọn mốc **20.000 km**.
* **Bước 4:** Kiểm tra danh sách hạng mục: Tích chọn các mục `Thay lọc gió động cơ & Lọc gió điều hòa` và `Sục rửa bình xăng & Béc phun nhiên liệu`.
* **Bước 5:** Nhập số km thực tế `36000` và điền ghi chú: `Đã thay lọc gió và sục rửa bình xăng định kỳ`.
* **Bước 6:** Click nút **✓ Xác Nhận & Lưu Nhật Ký**.
* **Xác nhận:**
  * Modal tự động đóng lại.
  * Thẻ thông tin xe cập nhật số km mới thành `36,000 km`.
  * Chuyển sang tab **🔧 Nhật ký sửa chữa** -> Xuất hiện dòng nhật ký bảo dưỡng vừa lưu với nội dung chi tiết các hạng mục đã chọn.

---

### Kịch bản 3: Gara chọn nhanh hạng mục bảo dưỡng chuẩn khi ghi sổ

* **Bước 1:** Đăng xuất tài khoản User -> Đăng nhập tài khoản Gara: `garage@acoh.com` / `garage123`.
* **Bước 2:** Tại Garage Dashboard, click nút **🔧 Ghi sổ bảo dưỡng dịch vụ**.
* **Bước 3:** Nhập biển số `59A-123.45` và bấm **Tìm xe**.
* **Bước 4:** Kiểm tra khu vực "Nội dung dịch vụ thực hiện" xuất hiện các nút tag chọn nhanh chuẩn hóa: `+ Thay nhớt máy`, `+ Kiểm tra van & cảm biến`, `+ Sục rửa bình xăng`, `+ Thay nắp cao su`...
* **Bước 5:** Bấm lần lượt các nút tag -> Tên các hạng mục được tự động nối vào ô văn bản nội dung dịch vụ.
* **Bước 6:** Nhập số Odo `36500`, Tổng chi phí `1500000` -> Bấm **Ghi nhận lịch sử**.
* **Xác nhận:** Ghi sổ thành công, chủ xe nhận được thông báo hoàn thành dịch vụ.
