# TÀI LIỆU KIẾN TRÚC VÀ ĐẶC TẢ KỸ THUẬT HỆ THỐNG ACOH

## 1. THÔNG TIN CHUNG ĐỀ TÀI
* [cite_start]**Tên đề tài:** XÂY DỰNG HỆ THỐNG AUTOCARE OFFICE HELPER – ỨNG DỤNG QUẢN LÝ LỊCH ĐĂNG KIỂM, BẢO DƯỠNG VÀ BẢO HIỂM PHƯƠNG TIỆN [cite: 9]
* [cite_start]**Tên viết tắt dự án:** ACOH [cite: 9]
* **Nền tảng phát triển:** Web Application (Responsive hỗ trợ đa thiết bị mobile first, tối ưu cho di động)

---

## 2. MÔ TẢ NGẮN GỌN ĐỀ TÀI
[cite_start]Đề tài **“Xây dựng hệ thống AutoCare Office Helper (ACOH)”** tập trung giải quyết thực trạng bận rộn dẫn đến quên các mốc thời gian chăm sóc xe quan trọng (như thay nhớt, bảo dưỡng định kỳ, đăng kiểm, gia hạn bảo hiểm) của người dân Việt Nam, đặc biệt là nhóm nhân viên văn phòng[cite: 11]. [cite_start]Hệ thống được phát triển trên nền tảng Web, đóng vai trò là giải pháp quản lý tập trung hỗ trợ người dùng lưu trữ thông tin, theo dõi số kilomet và quản lý toàn bộ lịch trình, chi phí vận hành của nhiều phương tiện (ô tô, xe máy) trên cùng một tài khoản[cite: 11]. 

[cite_start]Điểm nổi bật của hệ thống là cơ chế tự động tính toán số ngày hoặc số kilomet còn lại để gửi thông báo nhắc nhở kịp thời qua Email và hệ thống (In-app) khi sắp đến hạn[cite: 11]. [cite_start]Ngoài ra, ứng dụng còn tích hợp các tính năng số hóa hiện đại bao gồm: hỗ trợ tìm kiếm và đặt lịch hẹn trực tuyến tại các garage liên kết; thống kê chi phí trực quan qua hệ thống Dashboard; và tạo nền tảng kết nối với các đơn vị dịch vụ phù hợp[cite: 11]. [cite_start]Mục tiêu cuối cùng của đề tài là xây dựng một ứng dụng hiện đại, bảo mật, dễ sử dụng, giúp chủ xe chủ động tối ưu chi phí, nâng cao tuổi thọ phương tiện và đảm bảo an toàn giao thông trong kỷ nguyên chuyển đổi số[cite: 11].

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)
Để tối ưu hóa cho mô hình Vibe Coding (lập trình bằng AI) và đảm bảo tính ổn định cao, dự án áp dụng các công nghệ sau:

* **Front-end (FE):**
  * Framework: **React.js** - Tối ưu hóa render trang, routing tường minh giúp AI sinh cấu trúc thư mục chuẩn.
  * Styling: **Tailwind CSS** + **Shadcn/ui** - Sinh giao diện cực nhanh bằng các tiện ích Class rõ ràng, dễ dàng copy-paste các component chuẩn hóa.
  * State Management & Fetching: **Axios** kết hợp **React Context API**.

* **Back-end (BE):**
  * Runtime: **Node.js** với Framework **Nest.js** - Cấu trúc gọn nhẹ, mô hình RESTful API tường minh giúp AI dễ kiểm soát logic.
  * Xác thực bảo mật: **JSON Web Token (JWT)** & mã hóa mật khẩu bằng **BCrypt**.
  * Gửi mail tự động: **Nodemailer** kết hợp dịch vụ SMTP Gmail.

* **Cơ sở dữ liệu (Database):**
  * Hệ quản trị: **Microsoft SQL Server 2014**.
  * Thư viện kết nối (ORM/Driver): **Mssql (Node.js Driver)** cấu hình cho phương thức SQL Server.
* **Kiến trúc hệ thống:(Clean Architecture)**
    


---

## 4. CHI TIẾT TỪNG MODULE (TÁCH BIỆT FE, BE, CHỨC NĂNG & API)

### MODULE 1: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (AUTH & USER MANAGEMENT)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* [cite_start]**Đăng ký / Đăng nhập:** Hệ thống cho phép người dùng đăng ký tài khoản bằng thông tin cá nhân cơ bản[cite: 13]. Mật khẩu khi gửi lên server bắt buộc phải được băm bảo mật. [cite_start]Khi đăng nhập thành công, hệ thống phát hành mã JWT lưu trữ phiên làm việc của người dùng[cite: 13].
* [cite_start]**Thay đổi & Quên mật khẩu:** Người dùng có thể chủ động đổi mật khẩu khi đang đăng nhập[cite: 13]. [cite_start]Đối với trường hợp quên mật khẩu, hệ thống sẽ xác thực email tồn tại và gửi một liên kết/mã OTP khôi phục thông qua Nodemailer[cite: 13].
* [cite_start]**Phân quyền hệ thống (RBAC):** Hệ thống phân tách rõ ràng 3 luồng chức năng chính[cite: 13]:
  * [cite_start]*User (Chủ xe):* Quản lý xe, đặt lịch hẹn, xem thông báo của mình[cite: 11, 13].
  * [cite_start]*Garage (Chủ Gara đối tác):* Quản lý thông tin gara, theo dõi luồng lịch hẹn, quản lý định danh các xe đã từng bảo dưỡng tại tiệm, gửi thông báo hoàn tất qua ứng dụng, và trực tiếp ghi sổ nhật ký bảo dưỡng xe của khách[cite: 11].
  * [cite_start]*Admin (Quản trị viên):* Quản lý toàn bộ người dùng, quản trị thông tin danh mục hệ thống và xem các báo cáo thống kê[cite: 11].

#### B. Thành phần Front-end (FE Interface)
* [cite_start]Giao diện Đăng ký / Đăng nhập (Validation form: kiểm tra định dạng email, độ dài mật khẩu)[cite: 13].
* [cite_start]Giao diện Hồ sơ cá nhân (Xem/Sửa thông tin cá nhân: Họ tên, Số điện thoại)[cite: 13].
* [cite_start]Giao diện Đổi mật khẩu và Quên mật khẩu (Form gửi yêu cầu OTP/Link)[cite: 13].
* [cite_start]Bộ định tuyến bảo vệ (Protected Routes): Chặn không cho người dùng chưa đăng nhập vào các trang nội bộ; chuyển hướng Router theo vai trò (`User`, `Garage`, `Admin`)[cite: 13].

#### C. Thành phần Back-end (BE Logic)
* Logic xác thực, đối chiếu mật khẩu đã băm trong database, ký và trả về JWT Token.
* Middleware kiểm tra Token hợp lệ (`authMiddleware`) và phân quyền người dùng (`checkRole`).
* [cite_start]Logic gửi Email cấp lại mật khẩu qua SMTP[cite: 13].

#### D. Hệ thống API Endpoints (`/api/auth`)
* [cite_start]`POST /register` -> Body: `{ fullName, email, password, phoneNumber }` (Đăng ký tài khoản)[cite: 13].
* [cite_start]`POST /login` -> Body: `{ email, password }` (Đăng nhập, trả về Token)[cite: 13].
* [cite_start]`GET /profile` -> Headers: `Authorization: Bearer <Token>` (Lấy thông tin cá nhân)[cite: 13].
* [cite_start]`PUT /profile` -> Body: `{ fullName, phoneNumber }` (Cập nhật thông tin cá nhân)[cite: 13].
* [cite_start]`PUT /change-password` -> Body: `{ oldPassword, newPassword }` (Đổi mật khẩu trực tiếp)[cite: 13].

#### E. Hướng dẫn Kiểm thử Module 1 (Test Guide)

> **Điều kiện tiên quyết:** Backend đang chạy tại `http://localhost:3000` và Frontend đang chạy tại `http://localhost:5173`. Database đã được seed bằng file `seed.sql`.

##### 🖥️ Kiểm thử qua Giao diện (Frontend)

**1. Kiểm thử Đăng nhập & Phân quyền (RBAC)**
- Mở trình duyệt, vào `http://localhost:5173` → Tự động chuyển về trang `/login`.
- Đăng nhập bằng `user@acoh.com` / `user123` → Phải chuyển hướng đến `/user/dashboard`.
- Thử truy cập `http://localhost:5173/admin/dashboard` (trong khi đang đăng nhập User) → Phải bị chặn và chuyển hướng về `/unauthorized`.
- Đăng xuất → Đăng nhập `garage@acoh.com` / `garage123` → Phải chuyển về `/garage/dashboard`.
- Đăng xuất → Đăng nhập `admin@acoh.com` / `admin123` → Phải chuyển về `/admin/dashboard`.

**2. Kiểm thử Đăng ký tài khoản mới**
- Vào trang `/register` → Nhập thông tin mới, chọn vai trò **Chủ phương tiện (User)**.
- Nhấn Đăng ký → Phải thấy thông báo thành công và tự chuyển về `/login` sau 3 giây.
- Thử đăng ký lại **email vừa dùng** → Phải thấy lỗi "Email đã được đăng ký".

**3. Kiểm thử Cập nhật Hồ sơ & Đổi mật khẩu**
- Sau khi đăng nhập, vào trang `/profile`.
- Sửa **Họ tên** hoặc **Số điện thoại** → Nhấn Lưu → Phải thấy thông báo thành công.
- Nhập **Mật khẩu hiện tại sai** → Phải thấy lỗi "Mật khẩu cũ không chính xác".
- Nhập đúng mật khẩu cũ và mật khẩu mới → Đổi thành công → Đăng xuất và đăng nhập lại bằng mật khẩu mới để xác nhận.

**4. Kiểm thử Quên mật khẩu (OTP)**
- Vào `/forgot-password` → Nhập email `user@acoh.com` → Nhấn Gửi OTP.
- Nếu SMTP chưa cấu hình: Xem **console Terminal backend** để lấy mã OTP được in ra.
- Vào `/reset-password` → Nhập email, OTP, mật khẩu mới → Xác nhận thành công.
- Đăng nhập lại bằng mật khẩu mới để xác nhận.

##### 🔌 Kiểm thử qua API trực tiếp (Dùng Postman hoặc Thunder Client)

**Đăng ký tài khoản:**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn Test",
  "email": "test@acoh.com",
  "password": "test123",
  "phoneNumber": "0909090909",
  "role": "User"
}
```
✅ Kết quả mong đợi: `{ "message": "Đăng ký tài khoản thành công!" }`

**Đăng nhập:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@acoh.com",
  "password": "user123"
}
```
✅ Kết quả mong đợi: Nhận về `{ "token": "eyJ...", "user": { ... } }` — Lưu lại token để dùng cho các API sau.

**Xem hồ sơ (cần Token):**
```
GET http://localhost:3000/api/auth/profile
Authorization: Bearer <Token lấy từ bước đăng nhập>
```
✅ Kết quả mong đợi: Trả về thông tin người dùng hiện tại.

**Đổi mật khẩu (cần Token):**
```
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer <Token>
Content-Type: application/json

{
  "oldPassword": "user123",
  "newPassword": "newpass123"
}
```
✅ Kết quả mong đợi: `{ "message": "Đổi mật khẩu thành công!" }`

**Kiểm tra phân quyền bị chặn:**
```
PUT http://localhost:3000/api/auth/profile
(Không có header Authorization)
```
✅ Kết quả mong đợi: HTTP `401 Unauthorized` — `{ "message": "Authorization header is missing" }`

---

### MODULE 2: QUẢN LÝ PHƯƠNG TIỆN (VEHICLE MANAGEMENT)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* [cite_start]**Thêm mới và số hóa xe:** Người dùng nhập các trường bắt buộc để đăng ký phương tiện lên hệ thống[cite: 13]. [cite_start]Hệ thống hỗ trợ tách biệt thuộc tính của Ô tô và Xe máy[cite: 13]. [cite_start]Cột biển số xe đặt ràng buộc duy nhất (Unique) để tránh cấu hình trùng lặp phương tiện[cite: 13].
* [cite_start]**Quản lý đa phương tiện:** Một tài khoản người dùng có thể sở hữu và theo dõi nhiều xe cùng một lúc qua mối quan hệ 1-nhiều trên Database[cite: 13].
* [cite_start]**Cập nhật số Kilomet (Odometer):** Tính năng cho phép người dùng cập nhật nhanh số km đi được thực tế hàng ngày/tuần[cite: 13]. [cite_start]Đây là biến đầu vào cốt lõi để kích hoạt logic nhắc lịch bảo dưỡng định kỳ ở Module 5[cite: 11, 13].

#### B. Thành phần Front-end (FE Interface)
* [cite_start]Trang Dashboard chứa danh sách phương tiện (hiển thị dạng Card kèm hình ảnh minh họa cho loại xe Ô tô/Xe máy)[cite: 13].
* [cite_start]Form thêm mới/chỉnh sửa phương tiện (Dropdown chọn Hãng xe, Dòng xe, Năm sản xuất, Ngày mua)[cite: 13].
* [cite_start]Dialog/Nút cập nhật nhanh số Kilomet hiện tại (Odometer) hàng ngày[cite: 13].

#### C. Thành phần Back-end (BE Logic)
* [cite_start]Xử lý các câu lệnh SQL CRUD (Create, Read, Update, Delete) tương tác với bảng `Vehicles`[cite: 13].
* [cite_start]Logic kiểm tra biển số xe trùng lặp trước khi thêm vào DB[cite: 13].
* Ràng buộc dữ liệu nâng cao: Chỉ cho phép chỉnh sửa/xóa phương tiện thuộc quyền sở hữu của User đang đăng nhập bằng cách đối chiếu `UserID` lấy từ mã token.

#### D. Hệ thống API Endpoints (`/api/vehicles`)
* [cite_start]`GET /` -> Lấy danh sách xe của User đang đăng nhập[cite: 13].
* `GET /:id` -> Xem chi tiết 1 xe cụ thể theo ID.
* [cite_start]`POST /` -> Body: `{ licensePlate, vehicleType, brand, model, manufactureYear, purchaseDate, currentOdometer }` (Thêm xe mới)[cite: 13].
* [cite_start]`PUT /:id` -> Body: `{ brand, model, manufactureYear, purchaseDate }` (Cập nhật thông tin cố định của xe)[cite: 13].
* [cite_start]`PATCH /:id/odometer` -> Body: `{ currentOdometer }` (Cập nhật nhanh chỉ số kilomet thực tế)[cite: 13].
* [cite_start]`DELETE /:id` -> Xóa phương tiện khỏi hệ thống[cite: 13].

#### E. Hướng dẫn Kiểm thử Module 2 (Test Guide)

> **Điều kiện tiên quyết:** Đảm bảo Backend và Frontend đã được khởi động. Bạn đã đăng nhập bằng tài khoản `user@acoh.com` / `user123`.

##### 🖥️ Kiểm thử qua Giao diện (Frontend)

**1. Kiểm tra danh sách phương tiện ban đầu**
- Sau khi đăng nhập, tại trang Dashboard của bạn, giao diện phải hiển thị 2 thẻ (Card) phương tiện:
  - Ô tô Toyota Vios 1.5G (Biển số: `59A-123.45`)
  - Xe máy Honda SH Mode 125cc (Biển số: `59B-678.90`)

**2. Kiểm thử thêm mới phương tiện**
- Click nút **"Thêm phương tiện mới"** ở góc phải trên.
- Nhập thông tin:
  - Loại xe: `Ô tô`
  - Biển số: `79A-888.88`
  - Hãng xe: `Ford`
  - Dòng xe: `Ranger`
  - Năm sản xuất: `2021`
  - Số km hiện tại: `25000`
- Click **"Thêm phương tiện"** → Thẻ xe Ford Ranger mới phải lập tức xuất hiện trên màn hình.
- Thử bấm thêm xe lần nữa và điền biển số trùng `79A-888.88` → Form phải báo lỗi: *"Biển số xe này đã được đăng ký trên hệ thống"*.

**3. Kiểm thử cập nhật số kilomet nhanh (Odometer)**
- Tại thẻ xe Ford Ranger vừa tạo, click nút **"Cập nhật km"**.
- Nhập giá trị mới: `26000` → Nhấn **Cập nhật** → Số km trên thẻ xe phải chuyển thành `26,000 km`.
- Tiếp tục click **"Cập nhật km"**, nhập giá trị nhỏ hơn: `25500` → Hệ thống phải từ chối và báo lỗi: *"Số km mới không được nhỏ hơn số km hiện tại"*.

**4. Kiểm thử chỉnh sửa thông tin cố định**
- Tại thẻ xe Ford Ranger, click biểu tượng **Sửa (hình cây bút)**.
- Thay đổi Hãng xe thành `Ford Raptor` và thay đổi Dòng xe.
- Nhấn **Lưu thay đổi** → Thông tin trên thẻ xe phải được cập nhật tương ứng.

**5. Kiểm thử xóa phương tiện**
- Tại thẻ xe Ford Raptor, click biểu tượng **Xóa (hình thùng rác)**.
- Xác nhận hộp thoại thông báo của trình duyệt → Thẻ xe Ford Raptor phải biến mất hoàn toàn khỏi giao diện.

##### 🔌 Kiểm thử qua API trực tiếp (Dùng Postman hoặc Thunder Client)

**Lấy danh sách xe của user đăng nhập:**
```
GET http://localhost:3000/api/vehicles
Authorization: Bearer <Token>
```
✅ Kết quả mong đợi: HTTP `200 OK` — Trả về mảng JSON chứa các xe của bạn.

**Thêm xe mới:**
```
POST http://localhost:3000/api/vehicles
Authorization: Bearer <Token>
Content-Type: application/json

{
  "licensePlate": "79A-888.88",
  "vehicleType": "Ô tô",
  "brand": "Ford",
  "model": "Ranger",
  "manufactureYear": 2021,
  "purchaseDate": "2021-05-10",
  "currentOdometer": 25000
}
```
✅ Kết quả mong đợi: HTTP `201 Created` — `{ "message": "Thêm phương tiện mới thành công!", "vehicleId": 3 }`

**Cập nhật số km (Odometer):**
```
PATCH http://localhost:3000/api/vehicles/3/odometer
Authorization: Bearer <Token>
Content-Type: application/json

{
  "currentOdometer": 26000
}
```
✅ Kết quả mong đợi: HTTP `200 OK` — `{ "message": "Cập nhật số km (Odometer) thành công!" }`

**Xóa phương tiện:**
```
DELETE http://localhost:3000/api/vehicles/3
Authorization: Bearer <Token>
```
✅ Kết quả mong đợi: HTTP `200 OK` — `{ "message": "Xóa phương tiện thành công!" }`

---


### MODULE 3: QUẢN LÝ BẢO DƯỠNG & SỬA CHỮA (MAINTENANCE MANAGEMENT)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* [cite_start]**Thiết lập kế hoạch định kỳ:** Cho phép đặt lịch hẹn hoặc chu kỳ bảo dưỡng lý thuyết (Ví dụ: Thay nhớt định kỳ sau mỗi 5000km hoặc 6 tháng)[cite: 11, 13].
* **Ghi nhận & Lưu trữ nhật ký bảo dưỡng:** Chức năng này được thiết kế phân quyền tối cao cho **Chủ Gara**. Sau khi tiến hành bảo dưỡng/sửa chữa xong cho khách, Chủ Gara điền chi tiết nội dung vật tư, số kilomet lúc sửa và tổng chi phí để lưu trữ vào bảng lịch sử hệ thống.
* [cite_start]**Đồng bộ hóa lịch sử chi phí:** Dữ liệu sau khi Gara lưu trữ sẽ hiển thị đồng bộ ở cả tài khoản của Chủ xe (để theo dõi chi phí) và tài khoản của Chủ Gara (để quản lý doanh thu và danh sách dịch vụ đã làm)[cite: 11, 13].

#### B. Thành phần Front-end (FE Interface)
* [cite_start]**Đối với Chủ xe:** Tab hiển thị kế hoạch bảo dưỡng dự kiến và trang "Nhật ký sửa chữa" xem các mốc lịch sử mà Gara đã lưu cho xe mình[cite: 13].
* **Đối với Chủ Gara:** Form nhập liệu ghi sổ bảo dưỡng chuyên sâu (chọn linh kiện thay thế, điền đơn giá, số kilomet hiện tại của xe khách, mô tả chi tiết pan bệnh).

#### C. Thành phần Back-end (BE Logic)
* [cite_start]Đọc/Ghi dữ liệu vào hai bảng `MaintenanceSchedules` và `MaintenanceHistory`[cite: 13].
* Logic BE tự động xác thực quyền ghi: Chỉ tài khoản có vai trò `Garage` sở hữu lịch hẹn tương ứng hoặc tài khoản `User` tự cập nhật lịch ngoài mới có quyền thao tác ghi sổ.

#### D. Hệ thống API Endpoints (`/api/maintenances`)
* [cite_start]`GET /schedules/:vehicleId` -> Lấy kế hoạch nhắc bảo dưỡng dự kiến của xe[cite: 13].
* [cite_start]`POST /schedules` -> Body: `{ vehicleId, categoryName, targetOdometer, targetDate, notes }` (Tạo lịch nhắc/mốc bảo dưỡng mới)[cite: 13].
* [cite_start]`PUT /schedules/:id` -> Cập nhật trạng thái lịch nhắc (`Chưa thực hiện` / `Đã hoàn thành`)[cite: 13].
* [cite_start]`GET /history/:vehicleId` -> Lấy toàn bộ lịch sử sửa chữa trong quá khứ của xe[cite: 13].
* `POST /history/garage` -> (Dành riêng cho Gara) Body: `{ vehicleId, appointmentId, executionDate, executionOdometer, totalCost, details }` (Gara trực tiếp ghi sổ lịch sử bảo dưỡng xe cho khách).

---

### MODULE 4: QUẢN LÝ ĐĂNG KIỂM & BẢO HIỂM (LEGAL & INSURANCE MANAGEMENT)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* [cite_start]**Quản lý chu kỳ Đăng kiểm:** Dành riêng cho đối tượng xe ô tô, lưu trữ ngày hết hạn đăng kiểm kế tiếp căn cứ theo thời gian kiểm định nhà nước quy định[cite: 13].
* [cite_start]**Quản lý Hợp đồng Bảo hiểm:** Lưu giữ ngày hiệu lực và ngày hết hạn của Bảo hiểm trách nhiệm dân sự bắt buộc và Bảo hiểm vật chất xe (thân vỏ)[cite: 13].
* **Trực quan hóa trạng thái giấy tờ:** So sánh mốc thời gian máy chủ thời điểm hiện tại và hạn định của giấy tờ để tự động thay đổi trạng thái và mã màu hiển thị, giúp người dùng nắm bắt thông tin ngay tức thì.

#### B. Thành phần Front-end (FE Interface)
* [cite_start]Giao diện quản lý giấy tờ: Hiển thị các khối thông tin kèm theo số ngày còn lại đến khi hết hạn[cite: 13].
* [cite_start]Thể hiện màu sắc cảnh báo động: Màu xanh (Còn hạn), Màu cam (Sắp hết hạn trong 30 ngày), Màu đỏ (Đã quá hạn)[cite: 13].
* [cite_start]Form cập nhật/gia hạn chu kỳ mới cho giấy tờ xe[cite: 13].

#### C. Thành phần Back-end (BE Logic)
* [cite_start]Thực hiện CRUD dữ liệu trên bảng `LegalDocuments`[cite: 13].
* Logic tự động phân loại trạng thái (`Status`): Tính toán hàm khoảng cách thời gian `DATEDIFF` ngày để gán trạng thái `Còn hạn`, `Sắp hết hạn` hoặc `Quá hạn`.

#### D. Hệ thống API Endpoints (`/api/legal`)
* [cite_start]`GET /:vehicleId` -> Lấy thông tin chi tiết toàn bộ giấy tờ hiện hành của xe[cite: 13].
* [cite_start]`POST /` -> Body: `{ vehicleId, documentType, issueDate, expiryDate, alertThresholdDays }` (Thêm mới hợp đồng bảo hiểm hoặc chu kỳ đăng kiểm)[cite: 13].
* [cite_start]`PUT /:id` -> Cập nhật hoặc thực hiện gia hạn thời gian cho giấy tờ xe[cite: 13].
* [cite_start]`DELETE /:id` -> Xóa bản ghi giấy tờ khỏi hệ thống[cite: 13].

---

### MODULE 5: LOGIC TÍNH TOÁN & THÔNG BÁO TỰ ĐỘNG (NOTIFICATION ENGINE)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Thông báo tức thời từ Gara (In-app Push):** Khi Chủ Gara thực hiện cập nhật trạng thái xe đã bảo dưỡng xong và lưu thông tin lịch sử thành công, hệ thống ngay lập tức kích hoạt luồng bắn thông báo tự động. Thông báo này sẽ xuất hiện trực tiếp trong app (In-app Notification) của tài khoản chủ xe để báo rằng: *"Xe [Biển số] đã hoàn tất bảo dưỡng tại Gara [Tên Gara]. Mời bạn đến nhận xe"*.
* [cite_start]**Thuật toán quét tự động định kỳ (Cron Job):** Quét ngầm hệ thống lúc 00:00 hàng ngày để gửi thông báo nhắc nhở khi xe sắp đến hạn bảo dưỡng định kỳ (qua số kilomet hoặc ngày tháng) hoặc sắp hết hạn giấy tờ xe[cite: 11].

#### B. Thành phần Front-end (FE Interface)
* [cite_start]Biểu tượng quả chuông thông báo trên thanh Header điều hướng (hiển thị chấm đỏ đếm số lượng thông báo chưa đọc)[cite: 13].
* [cite_start]Khung hiển thị Popup thông báo hoặc màn hình danh sách thông báo chi tiết[cite: 13].

#### C. Thành phần Back-end (BE Logic)
* Hàm tập trung tạo thông báo: Khi API hoàn tất bảo dưỡng của Gara được gọi thành công, BE tự động chèn một bản ghi mới vào bảng `Notifications` với `UserID` của khách hàng và định danh loại thông báo.
* [cite_start]Tích hợp Nodemailer để đồng thời gửi email thông báo nhận xe gửi trực tiếp đến hộp thư của khách[cite: 11, 13].

#### D. Hệ thống API Endpoints (`/api/notifications`)
* [cite_start]`GET /` -> Lấy danh sách thông báo của User hiện tại (Ưu tiên tin nhắn chưa đọc lên trước)[cite: 13].
* [cite_start]`PATCH /:id/read` -> Đánh dấu thông báo cụ thể là đã đọc[cite: 13].
* `POST /send-completion` -> (Internal/Garage call) API sinh thông báo gửi sang cho người dùng khi hoàn tất xe.

---

### MODULE 6: TÌM KIẾM & ĐẶT LỊCH GARAGE (GARAGE BOOKING INTEGRATION)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Quản lý xe đã bảo dưỡng của Gara (Định danh phương tiện):** Cung cấp cho Chủ Gara một không gian quản lý riêng biệt gồm:
  * *Danh sách xe đã bảo dưỡng:* Hiển thị bộ lọc tất cả các phương tiện đã từng làm dịch vụ tại xưởng.
  * *Định danh chiếc xe:* Gara có thể tra cứu chính xác lịch sử của từng chiếc xe dựa trên **Biển số xe** hoặc mã định danh duy nhất của phương tiện (`VehicleID`), hiển thị đầy đủ thông tin: Chủ xe là ai, Hãng xe gì, Dòng xe nào, Các mốc thời gian trước đây đã đến tiệm thay những gì.
* [cite_start]**Quy trình chuyển đổi trạng thái đặt lịch:** Gara tiếp nhận và chuyển đổi trạng thái lịch hẹn trực tuyến của người dùng một cách minh bạch[cite: 11, 13].

#### B. Thành phần Front-end (FE Interface)
* **Giao diện quản lý của Gara:**
  * Menu "Quản lý xe đã bảo dưỡng": Danh sách dạng bảng chứa các phương tiện đã từng đến sửa chữa, thanh tìm kiếm thông minh nhanh theo **Biển số xe**.
  * Trang "Hồ sơ định danh phương tiện": Khi click vào một chiếc xe bất kỳ, giao diện hiển thị chi tiết thông số kỹ thuật xe và lịch sử bảo dưỡng riêng biệt tại gara đó.

#### C. Thành phần Back-end (BE Logic)
* Xử lý câu lệnh SQL truy vấn kết nối (`JOIN`) giữa bảng `Vehicles`, `MaintenanceHistory` lọc theo mã `GarageID` của tài khoản đang đăng nhập để hiển thị chính xác danh sách xe đã bảo dưỡng.
* Đảm bảo tính bảo mật dữ liệu: Gara chỉ xem được thông số xe và lịch sử sửa chữa của phương tiện khi xe đó đã từng tạo lịch hẹn hoặc làm dịch vụ tại chính gara đó.

#### D. Hệ thống API Endpoints (`/api/garages` và `/api/appointments`)
* `GET /garages/serviced-vehicles` -> (Dành cho Gara) Lấy danh sách tất cả các xe đã từng bảo dưỡng tại gara (hỗ trợ phân trang, tìm kiếm theo biển số xe).
* `GET /garages/vehicle-profile/:vehicleId` -> (Dành cho Gara) Xem hồ sơ định danh chi tiết và toàn bộ lịch sử sửa chữa của chiếc xe đó tại gara.
* `PATCH /appointments/:id/complete-and-notify` -> Body: `{ odometer, totalCost, details }` (Gara xác nhận hoàn thành sửa chữa, ghi lại lịch sử bảo dưỡng đồng thời gửi thông báo qua app cho người dùng).

---

### MODULE 7: BẢO CÁO & THỐNG KÊ (DASHBOARD & ANALYTICS)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Báo cáo vận hành Gara (Garage Dashboard):** Thống kê số lượng xe đã sửa chữa trong ngày/tuần/tháng, tổng doanh thu dịch vụ thu được, các hạng mục linh kiện được thay thế nhiều nhất để chủ động nhập kho xưởng.
* [cite_start]**Phân tích chi tiêu cá nhân (User Dashboard):** Giúp người dùng xem biểu đồ tổng chi phí nuôi xe[cite: 13].

#### B. Thành phần Front-end (FE Interface)
* **Garage Analytics View:** Biểu đồ cột thể hiện lượng xe đến sửa chữa theo ngày, biểu đồ đường theo dõi doanh thu hàng tháng và bảng danh sách khách hàng thân thiết (xe đến bảo dưỡng nhiều lần).

#### C. Thành phần Back-end (BE Logic)
* Thực hiện các câu lệnh thống kê dữ liệu nâng cao (`COUNT(DISTINCT VehicleID)`) trên bảng lịch sử để tính toán chính xác tổng số lượng đầu xe độc bản mà gara đã phục vụ.

#### D. Hệ thống API Endpoints (`/api/analytics`)
* `GET /garage/dashboard` -> (Dành cho Gara) Lấy các con số báo cáo tổng quan xưởng (Tổng doanh thu, Tổng số xe đã xử lý).

---

### MODULE 8: TIỆN ÍCH NÂNG CAO & MỞ RỘNG (AI CHATBOT, XUẤT FILE BÁO CÁO & ĐÁNH GIÁ GARA)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Trợ lý ảo AI tư vấn bảo dưỡng (AutoCare AI Assistant):** Hệ thống tích hợp mô hình ngôn ngữ lớn (LLM) để làm trợ lý đắc lực giải đáp thắc mắc về kỹ thuật xe, chu kỳ bảo dưỡng lý thuyết và chẩn đoán sơ bộ các mã lỗi xe cho người dùng.
* **Xuất hóa đơn & Báo cáo thống kê (Export PDF/Excel):**
  * Chủ xe có thể xuất file Excel/PDF bảng phân tích chi tiêu cá nhân để lưu trữ ngoại tuyến.
  * Gara có thể xuất file PDF hóa đơn thanh toán bảo dưỡng chi tiết (dịch vụ, phụ tùng, đơn giá) để bàn giao cho chủ xe.
* **Hệ thống Đánh giá & Phản hồi Gara (Rating & Reviews):** Sau khi lịch hẹn bảo dưỡng chuyển sang trạng thái "Hoàn thành", khách hàng có thể chấm điểm (1-5 sao) và để lại đánh giá chất lượng phục vụ của Gara.

#### B. Thành phần Front-end (FE Interface)
* Khung chat bong bóng (Floating Chatbox) ở góc dưới màn hình hỗ trợ người dùng trò chuyện thời gian thực với AI Assistant.
* Nút "Xuất báo cáo PDF/Excel" trực quan trong các bảng thống kê chi tiêu của User và bảng quản lý doanh thu của Gara.
* Form chấm điểm đánh giá (Rating Modal) hiển thị sau khi lịch hẹn kết thúc và hiển thị điểm sao trung bình trên danh sách Gara.

#### C. Thành phần Back-end (BE Logic)
* Tích hợp API Gemini/OpenAI tại Backend để phân tích câu hỏi người dùng và trả về phản hồi hỗ trợ thông minh.
* Tích hợp các thư viện xuất file (như ExcelJS, PDFKit hoặc html2pdf) để kết xuất dữ liệu hóa đơn và chi tiêu trực tiếp sang tệp tài liệu.
* API tính toán điểm đánh giá trung bình (`AVG(Rating)`) của từng Gara dựa trên phản hồi của khách hàng.

#### D. Hệ thống API Endpoints (`/api/extensions`)
* `POST /api/extensions/ai-chat` -> Body: `{ message }` (Gửi câu hỏi lên trợ lý ảo AI).
* `GET /api/extensions/export/expenses` -> Xuất báo cáo chi tiêu của chủ xe ra file.
* `GET /api/extensions/export/invoice/:appointmentId` -> Xuất hóa đơn bảo dưỡng của lịch hẹn ra file PDF.
* `POST /api/extensions/garages/:id/reviews` -> Body: `{ rating, comment }` (Khách hàng gửi đánh giá cho Gara).
* `GET /api/extensions/garages/:id/reviews` -> Lấy danh sách đánh giá của Gara.


---

