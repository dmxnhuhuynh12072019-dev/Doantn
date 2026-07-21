# Kịch bản kiểm thử Module 6 - Tìm kiếm & Đặt lịch Gara (Garage Booking Integration)

Tài liệu này cung cấp kịch bản kiểm thử từng bước (step-by-step) dành cho Module 6, bao gồm cả kiểm thử qua API Endpoints (Backend) và kiểm thử qua giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND)

### Bước 1: Đăng nhập tài khoản Chủ xe (User) để lấy Token
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "user@acoh.com",
    "password": "user123"
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Nhận về JSON chứa `"token": "eyJ..."`. Lưu token này dưới tên `${USER_TOKEN}`.

---

### Bước 2: Khách hàng lấy danh sách Gara đang hoạt động
* **API Route:** `GET http://localhost:3000/api/garages`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về mảng danh sách các Gara đang hoạt động (ví dụ: `AutoCare Central Garage Q5` với `GarageID` là `1`).

---

### Bước 3: Khách hàng đặt lịch hẹn tại Gara
* **API Route:** `POST http://localhost:3000/api/appointments`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "garageId": 1,
    "vehicleId": 1,
    "appointmentDate": "2026-07-25T09:00:00.000Z",
    "notes": "Tôi muốn thay nhớt định kỳ và kiểm tra phanh xe."
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. backend trả về:
  ```json
  {
    "message": "Đặt lịch hẹn bảo dưỡng thành công!",
    "appointmentId": 2
  }
  ```
  *(Lưu ID lịch hẹn này dưới tên `${APPT_ID}`).*

---

### Bước 4: Khách hàng xem lịch hẹn của mình để xác nhận trạng thái
* **API Route:** `GET http://localhost:3000/api/appointments/user`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Tìm lịch hẹn có `AppointmentID = 2`, trạng thái ban đầu phải là `Chờ xác nhận`.

---

### Bước 5: Đăng nhập tài khoản Gara để lấy Token
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "garage@acoh.com",
    "password": "garage123"
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Lưu token này dưới tên `${GARAGE_TOKEN}`.

---

### Bước 6: Gara xem danh sách lịch đặt hẹn của xưởng mình
* **API Route:** `GET http://localhost:3000/api/appointments/garage`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Lịch hẹn `${APPT_ID}` phải xuất hiện trong danh sách.

---

### Bước 7: Gara xác nhận lịch hẹn của khách
* **API Route:** `PATCH http://localhost:3000/api/appointments/${APPT_ID}/status`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "status": "Đã xác nhận"
  }
  ```
* **Kết quả mong đợi:** HTTP `200 OK`. Trạng thái lịch hẹn đổi thành `Đã xác nhận`.

---

### Bước 8: Gara chuyển lịch hẹn sang trạng thái đang sửa chữa
* **API Route:** `PATCH http://localhost:3000/api/appointments/${APPT_ID}/status`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "status": "Đang sửa chữa"
  }
  ```
* **Kết quả mong đợi:** HTTP `200 OK`. Trạng thái lịch hẹn đổi thành `Đang sửa chữa`.

---

### Bước 9: Gara xác nhận hoàn tất bảo dưỡng & ghi nhận lịch sử sửa chữa
* **API Route:** `PATCH http://localhost:3000/api/appointments/${APPT_ID}/complete-and-notify`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "odometer": 36000,
    "totalCost": 1200000,
    "details": "Đã thay nhớt máy Castrol Edge, vệ sinh má phanh trước và sau."
  }
  ```
* **Kết quả mong đợi:** HTTP `200 OK`.
  * Trạng thái lịch hẹn chuyển sang `Hoàn thành`.
  * Có bản ghi lịch sử tương ứng được lưu trong bảng `MaintenanceHistory`.
  * Odometer của xe tự động cập nhật lên `36000 km`.
  * Hệ thống gửi thông báo in-app tự động cho chủ xe.

---

### Bước 10: Gara lấy danh sách xe đã bảo dưỡng tại tiệm
* **API Route:** `GET http://localhost:3000/api/garages/serviced-vehicles`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về danh sách xe đã bảo dưỡng, kiểm tra xem có xe biển số `59A-123.45` trong kết quả không.

---

### Bước 11: Gara xem hồ sơ định danh chi tiết của chiếc xe vừa bảo dưỡng
* **API Route:** `GET http://localhost:3000/api/garages/vehicle-profile/1`
* **Header:** `Authorization: Bearer ${GARAGE_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Phản hồi trả về thông tin chi tiết xe (loại xe, odo hiện tại, thông tin chủ xe) cùng với mảng lịch sử sửa chữa của xe đó được thực hiện duy nhất tại Gara của bạn.

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

### Kịch bản 1: Khách hàng đặt lịch hẹn bảo dưỡng sửa xe
1. Truy cập `http://localhost:5173/login`, đăng nhập với tài khoản `user@acoh.com` / `user123`.
2. Trên màn hình danh sách xe, click chọn nút **"Xem bảo dưỡng"** trên chiếc xe **Toyota Vios** (biển số `59A-123.45`).
3. Trong khu vực quản lý xe, chọn tab **"Đặt lịch bảo dưỡng"**.
4. Bấm nút **"+ Đặt lịch sửa xe"**. Một Modal đặt lịch hiện lên:
   * **Chọn Gara đối tác:** Chọn `AutoCare Central Garage Q5`.
   * **Chọn ngày giờ hẹn:** Chọn một ngày trong tương lai (Ví dụ: ngày mai lúc 09:00).
   * **Ghi chú cho Gara:** Nhập *"Thay dầu máy và kiểm tra lại còi xe kêu nhỏ"*.
   * Bấm **"Xác nhận đặt lịch"**.
5. **Kết quả mong đợi:** Modal đóng lại, hiển thị thông báo đặt lịch thành công. Danh sách xuất hiện một khối lịch đặt lịch mới có trạng thái là **Chờ xác nhận** kèm thông tin ngày hẹn và ghi chú vừa điền.

---

### Kịch bản 2: Gara tiếp nhận lịch hẹn và chuyển đổi trạng thái đến khi hoàn tất
1. Đăng xuất tài khoản User, tiến hành đăng nhập với tài khoản của Gara: `garage@acoh.com` / `garage123`.
2. Màn hình mặc định hiển thị tab **"Lịch hẹn khách hàng"**.
3. Bạn sẽ nhìn thấy lịch hẹn mới đặt ở **Kịch bản 1** nằm trong danh sách với trạng thái **Chờ xác nhận**:
   * Bấm vào nút **"Xác nhận lịch"**.
   * **Kết quả mong đợi:** Trạng thái chuyển thành **Đã xác nhận**.
4. Khi khách hàng mang xe tới tiệm sửa:
   * Bấm vào nút **"Tiến hành sửa"**.
   * **Kết quả mong đợi:** Trạng thái chuyển thành **Đang sửa chữa**.
5. Khi hoàn thành công việc sửa chữa:
   * Bấm vào nút **"Hoàn tất sửa chữa"**. Một Modal điền thông tin hiện lên:
     * **Số Odo lúc bàn giao:** Nhập `36000` (lớn hơn số Odo cũ `35,200 km`).
     * **Tổng chi phí:** Nhập `1200000`.
     * **Chi tiết hạng mục:** Nhập *"Thay dầu động cơ định kỳ, vệ sinh cụm phanh, căn chỉnh lại còi"*.
     * Bấm **"Hoàn thành bảo dưỡng"**.
6. **Kết quả mong đợi:** Modal đóng lại, lịch hẹn được đánh dấu **Hoàn thành** và gửi thông báo in-app tự động cho khách hàng.

---

### Kịch bản 3: Gara tra cứu hồ sơ định danh và xe đã bảo dưỡng
1. Chuyển sang tab **"Quản lý xe đã bảo dưỡng"** trên thanh menu của Gara.
2. Kiểm tra xem xe Toyota Vios (biển số `59A-123.45`) có xuất hiện trong danh sách bảng hay không.
3. Thử tìm kiếm nhanh: Nhập `59A` vào thanh tìm kiếm và bấm **"Tìm kiếm"**. Hệ thống lọc chính xác các xe khớp biển số.
4. Bấm vào nút **"Xem hồ sơ xe"** của xe `59A-123.45`:
   * **Kết quả mong đợi:** Mở Modal hồ sơ định danh phương tiện, hiển thị:
     * Chi tiết cấu hình xe (Toyota Vios, Ô tô).
     * Thông tin chủ xe: Lê Văn User, số điện thoại, email.
     * Số Odo hiện tại đã được tăng lên `36,000 km`.
     * Nhật ký sửa chữa tại Gara hiển thị đầy đủ các mốc lịch sử sửa chữa mà xe đã thực hiện tại tiệm bạn (bao gồm lịch sử mới ghi nhận ở Kịch bản 2).

---

### Kịch bản 4: Chủ xe nhận thông báo và kiểm tra nhật ký xe
1. Đăng xuất tài khoản Gara, đăng nhập lại tài khoản `user@acoh.com` / `user123`.
2. Kiểm tra **Quả chuông thông báo** ở góc trên bên phải:
   * **Kết quả mong đợi:** Có thông báo mới báo xe `59A-123.45` đã hoàn tất sửa chữa tại `AutoCare Central Garage Q5` kèm chi phí `1.200.000 ₫`.
3. Bấm **"Xem bảo dưỡng"** trên xe Toyota Vios (`59A-123.45`):
   * **Kết quả mong đợi:** Odometer của xe hiển thị trên Dashboard đã được tự động cập nhật lên con số **`36,000 km`**.
4. Chuyển sang tab **"Nhật ký sửa chữa"**:
   * **Kết quả mong đợi:** Bản ghi mới do Gara thực hiện xuất hiện ở đầu danh sách, ghi rõ ngày làm, số km 36,000, chi phí 1.200.000 ₫ và nội dung chi tiết.
5. Chuyển sang tab **"Đặt lịch bảo dưỡng"**:
   * **Kết quả mong đợi:** Lịch hẹn đã thực hiện chuyển sang trạng thái **Hoàn thành**.
