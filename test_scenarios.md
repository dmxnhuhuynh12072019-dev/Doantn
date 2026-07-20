# Kịch bản kiểm thử Module 3 - Quản lý bảo dưỡng & Sửa chữa (Maintenance Management)

Tài liệu này cung cấp các kịch bản kiểm thử từng bước (step-by-step) dành cho Module 3, bao gồm cả kiểm thử qua API Endpoints (dành cho Postman/Thunder Client) và kiểm thử qua giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND)

### Bước 1: Đăng nhập để lấy Token

#### 1. Đăng nhập với vai trò Chủ xe (User)
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "user@acoh.com",
    "password": "user123"
  }
  ```
* **Kết quả:** Nhận về JSON chứa `"token": "eyJ..."`. Lưu token này dưới tên `${USER_TOKEN}`.

#### 2. Đăng nhập với vai trò Chủ Gara (Garage)
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "garage@acoh.com",
    "password": "garage123"
  }
  ```
* **Kết quả:** Nhận về JSON chứa `"token": "eyJ..."`. Lưu token này dưới tên `${GARAGE_TOKEN}`.

---

### Bước 2: Kiểm thử tính năng Lập lịch nhắc bảo dưỡng (Schedules)

#### 1. Lấy danh sách lịch nhắc của xe (User gọi)
* **API Route:** `GET http://localhost:3000/api/maintenances/schedules/1` (Xe Toyota Vios có ID = 1)
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về danh sách 2 lịch nhắc mẫu từ seed data (Thay nhớt máy và Đảo lốp xe).

#### 2. Tạo lịch nhắc bảo dưỡng mới (User gọi)
* **API Route:** `POST http://localhost:3000/api/maintenances/schedules`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "vehicleId": 1,
    "categoryName": "Bảo dưỡng hệ thống điều hòa",
    "targetOdometer": 45000,
    "targetDate": "2026-12-01",
    "alertThresholdKM": 500,
    "notes": "Kiểm tra gas lạnh và thay lọc gió điều hòa."
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Nhận về `{ "message": "Tạo lịch nhắc bảo dưỡng thành công!", "scheduleId": 4 }`.

#### 3. Cập nhật lịch nhắc sang Đã hoàn thành (User gọi)
* **API Route:** `PUT http://localhost:3000/api/maintenances/schedules/4`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "status": "Đã hoàn thành",
    "notes": "Đã làm sớm tại Gara quận 5."
  }
  ```
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Cập nhật lịch nhắc bảo dưỡng thành công!" }`.

#### 4. Thử cập nhật lịch nhắc của xe người khác (Bảo mật)
* Đăng ký tài khoản mới khác, lấy token, sau đó gọi `PUT` hoặc `DELETE` tới `/api/maintenances/schedules/4`.
* **Kết quả mong đợi:** HTTP `403 Forbidden` - Hệ thống chặn và báo lỗi phân quyền.

---

### Bước 3: Kiểm thử tính năng Ghi sổ bảo dưỡng và xem lịch sử (History)

#### 1. Gara tra cứu xe khách hàng theo biển số xe
* **API Route:** `GET http://localhost:3000/api/maintenances/vehicles/search?licensePlate=59A-123.45`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về thông tin xe Toyota Vios: `Brand: "Toyota", Model: "Vios 1.5G", CurrentOdometer: 35200`.

#### 2. Gara ghi nhận lịch sử sửa chữa
* **API Route:** `POST http://localhost:3000/api/maintenances/history/garage`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "vehicleId": 1,
    "executionDate": "2026-07-17",
    "executionOdometer": 36000,
    "totalCost": 1800050,
    "details": "Thay nhớt máy Castrol, Vệ sinh lọc gió động cơ và đảo lốp xe."
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Nhận về `{ "message": "Ghi sổ lịch sử bảo dưỡng thành công!" }`.
* **Kiểm chứng tự động của BE:**
  * Odometer của xe Toyota Vios (ID = 1) tự động tăng từ `35200` lên `36000` (được cập nhật vì Odo ghi sổ `36000 > 35200`).
  * Lịch nhắc bảo dưỡng có category hoặc nội dung chứa chữ "Đảo lốp xe" (ScheduleID = 2 trong seed) tự động được chuyển trạng thái sang `Đã hoàn thành`.

#### 3. User xem lại lịch sử sửa chữa của xe mình
* **API Route:** `GET http://localhost:3000/api/maintenances/history/1`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về mảng chứa cả lịch sử cũ (từ seed) và hóa đơn dịch vụ mới do Gara vừa ghi ở trên, có kèm tên Gara thực hiện.

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

### Kịch bản 1: Chủ xe quản lý bảo dưỡng xe cá nhân

1. Truy cập `http://localhost:5173/login`, đăng nhập với tài khoản `user@acoh.com` / `user123`.
2. Tại trang chủ **Góc Quản lý Phương tiện**, bạn sẽ thấy danh sách xe. Nhấp vào nút **"Xem bảo dưỡng"** trên thẻ xe **Toyota Vios 1.5G**.
3. Hệ thống sẽ mở trang chi tiết của xe:
   * **Xác thực:** Bạn thấy đầy đủ biển số xe `59A-123.45` và số km hiện tại là `35,200 km`.
4. Nhấp vào Tab **"Kế hoạch bảo dưỡng"**:
   * Kiểm tra xem danh sách lịch nhắc mẫu có hiển thị không.
   * Lịch nhắc "Thay nhớt máy" mốc 40k km hiển thị trạng thái *"Còn 4,800 km"* màu xám.
   * Lịch nhắc "Đảo lốp xe & cân mâm" mốc 38k km hiển thị trạng thái *"Còn 2,800 km"* màu xám.
5. Nhấp nút **"Thêm lịch nhắc mới"**:
   * Hạng mục: Nhập `"Thay má phanh"`
   * Số km bảo dưỡng: Nhập `35300` (Gần số km hiện tại)
   * Nhấp **Tạo lịch nhắc**.
   * **Xác nhận:** Lịch nhắc mới lập tức hiển thị trên màn hình với nhãn cảnh báo màu cam nổi bật: *"Còn 100 km"* (do chênh lệch so với Odo hiện tại nhỏ hơn ngưỡng 500 km).
6. Nhấp nút **"Đã xong ✓"** trên dòng lịch nhắc mới thêm:
   * Xác nhận hộp thoại của trình duyệt.
   * **Xác nhận:** Trạng thái của lịch nhắc chuyển ngay sang *"Đã hoàn thành"* kèm nền màu xanh lá cây, nút "Đã xong ✓" biến mất.
7. Chuyển sang Tab **"Nhật ký sửa chữa"**:
   * Xác nhận dòng lịch sử cũ mốc ngày `10/01/2026` chi phí `1.500.000 ₫` được hiển thị rõ ràng trên Timeline.

---

### Kịch bản 2: Gara ghi sổ sửa chữa cho xe khách hàng

1. Đăng xuất tài khoản User. Đăng nhập lại với tài khoản Gara `garage@acoh.com` / `garage123`.
2. Hệ thống chuyển hướng bạn đến màn hình **Bảng quản lý dịch vụ** của Gara:
   * Có thanh công cụ **Tra cứu biển số xe** bên trái và bảng **Nhật ký sửa chữa của xe** bên phải.
3. Thử tìm kiếm biển số xe chưa từng làm dịch vụ tại Gara này (ví dụ: `59B-678.90`):
   * Nhập vào ô tìm kiếm `59B-678.90` và nhấn **Tìm**.
   * **Xác nhận:** Thông tin xe Honda SH hiện ra ở khung thông tin, nhưng bảng bên phải báo màu vàng cảnh báo bảo mật: *"Bạn chưa có quyền xem lịch sử sửa chữa chung của xe này..."*.
4. Nhấp vào nút **"Ghi nhận bảo dưỡng mới"** ở đầu trang:
   * Một Form Modal hiện ra. Tại ô tìm kiếm xe khách hàng, nhập `59A-123.45` và nhấn **Tìm xe**.
   * Hệ thống tìm thấy xe Toyota Vios và điền tự động số km hiện tại là `35,200 km`.
   * Nhập số Odo lúc sửa: `36500` (Tăng số km thực tế).
   * Nhập tổng chi phí: `3200000`.
   * Nhập ngày bảo dưỡng: Chọn ngày hiện tại.
   * Nhập nội dung chi tiết: `"Thay dầu nhớt Castrol Edge cao cấp, thay má phanh trước, bảo dưỡng hệ thống treo và Đảo lốp xe & cân mâm"`.
   * Nhấn **Ghi nhận lịch sử**.
5. Sau khi lưu thành công:
   * **Xác nhận:** Thông tin Odometer của xe trên bảng tìm kiếm lập tức cập nhật thành `36,500 km`.
   * Đồng thời bảng nhật ký sửa chữa bên phải tải lại và hiển thị hóa đơn dịch vụ trị giá `3.200.000 ₫` vừa tạo.
6. Đăng xuất tài khoản Gara và đăng nhập lại tài khoản User `user@acoh.com` / `user123`.
7. Vào **Xem bảo dưỡng** của xe **Toyota Vios**:
   * **Xác nhận:** Odometer của xe đã tự động đồng bộ tăng lên `36,500 km`.
   * Vào Tab **Kế hoạch bảo dưỡng**: Lịch nhắc "Đảo lốp xe & cân mâm" (ScheduleID = 2) đã tự động chuyển sang trạng thái *"Đã hoàn thành"* màu xanh (do có chữ "Đảo lốp xe & cân mâm" trong chi tiết dịch vụ của Gara).
   * Vào Tab **Nhật ký sửa chữa**: Hóa đơn `3.200.000 ₫` thực hiện bởi `"AutoCare Central Garage Q5"` đã hiển thị trên Timeline của chủ xe.
