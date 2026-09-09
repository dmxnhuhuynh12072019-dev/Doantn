# Kịch bản kiểm thử Module 2 - Mở rộng Quản lý Pháp lý & Xe Dịch vụ (Extended Legal & Commercial Vehicle Management)

Tài liệu này cung cấp kịch bản kiểm thử chi tiết từng bước (step-by-step) dành cho **Module 2: Quản lý Phương tiện & Mở rộng Xe Dịch vụ / Giấy tờ Pháp lý**, bao gồm kiểm thử trực tiếp qua API Endpoints (Postman/Swagger) và kiểm thử giao diện người dùng (Frontend UI).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000` (Swagger API Docs: `http://localhost:3000/api/docs`)
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database SQL Server (`ACOH_DB`) đã chạy cập nhật schema Module 2 (`IsCommercial`, `HTXCode`, `BadgeNumber`, `Giấy phép lái xe`).
> * Tài khoản test:
>   * Chủ xe: `user@acoh.com` / `user123`
>   * Quản trị viên: `admin@acoh.com` / `123456`

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
* **Kết quả mong đợi:** Trả về HTTP `200 OK` chứa Token. Lưu token này dưới tên `${USER_TOKEN}`.

---

### Bước 2: Kiểm thử các API Quản lý Phương tiện (`/api/vehicles`)

#### 1. Lấy danh sách phương tiện của người dùng (Get Vehicles List)
* **API Route:** `GET http://localhost:3000/api/vehicles`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Trả về mảng JSON chứa các xe của tài khoản `user@acoh.com`.

#### 2. Thêm phương tiện mới - Ô tô thông thường (Create Standard Vehicle)
* **API Route:** `POST http://localhost:3000/api/vehicles`
* **Header:** 
  * `Authorization: Bearer ${USER_TOKEN}`
  * `Content-Type: application/json`
* **Body:**
  ```json
  {
    "licensePlate": "59C-777.77",
    "vehicleType": "Ô tô",
    "brand": "Ford",
    "model": "Ranger Wildtrak",
    "manufactureYear": 2021,
    "purchaseDate": "2021-05-10",
    "currentOdometer": 25000,
    "isCommercial": false
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `201 Created`.
  * Response: `{ "message": "Thêm phương tiện mới thành công!", "vehicleId": 3 }`. Lưu lại ID này làm `${NEW_VEHICLE_ID}`.

#### 3. Thêm phương tiện mới - Xe kinh doanh dịch vụ (Create Commercial Vehicle)
* **API Route:** `POST http://localhost:3000/api/vehicles`
* **Header:**
  * `Authorization: Bearer ${USER_TOKEN}`
  * `Content-Type: application/json`
* **Body:**
  ```json
  {
    "licensePlate": "51H-999.88",
    "vehicleType": "Ô tô",
    "brand": "Hyundai",
    "model": "Accent",
    "manufactureYear": 2023,
    "purchaseDate": "2023-02-15",
    "currentOdometer": 45000,
    "isCommercial": true,
    "htxCode": "HTX-SAIGON-01",
    "badgeNumber": "PH-889911"
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `201 Created`.
  * Response: `{ "message": "Thêm phương tiện mới thành công!", "vehicleId": 4 }`.

#### 4. Thử đăng ký xe với Biển số trùng lặp (Duplicate License Plate Test)
* **API Route:** `POST http://localhost:3000/api/vehicles`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:** Gửi lại dữ liệu với biển số `51H-999.88`.
* **Kết quả mong đợi:**
  * HTTP `409 Conflict`.
  * Response: `{ "message": "Biển số xe này đã được đăng ký trên hệ thống" }`.

#### 5. Cập nhật độc lập thông tin Xe dịch vụ (Update Commercial Info)
* **API Route:** `PATCH http://localhost:3000/api/vehicles/${NEW_VEHICLE_ID}/commercial-info`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:**
  ```json
  {
    "isCommercial": true,
    "htxCode": "HTX-DONGNAI-02",
    "badgeNumber": "PH-776655"
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Response: `{ "message": "Cập nhật thông tin xe dịch vụ thành công!" }`.

#### 6. Cập nhật nhanh chỉ số Kilomet (Update Odometer)
* **API Route:** `PATCH http://localhost:3000/api/vehicles/${NEW_VEHICLE_ID}/odometer`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:**
  ```json
  {
    "currentOdometer": 26500
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Response: `{ "message": "Cập nhật số km (Odometer) thành công!" }`.

#### 7. Thử cập nhật chỉ số Kilomet nhỏ hơn hiện tại (Invalid Odometer Test)
* **API Route:** `PATCH http://localhost:3000/api/vehicles/${NEW_VEHICLE_ID}/odometer`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:** `{ "currentOdometer": 20000 }`
* **Kết quả mong đợi:**
  * HTTP `409 Conflict`.
  * Response báo lỗi: *"Số km mới (20000 km) không được nhỏ hơn số km hiện tại..."*.

#### 8. Chỉnh sửa thông tin cố định của xe (Update Vehicle Info)
* **API Route:** `PUT http://localhost:3000/api/vehicles/${NEW_VEHICLE_ID}`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body:**
  ```json
  {
    "brand": "Ford",
    "model": "Ranger Raptor",
    "manufactureYear": 2022,
    "purchaseDate": "2021-05-10"
  }
  ```
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Response: `{ "message": "Cập nhật thông tin phương tiện thành công!" }`.

#### 9. Xóa phương tiện khỏi hệ thống (Delete Vehicle)
* **API Route:** `DELETE http://localhost:3000/api/vehicles/${NEW_VEHICLE_ID}`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:**
  * HTTP `200 OK`.
  * Response: `{ "message": "Xóa phương tiện thành công!" }`.

---

### Bước 3: Kiểm thử API Quản lý Giấy tờ & Bảo hiểm Mở rộng (`/api/legal`)

#### 1. Thêm mới Giấy phép lái xe (GPLX) & Bảo hiểm vật chất
* **API Route:** `POST http://localhost:3000/api/legal/documents`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (Thêm GPLX):**
  ```json
  {
    "vehicleId": 1,
    "documentType": "Giấy phép lái xe",
    "issueDate": "2021-01-15",
    "expiryDate": "2031-01-15",
    "alertThresholdDays": 30
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`.

* **Body (Thêm Bảo hiểm vật chất):**
  ```json
  {
    "vehicleId": 1,
    "documentType": "Bảo hiểm vật chất",
    "issueDate": "2025-10-01",
    "expiryDate": "2026-10-01",
    "alertThresholdDays": 30
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`.

---

## PHẦN 2: KIỂM THỬ GIAO DIỆN NGƯỜI DÙNG (FRONTEND UI)

### Kịch bản 1: Kiểm thử Thêm mới Phương tiện Kinh doanh Dịch vụ

* **Bước 1:** Đăng nhập tài khoản User tại `http://localhost:5173/login` bằng `user@acoh.com` / `user123`.
* **Bước 2:** Tại trang Dashboard, click vào nút **"+ Thêm phương tiện mới"** ở góc trên bên phải.
* **Bước 3:** Nhập thông tin cơ bản:
  * Loại xe: Chọn **Ô tô**
  * Biển số xe: `79A-888.88`
  * Hãng xe: `Toyota`
  * Dòng xe: `Innova Cross`
  * Số km hiện tại: `15000`
* **Bước 4:** Tích chọn vào ô **"🚕 Đây là Xe chạy dịch vụ (Grab, Be, Xe hợp đồng...)"**.
* **Xác nhận:** Khung nhập liệu mở rộng lập tức xuất hiện với 2 trường `Mã Hợp tác xã (HTX)` và `Số phù hiệu xe`.
* **Bước 5:** Điền thông tin:
  * Mã HTX: `HTX-KHANHHOA-05`
  * Số phù hiệu: `PH-998877`
* **Bước 6:** Click **"Thêm phương tiện"**.
* **Xác nhận kết quả:**
  * Modal đóng lại, xuất hiện Toast báo "Thêm phương tiện mới thành công!".
  * Thẻ Card xe Toyota Innova Cross xuất hiện trên Dashboard với Badge màu vàng **"🚕 Xe dịch vụ"** nổi bật.
  * Dưới tên xe hiển thị thông tin: `HTX: HTX-KHANHHOA-05 | Phù hiệu: PH-998877`.

---

### Kịch bản 2: Kiểm thử Cập nhật Nhanh Số Kilomet (Odometer) & Ràng buộc Validation

* **Bước 1:** Tại thẻ xe Toyota Innova Cross vừa tạo (hoặc bất kỳ xe nào), click nút **"Cập nhật km"**.
* **Bước 2:** Thử nhập số km nhỏ hơn kilomet hiện tại (ví dụ: `10000` trong khi kilomet hiện tại là `15000`). Click **Cập nhật**.
  * *Xác nhận:* Giao diện báo lỗi đỏ: *"Số km mới (10000 km) không được nhỏ hơn số km hiện tại (15000 km)"*.
* **Bước 3:** Nhập số kilomet hợp lệ (ví dụ: `16800`). Click **Cập nhật**.
  * *Xác nhận:* Dialog đóng lại, Toast báo cập nhật thành công. Số km trên thẻ xe lập tức cập nhật thành `16,800 km`.

---

### Kịch bản 3: Kiểm thử Chỉnh sửa Xe dịch vụ & Xem Chi tiết

* **Bước 1:** Click nút **"Xem bảo dưỡng"** trên thẻ xe Toyota Innova Cross.
* **Xác nhận:** Trang chi tiết xe mở ra. Phần thông tin trên cùng hiển thị Badge **"🚕 Xe dịch vụ"**, kèm các thông số `Mã HTX: HTX-KHANHHOA-05` và `Số phù hiệu: PH-998877`.
* **Bước 2:** Click nút **Quay lại danh sách xe**.
* **Bước 3:** Click biểu tượng **Sửa (hình cây bút)** trên card xe Toyota Innova Cross.
* **Bước 4:** Sửa Dòng xe thành `Innova Venturer`, sửa Số phù hiệu thành `PH-112233`. Click **Lưu thay đổi**.
* **Xác nhận kết quả:** Card xe trên màn hình cập nhật thông tin tên xe và số phù hiệu mới.

---

### Kịch bản 4: Kiểm thử Quản lý & Cảnh báo Trạng thái Giấy tờ Mở rộng (GPLX, Bảo hiểm vật chất)

* **Bước 1:** Click **"Xem bảo dưỡng"** tại xe Toyota Vios `59A-123.45` -> Chuyển sang tab **📄 Giấy tờ & Bảo hiểm**.
* **Xác nhận:** Danh sách giấy tờ hiển thị đủ các thẻ:
  * 📋 Đăng kiểm định kỳ
  * 🛡️ Bảo hiểm dân sự
  * 🚗 Bảo hiểm vật chất
  * 🪪 Giấy phép lái xe (GPLX)
* **Bước 2:** Tại thẻ **Giấy phép lái xe (GPLX)**, click nút **"Đăng ký"** hoặc **"Cập nhật"**.
* **Bước 3:** Chọn Ngày cấp và Ngày hết hạn (Chọn ngày hết hạn trong vòng 15 ngày tới để thử cảnh báo). Click **Lưu thay đổi**.
* **Xác nhận kết quả:** Thẻ Giấy phép lái xe hiển thị badge màu cam **"Sắp hết hạn"** kèm số ngày còn lại chính xác.

---

### Kịch bản 5: Kiểm thử Xóa phương tiện & Cascade dữ liệu

* **Bước 1:** Tại danh sách xe, click biểu tượng **Thùng rác (Delete)** trên card xe Toyota Innova Cross.
* **Bước 2:** Trình duyệt hiển thị hộp thoại xác nhận xóa. Chọn **OK / Xác nhận**.
* **Xác nhận kết quả:** Toast báo "Xóa phương tiện thành công!". Thẻ xe biến mất hoàn toàn khỏi giao diện.

---

## PHẦN 3: KIỂM TRA ĐỒNG BỘ CƠ SỞ DỮ LIỆU SQL SERVER

Sau khi thực hiện các bước trên, mở SQL Server Management Studio (SSMS) và chạy các câu lệnh kiểm tra:

```sql
USE ACOH_DB;

-- 1. Kiểm tra cấu trúc các cột mới ở bảng Vehicles
SELECT Column_Name, Data_Type 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Vehicles' AND COLUMN_NAME IN ('IsCommercial', 'HTXCode', 'BadgeNumber');

-- 2. Kiểm tra dữ liệu xe kinh doanh dịch vụ vừa thêm/sửa
SELECT VehicleID, LicensePlate, Brand, Model, CurrentOdometer, IsCommercial, HTXCode, BadgeNumber 
FROM Vehicles;

-- 3. Kiểm tra các bản ghi Giấy phép lái xe vừa đăng ký
SELECT DocumentID, VehicleID, DocumentType, ExpiryDate, Status 
FROM LegalDocuments 
WHERE DocumentType = N'Giấy phép lái xe';
```
