# Kịch bản kiểm thử Module 5 - Nhận diện biển số xe bằng OCR/AI (License Plate OCR & AI Search)

Tài liệu này cung cấp các kịch bản kiểm thử từng bước (step-by-step) dành cho Module 5, bao gồm cả kiểm thử qua API Endpoints (Backend) và kiểm thử qua giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.
> * Các tài khoản test mẫu:
>   * **Gara (Garage):** `garage@acoh.com` / `garage123`
>   * Xe mẫu có biển số `59A-123.45` (Ô tô) và `59B-678.90` (Xe máy) đã có sẵn lịch sử bảo dưỡng trong hệ thống.

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND REST API)

### Bước 1: Đăng nhập tài khoản Gara để lấy Token
* **API Route:** `POST http://localhost:3000/api/auth/login`
* **Body (JSON):**
  ```json
  {
    "email": "garage@acoh.com",
    "password": "garage123"
  }
  ```
* **Kết quả:** Nhận về JSON chứa `"token": "eyJ..."`. Lưu token này dưới tên `${GARAGE_TOKEN}`.

### Bước 2: Kiểm thử luồng API nhận diện biển số xe (OCR Scan)
#### 1. Gọi API gửi hình ảnh có tên file chứa biển số để nhận diện (Ví dụ: `59A-123.45.jpg`)
* **API Route:** `POST http://localhost:3000/api/extensions/ocr/scan-plate`
* **Header:** 
  * `Authorization: Bearer ${GARAGE_TOKEN}`
  * `Content-Type: multipart/form-data`
* **Body (Form Data):**
  * `file`: Tải tệp hình ảnh có tên `59A-123.45.jpg` hoặc `59A12345.jpg`.
* **Kết quả mong đợi:** HTTP `201 Created` hoặc `200 OK`. Phản hồi trả về đầy đủ hồ sơ xe và lịch sử sửa chữa:
  ```json
  {
    "licensePlate": "59A-123.45",
    "vehicleId": 1,
    "vehicleProfile": {
      "vehicleId": 1,
      "userId": 3,
      "licensePlate": "59A-123.45",
      "vehicleType": "Ô tô",
      "brand": "Toyota",
      "model": "Vios 1.5G",
      "manufactureYear": 2020,
      "currentOdometer": 35200,
      "ownerName": "Lê Văn User",
      "ownerEmail": "user@acoh.com",
      "history": [
        {
          "historyId": 1,
          "executionDate": "2026-07-24T00:00:00.000Z",
          "executionOdometer": 36500,
          "totalCost": 1500000,
          "details": "Bảo dưỡng định kỳ mốc 35k km, thay dầu máy chính hãng.",
          "garageName": "AutoCare Central Garage Q5"
        }
      ]
    }
  }
  ```

#### 2. Gọi API nhận diện biển số xe máy (Ví dụ tên file: `59B-678.90.png`)
* **API Route:** `POST http://localhost:3000/api/extensions/ocr/scan-plate`
* **Header:** 
  * `Authorization: Bearer ${GARAGE_TOKEN}`
  * `Content-Type: multipart/form-data`
* **Body (Form Data):**
  * `file`: Tải tệp hình ảnh có tên `59B-678.90.png` hoặc `59B67890.png`.
* **Kết quả mong đợi:** Trả về thông tin xe máy SH Mode (VehicleID = 2) cùng lịch sử sửa chữa tương ứng.

#### 3. Trường hợp ảnh biển số không có trên hệ thống (Ví dụ tên file: `29A-999.99.jpg`)
* **API Route:** `POST http://localhost:3000/api/extensions/ocr/scan-plate`
* **Body (Form Data):**
  * `file`: Tải tệp hình ảnh `29A-999.99.jpg`.
* **Kết quả mong đợi:** Trả về thông báo không tìm thấy xe:
  ```json
  {
    "licensePlate": "29A-999.99",
    "message": "Không tìm thấy phương tiện này trong hệ thống",
    "vehicleId": null,
    "vehicleProfile": null
  }
  ```

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND UI/UX)

### Kịch bản 1: Quét biển số xe và sửa thông tin mờ/bẩn từ ảnh chụp

1. Đăng nhập vào tài khoản Gara (`garage@acoh.com` / `garage123`).
2. Trên màn hình chính **Garage Dashboard**, quan sát phía trên bên phải của **Header** hoặc nhấp chọn Tab **"Bảng quản lý nhanh"** (Quick Actions).
3. Nhấp chọn nút **"📸 Scan Biển số"** (ở Header) hoặc **"📸 Scan AI"** (trong khung tìm kiếm nhanh).
   * **Giao diện hiển thị:** Xuất hiện một cửa sổ Modal Scanner với màn hình camera giả lập tối màu, viền neon hiện đại và hiệu ứng tia quét laser di chuyển lên xuống liên tục. Có nút bật/tắt Flash giả lập.
4. Thử tính năng chọn tệp hoặc ảnh mẫu:
   * Nhấp chọn nút **"Dùng thử ảnh Ô tô (59A-123.45)"**.
   * **Hiệu ứng AI hoạt động:** Giao diện hiển thị hiệu ứng xoay tròn `"Trí tuệ nhân tạo (OCR) đang phân tích ảnh..."` cùng vệt sáng quét laser chạy liên tục.
   * **Kết quả nhận diện:** Sau 1.5 giây phân tích, hệ thống hiển thị ô Input chứa biển số đã nhận diện là: `59A-123.45`.
5. Kiểm thử khả năng sửa lỗi biển số nếu ảnh chụp bị mờ:
   * Tại ô Input chứa biển số vừa nhận diện, hãy thử sửa giá trị từ `59A-123.45` thành `59B-678.90` (Xe máy Honda SH).
   * Nhấp nút **"Tra cứu"**.
   * **Kết quả mong đợi:** Modal đóng lại, hệ thống tự động tải và hiển thị hồ sơ chi tiết cùng lịch sử sửa chữa của chiếc xe Honda SH Mode (chủ xe Lê Văn User) trên bảng quản lý nhanh mà không cần gõ phím.
6. Thử lại với trường hợp xe chưa đăng ký trên hệ thống:
   * Bấm lại nút **"📸 Scan Biển số"**, chọn nút **"Chọn ảnh từ máy"** hoặc gõ một biển số bất kỳ chưa từng có trong cơ sở dữ liệu (ví dụ: `29A-999.99`). Bấm **Tra cứu**.
   * **Kết quả mong đợi:** Hệ thống hiển thị hộp thoại cảnh báo màu đỏ: `⚠️ Không tìm thấy phương tiện này trong hệ thống`.
