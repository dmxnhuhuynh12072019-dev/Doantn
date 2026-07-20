# Kịch bản kiểm thử Module 4 - Quản lý Đăng kiểm & Bảo hiểm (Legal & Insurance Management)

Tài liệu này cung cấp các kịch bản kiểm thử từng bước (step-by-step) dành cho Module 4, bao gồm cả kiểm thử qua API Endpoints (Backend) và kiểm thử qua giao diện người dùng (Frontend).

> **Điều kiện chuẩn bị:**
> * Backend đang chạy tại: `http://localhost:3000`
> * Frontend đang chạy tại: `http://localhost:5173`
> * Database đã được khởi tạo bằng `database.sql` và nạp dữ liệu mẫu bằng `seed.sql`.

---

## PHẦN 1: KIỂM THỬ API TRỰC TIẾP (BACKEND)

### Bước 1: Đăng nhập để lấy Token

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

### Bước 2: Kiểm thử tính năng quản lý giấy tờ (CRUD & DATEDIFF Status)

#### 1. Lấy danh sách giấy tờ của xe ô tô (ID = 1)
* **API Route:** `GET http://localhost:3000/api/legal/1`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về danh sách 3 giấy tờ mẫu của xe 1 từ seed data:
  * Đăng kiểm (Còn hạn)
  * Bảo hiểm dân sự (Còn hạn)
  * Bảo hiểm vật chất (Quá hạn - Hết hạn từ 10/05/2025)
* **Kiểm chứng:** Trạng thái của "Bảo hiểm vật chất" được cập nhật động sang `"Quá hạn"` thành công.

#### 2. Thử thêm giấy tờ trùng loại đã có (Đăng kiểm cho xe ID = 1)
* **API Route:** `POST http://localhost:3000/api/legal`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "vehicleId": 1,
    "documentType": "Đăng kiểm",
    "issueDate": "2025-06-01",
    "expiryDate": "2026-12-31",
    "alertThresholdDays": 30
  }
  ```
* **Kết quả mong đợi:** HTTP `409 Conflict`. Nhận về lỗi báo: *"Loại giấy tờ "Đăng kiểm" đã tồn tại cho xe này. Vui lòng chỉnh sửa hoặc gia hạn bản ghi hiện tại."* để tránh trùng lặp dữ liệu.

#### 3. Đăng ký giấy tờ mới (Bảo hiểm vật chất cho xe máy ID = 2)
* **API Route:** `POST http://localhost:3000/api/legal`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "vehicleId": 2,
    "documentType": "Bảo hiểm vật chất",
    "issueDate": "2025-07-20",
    "expiryDate": "2026-07-20",
    "alertThresholdDays": 30
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. Nhận về `{ "message": "Thêm mới giấy tờ xe thành công!", "documentId": ${NEW_DOC_ID} }`.
* **Kiểm chứng:** Trạng thái lưu vào CSDL tự động gán là `"Còn hạn"` (hoặc `"Sắp hết hạn"`/`"Quá hạn"` tùy theo khoảng cách ngày hết hạn so với thời điểm test).

#### 4. Cập nhật / Gia hạn giấy tờ vừa tạo
* **API Route:** `PUT http://localhost:3000/api/legal/${NEW_DOC_ID}`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "documentType": "Bảo hiểm vật chất",
    "issueDate": "2026-07-20",
    "expiryDate": "2027-07-20",
    "alertThresholdDays": 45
  }
  ```
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Cập nhật giấy tờ xe thành công!" }`.

#### 5. Thử cập nhật/xóa giấy tờ của xe người khác (Bảo mật)
* Tạo một tài khoản mới hoặc đăng nhập tài khoản Gara (`garage@acoh.com` / `garage123`), lấy token và gọi `PUT` hoặc `DELETE` tới `/api/legal/${NEW_DOC_ID}`.
* **Kết quả mong đợi:** HTTP `403 Forbidden` - Hệ thống chặn vì không có quyền thao tác trên xe người khác.

#### 6. Xóa giấy tờ xe
* **API Route:** `DELETE http://localhost:3000/api/legal/${NEW_DOC_ID}`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Nhận về `{ "message": "Xóa giấy tờ xe thành công!" }`.

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

### Kịch bản 1: Quản lý giấy tờ của xe ô tô (Toyota Vios)

1. Truy cập `http://localhost:5173/login`, đăng nhập với tài khoản `user@acoh.com` / `user123`.
2. Tại trang **Góc Quản lý Phương tiện**, bấm vào **"Xem bảo dưỡng"** trên thẻ xe **Toyota Vios 1.5G** (ID = 1).
3. Nhấp vào Tab **"Giấy tờ & Bảo hiểm"** mới thêm:
   * **Kiểm tra giao diện:** Bạn sẽ thấy xuất hiện 3 thẻ giấy tờ bao gồm: **Đăng kiểm định kỳ**, **Bảo hiểm dân sự** và **Bảo hiểm vật chất**.
   * **Kiểm tra trạng thái & màu sắc cảnh báo động:**
     * Thẻ **Đăng kiểm định kỳ** và **Bảo hiểm dân sự** hiển thị nhãn **"Còn hạn"** màu xanh lá cây kèm số ngày còn lại (Ví dụ: "Còn 150 ngày").
     * Thẻ **Bảo hiểm vật chất** hiển thị nhãn **"Quá hạn"** màu đỏ nổi bật kèm thông tin: `"Đã quá hạn XXX ngày"`.
4. Thực hiện gia hạn Bảo hiểm vật chất:
   * Bấm vào nút **"Gia hạn / Sửa"** trên thẻ **Bảo hiểm vật chất**.
   * Trên Form Modal hiện lên, chọn ngày cấp là ngày hôm nay và ngày hết hạn là 1 năm sau kể từ hôm nay.
   * Nhấn **Lưu thay đổi**.
   * **Kết quả mong đợi:** Form đóng lại, thẻ Bảo hiểm vật chất lập tức chuyển sang trạng thái **"Còn hạn"** màu xanh lá và hiển thị số ngày còn lại tương ứng (Ví dụ: "Còn 365 ngày").
5. Chỉnh sửa ngưỡng cảnh báo để kiểm tra cảnh báo cam (Sắp hết hạn):
   * Bấm nút **"Gia hạn / Sửa"** trên thẻ bất kỳ (Ví dụ: Bảo hiểm dân sự).
   * Thay đổi ngày hết hạn thành một ngày bất kỳ cách hôm nay khoảng 10 ngày (nhỏ hơn ngưỡng cảnh báo).
   * Nhấn **Lưu thay đổi**.
   * **Kết quả mong đợi:** Thẻ lập tức cập nhật sang trạng thái **"Sắp hết hạn"** màu cam nổi bật.

---

### Kịch bản 2: Quản lý giấy tờ của xe máy (Honda SH Mode) và tính năng Xóa

1. Bấm quay lại danh sách xe, chọn nút **"Xem bảo dưỡng"** trên thẻ xe **Honda SH Mode** (Xe máy - ID = 2).
2. Nhấp vào Tab **"Giấy tờ & Bảo hiểm"**:
   * **Kiểm tra ràng buộc theo loại xe:** Xác nhận giao diện **chỉ hiển thị 2 thẻ**: **Bảo hiểm dân sự** và **Bảo hiểm vật chất**. Thẻ **Đăng kiểm** đã được ẩn hoàn toàn do xe máy không có chu kỳ đăng kiểm kỹ thuật bắt buộc.
3. Thực hiện đăng ký mới Bảo hiểm vật chất:
   * Do chưa có dữ liệu, thẻ Bảo hiểm vật chất sẽ hiển thị ở trạng thái trống kèm nút **"Đăng ký ngay"**. Bấm vào nút này.
   * Chọn ngày cấp, ngày hết hạn (1 năm sau) và đặt ngưỡng cảnh báo là `30` ngày.
   * Nhấn **Đăng ký**.
   * **Kết quả mong đợi:** Thẻ chuyển sang trạng thái đã đăng ký, hiển thị đầy đủ ngày cấp, ngày hết hạn và nhãn màu xanh lá **"Còn hạn"**.
4. Thực hiện xóa giấy tờ xe máy:
   * Nhấp biểu tượng hình thùng rác **"Xóa"** màu đỏ ở góc dưới thẻ Bảo hiểm vật chất.
   * Xác nhận cảnh báo xác thực của trình duyệt.
   * **Kết quả mong đợi:** Thẻ Bảo hiểm vật chất lập tức quay về trạng thái trống ban đầu kèm nhãn `"Chưa đăng ký"` và nút `"Đăng ký ngay"`.
