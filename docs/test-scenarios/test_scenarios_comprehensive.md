# KỊCH BẢN KIỂM THỬ TOÀN DIỆN HỆ THỐNG ACOH (COMPREHENSIVE TEST SCENARIOS)
## Đầy đủ từ Module 1 đến Module 8 (Giao diện Front-end, Logic API Back-end & Database)

Tài liệu này cung cấp kịch bản kiểm thử (Test Cases) chi tiết từng bước cho toàn bộ 8 phân hệ (modules) của hệ thống **AutoCare Office Helper (ACOH)**, tập trung đặc biệt vào các luồng kiểm thử giao diện Front-end người dùng.

---

## 🛠️ ĐIỀU KIỆN TIỀN QUYẾT & THÔNG TIN CHUNG
* **Backend URL:** `http://localhost:3000` (API Swagger: `http://localhost:3000/api/docs`)
* **Frontend URL:** `http://localhost:5173`
* **Cơ sở dữ liệu:** Microsoft SQL Server 2014, DB name `ACOH_DB`. Đã chạy tệp cấu trúc `database.sql` và dữ liệu mẫu `seed.sql`.
* **Dữ liệu tài khoản kiểm thử mặc định:**
  * **Admin:** `admin@acoh.com` / `123456`
  * **Garage:** `garage@acoh.com` / `garage123`
  * **User:** `user@acoh.com` / `user123`

---

## 🔑 MODULE 1: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (AUTH & RBAC)

### 1. Kiểm thử API Back-end (`/api/auth`)
* **Đăng ký tài khoản (User):**
  * **API:** `POST /api/auth/register`
  * **Body:**
    ```json
    {
      "fullName": "Nguyễn Văn Người Dùng",
      "email": "nguoidung@acoh.com",
      "password": "user123",
      "phoneNumber": "0987654321",
      "role": "User"
    }
    ```
  * **Mong đợi:** HTTP `201 Created` - Trả về thông điệp thành công.
* **Đăng ký trùng Email:**
  * Gửi lại Body trên. Mong đợi: HTTP `409 Conflict` - Báo lỗi trùng email.
* **Đăng nhập:**
  * **API:** `POST /api/auth/login`
  * **Body:** `{ "email": "nguoidung@acoh.com", "password": "user123" }`
  * **Mong đợi:** HTTP `200 OK` - Trả về `token` (JWT) và thông tin người dùng. Lưu token này làm `${JWT_TOKEN}`.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-1.1: Kiểm thử Đăng ký tài khoản mới
* **Bước 1:** Truy cập `http://localhost:5173/register` trên trình duyệt.
* **Bước 2:** Không nhập thông tin nào, bấm nút **Đăng ký**.
  * *Mong đợi:* Giao diện báo đỏ toàn bộ các trường bắt buộc kèm thông báo lỗi dưới ô input (ví dụ: "Họ và tên không được để trống", "Email không đúng định dạng").
* **Bước 3:** Nhập Email sai định dạng (ví dụ: `abc.com`), nhập mật khẩu ngắn hơn 6 ký tự (ví dụ: `123`). Bấm **Đăng ký**.
  * *Mong đợi:* Nhận thông báo lỗi "Email không hợp lệ" và "Mật khẩu tối thiểu phải từ 6 ký tự".
* **Bước 4:** Nhập thông tin đầy đủ, hợp lệ:
  * Họ tên: `Nguyễn Văn Khách Hàng`
  * Email: `khachhang@acoh.com`
  * Số điện thoại: `0909090909`
  * Vai trò: Chọn **Chủ xe (User)** ở dropdown.
  * Mật khẩu: `user123`
  * Nhấp nút **Đăng ký**.
  * *Mong đợi:* Hiển thị thông báo Toast thông báo Đăng ký thành công. Trình duyệt tự động chuyển hướng về trang `/login` sau 3 giây.
* **Bước 5:** Thử đăng ký lại với thông tin trên (Email trùng).
  * *Mong đợi:* Giao diện hiển thị Toast báo lỗi đỏ "Email này đã tồn tại trên hệ thống".

#### UC-1.2: Kiểm thử Đăng nhập & Điều hướng theo vai trò (RBAC)
* **Bước 1:** Truy cập `http://localhost:5173/login`.
* **Bước 2:** Nhập email hoặc mật khẩu sai -> Click **Đăng nhập** -> Giao diện hiện Toast lỗi "Tài khoản hoặc mật khẩu không chính xác".
* **Bước 3:** Đăng nhập với tài khoản User: `user@acoh.com` / `user123`.
  * *Mong đợi:* Chuyển hướng thành công đến `/user/dashboard`. Menu bên trái hiển thị các tab: Phương tiện, Lịch hẹn, Chi tiêu, Chatbot AI.
* **Bước 4:** Bấm Đăng xuất. Đăng nhập tài khoản Garage: `garage@acoh.com` / `garage123`.
  * *Mong đợi:* Chuyển hướng thành công đến `/garage/dashboard`. Menu bên trái hiển thị các tab: Quản lý trạm, Duyệt lịch hẹn, Nhật ký dịch vụ, Báo cáo doanh thu.
* **Bước 5:** Bấm Đăng xuất. Đăng nhập tài khoản Admin: `admin@acoh.com` / `123456`.
  * *Mong đợi:* Chuyển hướng đến `/admin/dashboard`. Hiển thị Dashboard giám sát toàn diện hệ thống.
* **Bước 6:** Khi đang đăng nhập tài khoản User, cố ý gõ địa chỉ `/admin/dashboard` lên trình duyệt.
  * *Mong đợi:* Hệ thống chặn truy cập, chuyển hướng người dùng về trang báo lỗi `/unauthorized` hoặc quay về trang chủ User.

#### UC-1.3: Cập nhật Hồ sơ cá nhân & Đổi mật khẩu
* **Bước 1:** Đăng nhập tài khoản User, vào mục **Hồ sơ cá nhân** (Profile).
* **Bước 2:** Sửa Họ tên thành `Lê Văn User Mới`, sửa Số điện thoại thành `0911222333` -> Nhấn nút **Lưu thay đổi**.
  * *Mong đợi:* Hiển thị Toast thông báo cập nhật thành công. Thông tin trên Avatar/Header lập tức đổi theo.
* **Bước 3:** Vào mục **Đổi mật khẩu** -> Nhập mật khẩu cũ sai -> Nhập mật khẩu mới -> Nhấn cập nhật.
  * *Mong đợi:* Toast báo lỗi "Mật khẩu cũ không chính xác".
* **Bước 4:** Nhập đúng mật khẩu cũ `user123`, mật khẩu mới `newpass123` -> Bấm đổi mật khẩu.
  * *Mong đợi:* Báo đổi mật khẩu thành công. Hệ thống tự động đăng xuất người dùng và chuyển về trang đăng nhập. Đăng nhập lại với mật khẩu mới để xác nhận.

#### UC-1.4: Khôi phục mật khẩu qua Email (Quên mật khẩu)
* **Bước 1:** Tại trang Đăng nhập, bấm vào liên kết **"Quên mật khẩu?"**.
* **Bước 2:** Điền email `user@acoh.com` -> Bấm **Gửi mã OTP**.
  * *Mong đợi:* Toast thông báo "Đã gửi mã xác nhận về Email". Hệ thống chuyển sang màn hình nhập OTP và Reset.
* **Bước 3:** Mở Terminal của Backend để lấy mã OTP mẫu vừa được in ra (hoặc mở email).
* **Bước 4:** Nhập mã OTP đó vào ô input, điền mật khẩu mới `user123` -> Bấm **Xác nhận**.
  * *Mong đợi:* Toast thông báo "Đặt lại mật khẩu thành công", chuyển hướng về `/login`.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* Truy vấn kiểm tra mật khẩu đã được băm bảo mật Bcrypt:
  ```sql
  SELECT Email, PasswordHash, Role FROM Users WHERE Email = 'khachhang@acoh.com';
  ```

---

## 🚗 MODULE 2: QUẢN LÝ PHƯƠNG TIỆN (VEHICLE MANAGEMENT)

### 1. Kiểm thử API Back-end (`/api/vehicles`)
* **Thêm phương tiện mới:**
  * **API:** `POST /api/vehicles`
  * **Body:**
    ```json
    {
      "licensePlate": "59A-999.99",
      "vehicleType": "Ô tô",
      "brand": "Mercedes",
      "model": "C200",
      "manufactureYear": 2022,
      "purchaseDate": "2022-10-15",
      "currentOdometer": 15000
    }
    ```
  * **Mong đợi:** HTTP `201 Created` - Trả về ID phương tiện mới tạo.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-2.1: Hiển thị danh sách phương tiện
* **Bước 1:** Đăng nhập tài khoản User, truy cập trang **Góc Phương Tiện**.
* **Bước 2:** Kiểm tra bố cục giao diện: Danh sách xe phải hiển thị dưới dạng lưới (Grid) gồm các thẻ Card.
* **Bước 3:** Kiểm tra xem chiếc xe máy (Honda SH) và ô tô (Toyota Vios) đã hiển thị đúng các icon/hình đại diện cho từng dòng xe chưa. Số kilomet hiện tại (Odometer) phải được format đẹp mắt bằng dấu phẩy (Ví dụ: `35,200 km`).

#### UC-2.2: Thêm mới phương tiện
* **Bước 1:** Tại trang Quản lý xe, click vào nút **"+ Thêm phương tiện mới"**.
* **Bước 2:** Trên Form thêm xe, kiểm tra dropdown **Loại phương tiện** (chứa ô tô và xe máy). Chọn **Ô tô**.
* **Bước 3:** Bỏ trống các trường, nhấn nút **"Thêm xe"**.
  * *Mong đợi:* Form hiển thị cảnh báo đỏ ở các ô: Biển số xe, Hãng xe, Dòng xe, Số km hiện tại.
* **Bước 4:** Nhập thông tin xe mới:
  * Biển số: `59C-777.77`
  * Hãng xe: `Ford`
  * Dòng xe: `Ranger Wildtrak`
  * Năm sản xuất: `2021`
  * Ngày mua: Chọn ngày bất kỳ
  * Số km hiện tại (Odometer): `25000`
  * Bấm nút **"Thêm xe"**.
  * *Mong đợi:* Modal tự động đóng lại. Hiển thị Toast thông báo "Thêm xe thành công". Một thẻ Card xe Ford Ranger Wildtrak mới xuất hiện lập tức trên màn hình.
* **Bước 5:** Thử thực hiện lại các bước trên với cùng biển số `59C-777.77`.
  * *Mong đợi:* Form hiển thị lỗi ngay trên ô Biển số xe hoặc hiện Toast báo lỗi: "Biển số xe này đã tồn tại trên hệ thống".

#### UC-2.3: Cập nhật nhanh số Kilomet (Odometer)
* **Bước 1:** Tại thẻ xe Ford Ranger vừa tạo, tìm và nhấp vào nút **"Cập nhật km"** hoặc biểu tượng đồng hồ đo.
* **Bước 2:** Nhập số kilomet nhỏ hơn kilomet hiện hành (Ví dụ nhập `24000` trong khi kilomet hiện tại là `25000`). Bấm **Cập nhật**.
  * *Mong đợi:* Form hiển thị lỗi validation: "Số kilomet mới không được nhỏ hơn số kilomet hiện tại". Nút Cập nhật bị vô hiệu hóa hoặc báo lỗi đỏ.
* **Bước 3:** Nhập số kilomet hợp lệ (Ví dụ nhập `26500`). Bấm **Cập nhật**.
  * *Mong đợi:* Dialog đóng lại, Toast thông báo "Cập nhật số kilomet thành công". Trên thẻ xe đó, thông số Odometer lập tức hiển thị giá trị mới: `26,500 km`.

#### UC-2.4: Chỉnh sửa và Xóa xe
* **Bước 1:** Nhấp vào biểu tượng hình cây bút (Edit) trên thẻ xe Ford Ranger.
* **Bước 2:** Thay đổi Dòng xe thành `Ranger Raptor` và bấm **Lưu thay đổi**.
  * *Mong đợi:* Thông tin hiển thị trên card xe được cập nhật tương ứng.
* **Bước 3:** Nhấp vào biểu tượng Thùng rác (Delete) trên card xe Ford Ranger Raptor.
  * *Mong đợi:* Trình duyệt hiển thị Dialog xác nhận: "Bạn có chắc chắn muốn xóa phương tiện này?".
* **Bước 4:** Chọn **Xác nhận xóa**.
  * *Mong đợi:* Toast báo "Xóa phương tiện thành công". Thẻ xe Ford Ranger Raptor biến mất hoàn toàn khỏi màn hình Dashboard.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* Xác minh dữ liệu xe đã được đồng bộ chuẩn xác:
  ```sql
  SELECT LicensePlate, Brand, Model, CurrentOdometer FROM Vehicles WHERE UserID = 3;
  ```

---

## 🔧 MODULE 3: QUẢN LÝ BẢO DƯỠNG & SỬA CHỮA (MAINTENANCE LOG)

### 1. Kiểm thử API Back-end (`/api/maintenances`)
* **Gara ghi nhận lịch sử bảo dưỡng:**
  * **API:** `POST /api/maintenances/history/garage`
  * **Body:**
    ```json
    {
      "vehicleId": 1,
      "executionDate": "2026-07-24",
      "executionOdometer": 36500,
      "totalCost": 1500000,
      "details": "Bảo dưỡng định kỳ mốc 35k km, thay dầu máy chính hãng."
    }
    ```
  * **Mong đợi:** HTTP `201 Created` - Ghi nhận lịch sử thành công.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-3.1: Người dùng lập lịch nhắc bảo dưỡng thủ công
* **Bước 1:** Đăng nhập tài khoản User -> Truy cập tab **Lập kế hoạch bảo dưỡng**.
* **Bước 2:** Click nút **"Tạo lịch nhắc mới"**.
* **Bước 3:** Nhập thông tin:
  * Xe áp dụng: Chọn xe Toyota Vios trong dropdown.
  * Hạng mục bảo dưỡng: Nhập `Thay dầu hộp số`.
  * Số km dự kiến nhắc: `45000`.
  * Ngày dự kiến: Chọn ngày trong tương lai (Ví dụ: `2026-12-01`).
  * Nhấn **Tạo lịch nhắc**.
  * *Mong đợi:* Lịch nhắc mới được thêm vào danh sách "Mốc bảo dưỡng sắp tới" dưới trạng thái "Chưa thực hiện".

#### UC-3.2: Gara ghi nhật ký bảo dưỡng chi tiết cho xe khách hàng
* **Bước 1:** Đăng nhập tài khoản Garage -> Vào tab **Nhật ký dịch vụ trạm**.
* **Bước 2:** Nhấn nút **"Tạo hóa đơn & Ghi nhật ký mới"**.
* **Bước 3:** Nhập thông tin:
  * Chọn xe khách hàng: Chọn xe `59A-123.45` từ danh sách (hoặc tìm kiếm biển số).
  * Nhập Số kilomet hiện tại lúc sửa: `36500`.
  * Ngày thực hiện: Ngày hôm nay.
  * Hạng mục sửa chữa & Vật tư thay thế: Hệ thống hỗ trợ thêm nhiều dòng vật tư. Click "Thêm dòng" -> Dòng 1: Nhập `Nhớt máy Castrol` - Đơn giá `600,000` - Số lượng `1`. Click "Thêm dòng" -> Dòng 2: Nhập `Má phanh trước` - Đơn giá `800,000` - Số lượng `1`.
  * *Mong đợi:* Giao diện tự động tính tổng tiền dịch vụ hiển thị ở mục **Tổng chi phí**: `1,400,000đ`.
* **Bước 4:** Nhập Chi tiết công việc: `Đã hoàn tất thay thế linh kiện và kiểm tra phanh`.
* **Bước 5:** Bấm nút **Lưu và xuất hóa đơn**.
  * *Mong đợi:* Hiển thị Toast thông báo thành công. Bản ghi được cập nhật vào danh sách lịch sử sửa chữa chung.

#### UC-3.3: Khách hàng xem lịch sử bảo dưỡng đồng bộ
* **Bước 1:** Đăng nhập tài khoản User `user@acoh.com`.
* **Bước 2:** Chọn xe Toyota Vios `59A-123.45` -> Mở Tab **Lịch sử bảo dưỡng**.
* **Bước 3:** Kiểm tra sự xuất hiện của dòng lịch sử mới nhất từ Gara.
  * *Mong đợi:* Hiển thị bản ghi ngày bảo dưỡng hôm nay, tổng tiền `1,400,000đ` và chi tiết vật tư đã thay. Thông số Odometer của xe tự động nhảy lên `36,500 km` do được đồng bộ từ nhật ký của Gara.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* SQL truy vấn kiểm tra lịch sử và tổng tiền:
  ```sql
  SELECT * FROM MaintenanceHistory WHERE VehicleID = 1 ORDER BY ExecutionDate DESC;
  ```

---

## 📄 MODULE 4: QUẢN LÝ ĐĂNG KIỂM & BẢO HIỂM (LEGAL & INSURANCE)

### 1. Kiểm thử API Back-end (`/api/legal`)
* **Thêm mới chu kỳ đăng kiểm hoặc bảo hiểm:**
  * **API:** `POST /api/legal`
  * **Body:**
    ```json
    {
      "vehicleId": 1,
      "documentType": "Đăng kiểm",
      "issueDate": "2025-07-24",
      "expiryDate": "2026-07-30",
      "alertThresholdDays": 30
    }
    ```
  * **Mong đợi:** HTTP `201 Created` - Trả về bản ghi thành công.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-4.1: Kiểm tra hiển thị trạng thái và màu sắc cảnh báo động
* **Bước 1:** Đăng nhập tài khoản User, truy cập trang **Quản lý giấy tờ phương tiện**.
* **Bước 2:** Chọn xe Toyota Vios.
* **Bước 3:** Kiểm định màu sắc hiển thị của các thẻ thông tin giấy tờ:
  * **Bản ghi Đăng kiểm (Còn hạn dài, ví dụ còn 120 ngày):** Phải được hiển thị với nhãn trạng thái **"Còn hạn"** màu xanh lá (Green text/border).
  * **Bản ghi Bảo hiểm dân sự (Sắp hết hạn trong vòng 15 ngày, ví dụ còn 6 ngày):** Phải hiển thị trạng thái cảnh báo **"Sắp hết hạn"** màu cam (Orange text/border), đi kèm text cảnh báo số ngày còn lại: `"Còn lại 6 ngày"`.
  * **Bản ghi Bảo hiểm vật chất (Đã quá hạn, ví dụ quá hạn 30 ngày):** Phải hiển thị trạng thái màu đỏ rực **"Quá hạn"** (Red text/border) kèm số ngày đã quá hạn: `"Quá hạn 30 ngày"`.

#### UC-4.2: Gia hạn / Cập nhật chu kỳ giấy tờ mới
* **Bước 1:** Tại thẻ Bảo hiểm vật chất đang báo đỏ (Quá hạn), click vào nút **"Gia hạn ngay"** hoặc biểu tượng Edit.
* **Bước 2:** Màn hình hiển thị Form cập nhật chu kỳ giấy tờ. Nhập thông tin:
  * Ngày cấp mới: `2026-07-24` (Hôm nay).
  * Ngày hết hạn mới: `2027-07-24` (Sang năm).
  * Ngưỡng ngày nhắc nhở: `30` ngày.
  * Bấm nút **"Cập nhật gia hạn"**.
* **Bước 3:** Kiểm tra sự thay đổi trên giao diện:
  * *Mong đợi:* Thẻ Bảo hiểm vật chất lập tức chuyển đổi trạng thái từ màu đỏ **"Quá hạn"** sang màu xanh lá **"Còn hạn"**, đồng thời số ngày còn lại hiển thị là `365 ngày`.

#### UC-4.3: Xóa giấy tờ xe
* **Bước 1:** Chọn một giấy tờ bảo hiểm không còn sử dụng, nhấp nút **Xóa (hình thùng rác)**.
* **Bước 2:** Hệ thống mở Dialog hỏi xác nhận. Chọn **Có**.
  * *Mong đợi:* Thẻ giấy tờ đó biến mất lập tức khỏi giao diện. Hiện Toast "Xóa giấy tờ xe thành công".

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* Truy vấn kiểm tra dữ liệu giấy tờ cập nhật:
  ```sql
  SELECT DocumentType, IssueDate, ExpiryDate, Status FROM LegalDocuments WHERE VehicleID = 1;
  ```

---

## 🔔 MODULE 5: LOGIC TÍNH TOÁN & THÔNG BÁO TỰ ĐỘNG (NOTIFICATION ENGINE)

### 1. Kiểm thử API Back-end (`/api/notifications`)
* **Gara gửi thông báo khi hoàn thành bảo dưỡng:**
  * **API:** `POST /api/notifications/send-completion`
  * **Body:**
    ```json
    {
      "vehicleId": 1,
      "garageId": 1,
      "details": "Đã thay thế lọc gió điều hòa."
    }
    ```
  * **Mong đợi:** HTTP `201 Created` - Gửi thành công.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-5.1: Kiểm thử biểu tượng thông báo Header (Bell Badge Icon)
* **Bước 1:** Đăng nhập tài khoản User `user@acoh.com`.
* **Bước 2:** Nhìn lên góc phải trên cùng thanh Header của website.
  * *Mong đợi:* Có biểu tượng quả chuông màu xám. Nếu có thông báo chưa đọc, hiển thị chấm tròn màu đỏ có số đếm bên trong (Ví dụ: `2` thông báo chưa đọc).

#### UC-5.2: Dropdown danh sách thông báo và thao tác đánh dấu đã đọc
* **Bước 1:** Bấm chuột vào **Biểu tượng quả chuông**.
  * *Mong đợi:* Một khung Popover/Dropdown hiện xuống chứa danh sách các thông báo nhận được. Những thông báo chưa đọc có nền màu xanh nhạt hoặc dấu chấm xanh dương nổi bật bên cạnh.
* **Bước 2:** Nhấp chuột vào một thông báo có tiêu đề: `"[Cảnh báo] Bảo hiểm vật chất xe của bạn đã quá hạn"`.
  * *Mong đợi:* Hệ thống tự động chuyển hướng người dùng đến trang chi tiết giấy tờ xe, đồng thời đánh dấu thông báo này là đã đọc (chấm xanh dương biến mất, số đếm trên quả chuông tự giảm từ `2` xuống `1`).
* **Bước 3:** Bấm lại quả chuông, click vào nút **"Đọc tất cả"** ở góc dropdown.
  * *Mong đợi:* Tất cả thông báo chuyển sang trạng thái đã đọc. Chấm đỏ hiển thị số lượng trên biểu tượng quả chuông biến mất hoàn toàn.

#### UC-5.3: Giả lập chạy kiểm quét Cron Job nhắc nhở hạn định
* **Bước 1:** Tại giao diện dành cho Admin/Developer (hoặc nút quét giả lập trên giao diện test). Bấm nút **"Chạy quét hệ thống"** (Trigger Daily Cron Job).
* **Bước 2:** Hệ thống gửi yêu cầu quét các xe có Odometer sắp đến mốc nhắc bảo dưỡng hoặc giấy tờ sắp hết hạn.
  * *Mong đợi:* Xuất hiện Toast báo "Đã quét ngầm hệ thống thành công! Phát hiện 1 xe sắp đến hạn". Lập tức trên Header của User, số lượng thông báo chưa đọc nhảy lên `+1` và quả chuông xuất hiện chấm đỏ. Nhấp vào thấy thông báo mới: `"[ACOH] Xe 59A-123.45 sắp đến hạn thay nhớt định kỳ"`.

### 3. Kiểm tra Hòm thư Email (SMTP Gmail)
* Truy cập hòm thư test đã đăng ký cho tài khoản `user@acoh.com`.
* *Mong đợi:* Nhận được một Email gửi đến từ địa chỉ của hệ thống ACOH với tiêu đề `[ACOH] CẢNH BÁO HẠN PHƯƠNG TIỆN` chứa thông tin chi tiết biển số xe và lời nhắc gia hạn/bảo dưỡng.

---

## 📅 MODULE 6: TÌM KIẾM & ĐẶT LỊCH GARAGE (GARAGE BOOKING)

### 1. Kiểm thử API Back-end (`/api/appointments`)
* **Khách hàng đặt lịch:**
  * **API:** `POST /api/appointments`
  * **Body:**
    ```json
    {
      "garageId": 1,
      "vehicleId": 1,
      "appointmentDate": "2026-07-28 10:00:00",
      "notes": "Thay nhớt."
    }
    ```
  * **Mong đợi:** HTTP `201 Created`.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-6.1: Tìm kiếm trạm dịch vụ Gara
* **Bước 1:** Đăng nhập tài khoản User -> Chọn Menu **"Tìm kiếm Gara"**.
* **Bước 2:** Nhập vào ô tìm kiếm: `AutoCare` -> Danh sách hiển thị các Gara có tên chứa từ khóa.
* **Bước 3:** Chọn bộ lọc vị trí: Dropdown chọn `Quận 5` -> Hệ thống lọc chỉ hiển thị các gara tại quận 5 (Ví dụ: `AutoCare Central Garage Q5`).
* **Bước 4:** Kiểm tra xem trên card Gara có hiển thị đầy đủ thông số: Tên Gara, Địa chỉ, Số điện thoại, Email và Số sao đánh giá trung bình kèm số lượt đánh giá không.

#### UC-6.2: Quy trình đặt lịch và duyệt lịch trực tuyến
* **Bước 1 (User):** Trên Card của `AutoCare Central Garage Q5`, click nút **"Đặt lịch hẹn"**.
* **Bước 2 (User):** Form đặt lịch mở lên. Nhập thông tin:
  * Chọn xe: Dropdown chọn xe `Toyota Vios (59A-123.45)`.
  * Ngày giờ hẹn: Chọn ngày trong tương lai (Ví dụ: ngày mai lúc `09:30`).
  * Ghi chú: Nhập `Tôi muốn kiểm tra lốp xe`.
  * Click **"Xác nhận đặt lịch"**.
  * *Mong đợi:* Toast thông báo đặt lịch thành công. Trạng thái lịch hẹn hiển thị trong danh sách lịch sử là **"Chờ xác nhận"**.
* **Bước 3 (Garage):** Đăng xuất User, đăng nhập tài khoản Garage `garage@acoh.com` -> Vào mục **"Quản lý lịch đặt hẹn"**.
* **Bước 4 (Garage):** Tìm lịch hẹn mới của khách hàng `Nguyễn Văn Khách Hàng` vừa tạo. Click nút **"Xác nhận lịch"**.
  * *Mong đợi:* Trạng thái lịch chuyển sang **"Đã xác nhận"** (Tô màu xanh dương). 
* **Bước 5 (Garage):** Khi khách mang xe đến trạm, click nút **"Bắt đầu sửa chữa"**.
  * *Mong đợi:* Trạng thái lịch chuyển sang **"Đang sửa chữa"** (Tô màu cam).
* **Bước 6 (Garage):** Sửa xong, Gara nhấn nút **"Hoàn thành dịch vụ"** -> Form ghi nhật ký bảo dưỡng hiện ra tự động (như UC-3.2). Gara nhập thông tin số km hiện tại và linh kiện -> Lưu.
  * *Mong đợi:* Lịch hẹn chuyển sang trạng thái cuối cùng **"Hoàn thành"** (Tô màu xanh lá). Hệ thống tự động đẩy thông báo báo hoàn tất cho User.

#### UC-6.3: Gara tra cứu hồ sơ định danh xe khách hàng
* **Bước 1 (Garage):** Tại giao diện Gara, chọn Menu **"Danh sách xe đã phục vụ"**.
* **Bước 2 (Garage):** Nhập biển số xe `59A-123.45` vào thanh tìm kiếm nhanh.
  * *Mong đợi:* Hệ thống lọc và hiển thị chính xác dòng xe Toyota Vios của khách.
* **Bước 3 (Garage):** Nhấp click vào dòng thông tin xe để xem chi tiết.
  * *Mong đợi:* Chuyển sang trang **Hồ sơ định danh phương tiện**. Giao diện hiển thị chi tiết lịch sử sửa chữa của riêng chiếc xe này tại gara đó (Các mốc ngày đã đến, thay linh kiện gì, tổng tiền bao nhiêu) hỗ trợ thợ kỹ thuật theo dõi tình trạng xe.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* SQL kiểm tra trạng thái cập nhật của lịch hẹn:
  ```sql
  SELECT AppointmentID, Status, Notes FROM Appointments WHERE VehicleID = 1;
  ```

---

## 📊 MODULE 7: BẢO CÁO & THỐNG KÊ (DASHBOARD & ANALYTICS)

### 1. Kiểm thử API Back-end (`/api/analytics`)
* **Lấy thống kê dashboard của Gara:**
  * **API:** `GET /api/analytics/garage/dashboard`
  * **Mong đợi:** HTTP `200 OK` - Trả về dữ liệu JSON gồm các mục doanh thu, lượt xe.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-7.1: Giao diện Báo cáo vận hành Gara (Garage Analytics Dashboard)
* **Bước 1:** Đăng nhập tài khoản Garage `garage@acoh.com` -> Vào trang **Dashboard**.
* **Bước 2:** Kiểm tra 4 thẻ thông số KPI trên cùng:
  * **Tổng doanh thu:** Tổng tiền của các hóa đơn lịch sử dịch vụ.
  * **Lượt xe đã sửa:** Tổng số lượt phục vụ.
  * **Số lượng xe độc bản:** Tổng số đầu xe phân biệt đã từng sửa chữa (`COUNT(DISTINCT VehicleID)`).
  * **Đánh giá trung bình:** Số điểm đánh giá sao từ khách.
* **Bước 3:** Kiểm tra các thành phần biểu đồ:
  * **Biểu đồ Cột (Bar Chart):** Thể hiện số lượng xe đến sửa chữa theo từng ngày trong tuần/tháng. Rê chuột vào từng cột xem có tooltip hiện số xe cụ thể không.
  * **Biểu đồ Đường (Line Chart):** Thể hiện doanh thu biến động qua các tháng. Rê chuột xem số tiền chi tiết.
* **Bước 4:** Kiểm tra bảng **"Khách hàng thân thiết"** hiển thị danh sách các xe có số lần đến bảo dưỡng nhiều nhất.

#### UC-7.2: Giao diện Phân tích chi tiêu cá nhân (User Analytics Dashboard)
* **Bước 1:** Đăng nhập tài khoản User `user@acoh.com` -> Vào trang **Phân tích chi tiêu**.
* **Bước 2:** Kiểm tra các thẻ thông tin tổng hợp: Tổng chi phí nuôi xe từ trước tới nay, Trung bình chi phí hàng tháng.
* **Bước 3:** Kiểm tra biểu đồ:
  * **Biểu đồ Tròn (Pie Chart):** Phân tích các hạng mục chi tiêu (Sửa chữa, Thay nhớt định kỳ, Mua bảo hiểm, Phí đăng kiểm). Rê chuột vào từng miếng bánh để xem tỷ lệ phần trăm (%).
  * **Biểu đồ Đường/Cột:** So sánh chi phí nuôi xe qua các tháng để giúp người dùng cân đối ngân sách.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* Chạy SQL để kiểm chứng tổng doanh thu thực tế so với số liệu hiển thị trên biểu đồ:
  ```sql
  SELECT SUM(TotalCost) AS TotalRevenue FROM MaintenanceHistory WHERE GarageID = 1;
  ```

---

## 🤖 MODULE 8: TIỆN ÍCH NÂNG CAO (AI CHATBOT, EXPORT FILE & REVIEWS)

### 1. Kiểm thử API Back-end (`/api/extensions`)
* **Gửi câu hỏi lên AI Assistant (Gemini API):**
  * **API:** `POST /api/extensions/ai-chat`
  * **Body:** `{ "message": "Xe tôi bị khói đen ở ống xả là bị sao?" }`
  * **Mong đợi:** HTTP `201 Created` - Trả về phân tích nguyên nhân lỗi kỹ thuật.

### 2. Kiểm thử Chi tiết Giao diện (Front-end UI/UX)

#### UC-8.1: Tương tác với Trợ lý ảo AI Assistant (Gemini Chatbot)
* **Bước 1:** Đăng nhập tài khoản User. Nhìn vào góc dưới bên phải màn hình.
  * *Mong đợi:* Xuất hiện một biểu tượng Chatbot hình tròn nổi (Floating Chatbox) có hiệu ứng micro-animation nhấp nháy thu hút sự chú ý.
* **Bước 2:** Click vào biểu tượng bong bóng Chatbot.
  * *Mong đợi:* Khung hội thoại mở lên ngay góc phải màn hình, hiển thị tin nhắn chào mừng mặc định của trợ lý ảo.
* **Bước 3:** Nhập vào ô chat câu hỏi: `"Bao lâu tôi cần phải đảo lốp xe ô tô?"` -> Nhấn Enter hoặc click nút gửi.
  * *Mong đợi:*
    * Tin nhắn của bạn xuất hiện bên phải.
    * Xuất hiện hiệu ứng 3 chấm nhấp nháy (typing indicator) báo hiệu AI đang xử lý.
    * Sau 1-2 giây, robot trả về văn bản hướng dẫn chi tiết (thông thường từ 8,000 - 10,000 km) định dạng Markdown rõ ràng, dễ đọc.
* **Bước 4:** Thử hỏi một câu hỏi không liên quan đến kỹ thuật xe (ví dụ: "Thời tiết hôm nay thế nào?") -> Trợ lý AI định hướng người dùng quay lại chủ đề bảo dưỡng phương tiện.
* **Bước 5:** Bấm nút đóng (X) trên góc khung chat -> Khung chat thu nhỏ lại thành biểu tượng tròn.

#### UC-8.2: Xuất báo cáo dữ liệu ra file (Excel / PDF / CSV)
* **Bước 1 (User - Xuất chi tiêu):** Truy cập trang Chi tiêu cá nhân của User. Click nút **"Xuất báo cáo chi tiêu Excel/CSV"**.
  * *Mong đợi:* Trình duyệt lập tức kích hoạt tải xuống một file có tên `user_expenses.csv`. Mở file kiểm tra thấy danh mục xe, ngày sửa, tên trạm dịch vụ và chi phí được sắp xếp theo đúng cột rõ ràng.
* **Bước 2 (Garage - Xuất hóa đơn dịch vụ):** Tại trang hóa đơn lịch sử sửa chữa của Gara, click nút **"Xuất hóa đơn PDF"**.
  * *Mong đợi:* File PDF hóa đơn được tải về máy. File được thiết kế chuyên nghiệp, chứa thông tin Gara, thông tin xe khách hàng, bảng danh mục vật tư thay thế, đơn giá và tổng chi phí kèm chữ ký xác nhận của xưởng.

#### UC-8.3: Đánh giá & Phản hồi chất lượng dịch vụ Gara
* **Bước 1 (User):** Sau khi lịch đặt hẹn chuyển sang trạng thái "Hoàn thành", User vào mục Lịch hẹn.
* **Bước 2 (User):** Tại lịch hẹn vừa xong, xuất hiện nút **"Đánh giá Gara"** (Rating). Click vào nút này.
* **Bước 3 (User):** Form Dialog đánh giá (Rating Modal) hiển thị.
  * Chọn số sao: Click chọn **5 sao** (Hiển thị 5 ngôi sao màu vàng sáng).
  * Viết nhận xét: Nhập `"Nhân viên nhiệt tình, sửa phanh xe rất êm."`
  * Bấm nút **Gửi đánh giá**.
  * *Mong đợi:* Dialog đóng lại, Toast thông báo "Gửi đánh giá thành công".
* **Bước 4 (User):** Truy cập lại trang Tìm kiếm Gara -> Chọn `AutoCare Central Garage Q5`.
  * *Mong đợi:* Số lượng đánh giá tăng lên 1, điểm sao trung bình của Gara cập nhật thay đổi động dựa trên đánh giá mới của bạn.

### 3. Kiểm tra Cơ sở dữ liệu (Database)
* Chạy SQL kiểm tra đánh giá mới đã được lưu vào bảng Reviews:
  ```sql
  SELECT TOP 1 * FROM Reviews ORDER BY ReviewID DESC;
  ```
