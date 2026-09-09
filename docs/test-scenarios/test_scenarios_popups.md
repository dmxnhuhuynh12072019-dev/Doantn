# KỊCH BẢN KIỂM THỬ XÁC MINH HỆ THỐNG POP-UP & THÔNG BÁO CHUYÊN NGHIỆP

Tài liệu này cung cấp kịch bản kiểm thử (Test Scenarios) chi tiết từng bước để nghiệm thu và xác minh hệ thống **Confirm Modal** và **Toast Notification** mới thay thế toàn bộ popup trình duyệt mặc định cũ (`window.confirm`, `window.alert`).

---

## 🛠️ ĐIỀU KIỆN TIỀN QUYẾT (PREREQUISITES)

* **Backend Server:** Đang chạy tại `http://localhost:3000`
* **Frontend Web App:** Đang chạy tại `http://localhost:5173`
* **Tài khoản kiểm thử:**
  * **User:** `user@acoh.com` / `user123`
  * **Garage:** `garage@acoh.com` / `garage123`
  * **Admin:** `admin@acoh.com` / `123456`

---

## 🚘 KỊCH BẢN 1: QUYỀN NGUỜI DÙNG (USER DASHBOARD)

### Test Case 1.1: Kiểm thử Hộp thoại Xác nhận Xóa Phương tiện (Red Danger Modal)
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản User (`user@acoh.com` / `user123`).
  2. Tại trang **Dashboard**, chọn một phương tiện trong danh sách xe.
  3. Nhấn vào nút **Xóa xe** (Icon thùng rác đỏ).
* **Kết quả mong đợi (Expected Results):**
  * Không còn xuất hiện popup xám mặc định của trình duyệt (`localhost:5173 says...`).
  * Hiển thị **Confirm Modal chuyên nghiệp**:
    * Nền tối mờ nhẹ (`backdrop-blur-sm`).
    * Icon hình tam giác cảnh báo đỏ (`AlertTriangle`) nổi bật trong vòng tròn hiệu ứng ring.
    * Tiêu đề: `Xóa phương tiện`.
    * Nội dung: `Bạn có chắc chắn muốn xóa phương tiện này? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn!`.
    * Hai nút bấm: **Hủy** (xám) và **Xóa ngay** (Gradient Đỏ).
  * **Thao tác Hủy:** Nhấn **Hủy** hoặc nhấn ra ngoài nền mờ -> Modal đóng lại, xe **không** bị xóa.
  * **Thao tác Đồng ý:** Nhấn **Xóa ngay** -> Modal đóng lại, xe được xóa thành công và xuất hiện **Toast Notification màu xanh** ở góc trên bên phải màn hình: `Đã xóa phương tiện thành công!`.

### Test Case 1.2: Kiểm thử Hủy lịch đặt hẹn bảo dưỡng
* **Các bước thực hiện:**
  1. Chọn một xe, chuyển sang tab **Lịch đặt hẹn**.
  2. Bấm nút **Hủy lịch** tại một lịch hẹn đang chờ.
* **Kết quả mong đợi:**
  * Hiển thị **Confirm Modal** loại Danger (Đỏ) với tiêu đề `Hủy lịch hẹn`.
  * Bấm **Hủy lịch ngay** -> Xuất hiện **Toast Notification xanh lá**: `Đã hủy lịch hẹn thành công!`.

### Test Case 1.3: Kiểm thử Tạo lịch hẹn mới (Toast Success)
* **Các bước thực hiện:**
  1. Bấm nút **Đặt lịch hẹn bảo dưỡng**.
  2. Chọn Gara, Ngày hẹn, Giờ hẹn, nhập Ghi chú -> Nhấn **Đặt lịch hẹn**.
* **Kết quả mong đợi:**
  * Modal đặt lịch đóng lại.
  * Xuất hiện **Toast Notification xanh lá** ở góc màn hình: `Đặt lịch hẹn bảo dưỡng thành công!`.

### Test Case 1.4: Kiểm thử Xóa Giấy tờ xe (Tab Giấy tờ)
* **Các bước thực hiện:**
  1. Chuyển sang tab **Giấy tờ xe**.
  2. Bấm nút **Xóa** một giấy tờ (ví dụ: Bảo hiểm dân sự).
* **Kết quả mong đợi:**
  * Hiển thị **Confirm Modal** tiêu đề `Xóa giấy tờ xe`.
  * Nhấn **Xóa ngay** -> Xuất hiện **Toast Notification**: `Đã xóa thông tin giấy tờ!`.

---

## 🛡️ KỊCH BẢN 2: QUYỀN QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

### Test Case 2.1: Kiểm thử Khóa / Mở khóa Tài khoản Người dùng
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Admin (`admin@acoh.com` / `123456`).
  2. Truy cập tab **Quản lý Người dùng**.
  3. Bấm nút **Khóa** trên một tài khoản đang hoạt động.
* **Kết quả mong đợi:**
  * Hiển thị **Confirm Modal** nguy hiểm (Đỏ) với tiêu đề `Khóa tài khoản` và nút `Khóa tài khoản`.
  * Nhấn **Khóa tài khoản** -> Trạng thái đổi thành "Bị khóa" + **Toast xanh lá**: `Đã cập nhật trạng thái tài khoản thành công!`.
  * Bấm nút **Mở khóa** -> Hiển thị Modal Cảnh báo Vàng (`Mở khóa tài khoản`) + nút `Mở khóa`.

### Test Case 2.2: Kiểm thử Thay đổi Vai trò Người dùng (Role Upgrade/Downgrade)
* **Các bước thực hiện:**
  1. Tại danh sách Người dùng, chọn thay đổi vai trò trong dropdown (ví dụ: Đổi từ `User` sang `Garage`).
* **Kết quả mong đợi:**
  * Hiển thị **Confirm Modal** Cảnh báo màu vàng (Warning) với tiêu đề `Đổi vai trò người dùng`.
  * Nhấn **Cập nhật vai trò** -> Vai trò được đổi + **Toast xanh lá**: `Đã cập nhật vai trò người dùng thành công!`.

### Test Case 2.3: Kiểm thử Tạm dừng / Kích hoạt Gara
* **Các bước thực hiện:**
  1. Chuyển sang tab **Quản lý Gara**.
  2. Bấm **Tạm dừng** hoạt động một Gara.
* **Kết quả mong đợi:**
  * Hiển thị **Confirm Modal** loại Danger (Đỏ) tiêu đề `Tạm dừng Gara`.
  * Nhấn **Tạm dừng** -> Trạng thái chuyển thành Tạm dừng + **Toast xanh lá**.
  * Bấm **Kích hoạt** lại -> Hiển thị Modal loại Success (Xanh lá) tiêu đề `Kích hoạt Gara`.

---

## 🔧 KỊCH BẢN 3: QUYỀN CHỦ GARA (GARAGE DASHBOARD)

### Test Case 3.1: Kiểm thử Cập nhật Trạng thái Lịch hẹn
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản Gara (`garage@acoh.com` / `garage123`).
  2. Tại tab **Lịch hẹn dịch vụ**, bấm chuyển trạng thái lịch hẹn (ví dụ: sang `Đã xác nhận`).
* **Kết quả mong đợi:**
  * Xuất hiện **Toast Notification xanh lá**: `Đã chuyển trạng thái lịch hẹn sang: "Đã xác nhận"!`.

### Test Case 3.2: Kiểm thử Xác nhận Hoàn thành Sửa chữa
* **Các bước thực hiện:**
  1. Bấm nút **Hoàn thành & Gửi TB** trên một lịch hẹn đang sửa chữa.
  2. Nhập tổng chi phí và danh mục công việc -> Bấm **Xác nhận hoàn thành**.
* **Kết quả mong đợi:**
  * Modal form đóng lại.
  * Xuất hiện **Toast Notification xanh lá**: `Xác nhận hoàn thành sửa chữa & gửi thông báo thành công!`.

### Test Case 3.3: Kiểm thử Ghi sổ Bảo dưỡng Dịch vụ Nhanh
* **Các bước thực hiện:**
  1. Chuyển sang tab **Tra cứu & Ghi sổ**.
  2. Nhập biển số xe, chọn dịch vụ bảo dưỡng -> Bấm **Ghi sổ bảo dưỡng**.
* **Kết quả mong đợi:**
  * Xuất hiện **Toast Notification xanh lá**: `Ghi sổ bảo dưỡng dịch vụ thành công!`.

---

## 🔔 KỊCH BẢN 4: KIỂM THỬ THÔNG BÁO & LỖI (NOTIFICATIONS & ERROR TOASTS)

### Test Case 4.1: Trigger Quét Hệ thống Thử nghiệm (Notification Bell)
* **Các bước thực hiện:**
  1. Bấm vào icon **Quả chuông thông báo** ở thanh Header.
  2. Nhấn vào nút **Quét thử hệ thống**.
* **Kết quả mong đợi:**
  * Xuất hiện **Toast Notification xanh lá**: `Đã kích hoạt quét hệ thống! Phát hiện & tạo thêm X thông báo.`.

### Test Case 4.2: Kiểm thử Gửi Đánh giá Gara (Review Modal)
* **Các bước thực hiện:**
  1. Mở modal Đánh giá Gara từ danh sách dịch vụ đã làm.
  2. Chọn 5 sao, nhập nhận xét -> Nhấn **Gửi đánh giá**.
* **Kết quả mong đợi:**
  * Modal đánh giá đóng lại.
  * Xuất hiện **Toast Notification xanh lá**: `Cảm ơn bạn đã gửi đánh giá cho Gara!`.

### Test Case 4.3: Kiểm thử Bắt Lỗi Hệ thống (Error Toast)
* **Các bước thực hiện:**
  1. Thử thực hiện một hành động gây lỗi (ví dụ: Xóa dữ liệu khi mất kết nối mạng hoặc thử thao tác không hợp lệ).
* **Kết quả mong đợi:**
  * Xuất hiện **Toast Notification màu đỏ** (`Error`) ở góc trên bên phải màn hình hiển thị thông điệp lỗi rõ ràng, ví dụ: `Thay đổi trạng thái thất bại`.
  * Hệ thống không bị treo hoặc ngắt quãng luồng trải nghiệm người dùng.

---

## 📋 TỔNG KẾT BẢNG CHECKLIST NGHIỆM THU

| STT | Luồng kiểm thử | Loại Pop-up | Giao diện mong đợi | Trạng thái Pass/Fail |
| --- | --- | --- | --- | --- |
| 1 | Xóa xe / Xóa lịch / Xóa giấy tờ | Confirm Modal (Danger) | Red Badge, Trash/Triangle icon, nút Gradient Đỏ | [ ] Pass |
| 2 | Khóa tài khoản / Tạm dừng Gara | Confirm Modal (Danger) | Red Badge, nút Khóa đỏ | [ ] Pass |
| 3 | Đổi vai trò user | Confirm Modal (Warning) | Amber Badge, nút Cảnh báo vàng | [ ] Pass |
| 4 | Kích hoạt Gara / Hoàn thành lịch | Confirm Modal (Success) | Emerald Badge, nút Xanh | [ ] Pass |
| 5 | Các thao tác thành công | Toast (Success) | Banner xanh góc trên phải, tự ẩn sau 4s | [ ] Pass |
| 6 | Xử lý sự cố lỗi | Toast (Error) | Banner đỏ góc trên phải hiển thị thông điệp lỗi | [ ] Pass |
