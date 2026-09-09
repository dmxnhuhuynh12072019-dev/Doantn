# TÀI LIỆU TỔNG HỢP CÁC MODULE HỆ THỐNG AUTOCARE OFFICE HELPER (ACOH)
## (Tài liệu Chuẩn Phục vụ Viết Thuyết minh Đồ án & Thiết kế Slide Báo cáo Tốt nghiệp)

---

## 📌 PHẦN I: THÔNG TIN TỔNG QUAN HỆ THỐNG

* **Tên đề tài:** XÂY DỰNG HỆ THỐNG AUTOCARE OFFICE HELPER – ỨNG DỤNG QUẢN LÝ LỊCH ĐĂNG KIỂM, BẢO DƯỠNG VÀ BẢO HIỂM PHƯƠNG TIỆN
* **Tên viết tắt dự án:** **ACOH** (*AutoCare Office Helper*)
* **Mục tiêu cốt lõi:** Số hóa toàn diện quy trình chăm sóc xe cho chủ phương tiện (nhân viên văn phòng, người bận rộn) và tối ưu hóa quản lý nghiệp vụ cho hệ thống Gara đối tác. Tự động cảnh báo mốc đăng kiểm, bảo hiểm, thay nhớt/phụ tùng theo số km (Odometer) và thời gian thực.
* **Công nghệ sử dụng (Tech Stack):**
  * **Front-end:** ReactJS 18 (Vite), TailwindCSS, Lucide React Icons, Recharts (Vẽ biểu đồ), Socket.IO Client (Realtime Chat & Thông báo), Axios.
  * **Back-end:** NestJS (Node.js Clean Architecture), Socket.IO Gateway, JWT & BCrypt, Nodemailer SMTP, Tesseract.js (AI OCR), Cron Job Task Scheduling.
  * **Cơ sở dữ liệu:** Microsoft SQL Server (MS SQL 2014+) / Supabase PostgreSQL.

---

## 📊 PHẦN II: MA TRẬN TỔNG HỢP MODULES (DÙNG TRỰC TIẾP TRÊN SLIDE)

| STT | Phân hệ (Module) | Vai trò (Actor) | Component / Giao diện chính (FE) | API Endpoints (BE) | Điểm nhấn Công nghệ & Giá trị |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **M01** | **Xác thực & Phân quyền (Auth & RBAC)** | All (User, Garage, Admin) | `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `AccountPageSection` | `/api/auth/*` | JWT Token, BCrypt, OTP Email SMTP, Protected Routes |
| **M02** | **Quản lý Phương tiện & Odometer** | User | `UserDashboard`, `VehicleCard`, `OdometerModal`, `VehicleModal` | `/api/vehicles/*` | Theo dõi Odometer lũy tiến, quản lý đa phương tiện, lọc xe |
| **M03** | **Ma trận Bảo dưỡng & Checklist Odometer** | User, Garage | `PresetOdometerChecklist`, `SmartMaintenanceAdvisorWidget`, `MaintenanceMatrixView` | `/api/maintenances/*` | Gợi ý cấp mốc 5k-10k-20k-40k km, ma trận phụ tùng, nhật ký sửa chữa |
| **M04** | **Hồ sơ Pháp lý & Chu kỳ Đăng kiểm / Bảo hiểm** | User | `LegalDocumentsTab`, `LegalDocumentModal`, `LicensePlateOcrModal` | `/api/legal/*`, `/api/extensions/ocr/*` | Tự động tính hạn DATEDIFF, AI OCR quét biển số/giấy tờ, cảnh báo màu sắc |
| **M05** | **Động cơ Cảnh báo Đa kênh (Cron & Realtime)** | Hệ thống, User, Garage | `NotificationsPageSection`, `Header (Notification Bell)`, Toast | `/api/notifications/*` | Cron Job 00:00 quét ngầm, Socket.IO WebSockets, In-app push & Email |
| **M06** | **Mạng lưới Gara & Đặt lịch Trực tuyến** | User, Garage | `GarageBookingModal`, `AppointmentsList`, `GaragesMap/List` | `/api/appointments/*`, `/api/garages/*` | Quy trình đặt lịch hẹn minh bạch, định danh hồ sơ xe tại xưởng |
| **M07** | **Quy trình Nghiệp vụ Gara 4 Bước & Hóa đơn** | Garage | `GarageDashboard`, `GarageHistoryModal`, `InvoiceModal` | `/api/garages/*`, `/api/invoices/*` | 4 bước: Tiếp nhận -> Khảo sát -> Thực hiện/Phụ tùng -> Xuất hóa đơn |
| **M08** | **Tư vấn Trực tuyến (Real-time Garage Chat)** | User, Garage | `GarageChatSection` | `/api/chat/*`, WebSockets Gateway | Nhắn tin tức thời giữa Khách & Thợ, đính kèm ngữ cảnh xe/lịch hẹn |
| **M09** | **Bảng tin Chăm sóc xe & Dịch vụ Khuyến mãi** | All Users | `NewsSection`, `NewsPageSection`, `BannerSlider`, `NewServicesSection` | `/api/news/*`, `/api/services/*` | Mẹo bảo dưỡng xe máy/ô tô, cẩm nang giao thông, banner ưu đãi |
| **M10** | **Báo cáo Thống kê & Phân tích Đa chiều (Analytics)** | User, Garage, Admin | `UserDashboard` (Recharts), `GarageDashboard`, `AdminDashboard` | `/api/analytics/*`, `/api/admin/*` | Biểu đồ chi tiêu cá nhân, doanh thu xưởng, kiểm duyệt gara & user |
| **M11** | **Trợ lý AI & Tiện ích Mở rộng (AI Assistant & Export)** | User, Garage | `AIAssistantWidget`, `ExportButton (Excel/PDF)` | `/api/extensions/ai-chat`, `/api/extensions/export/*` | AI LLM tư vấn kỹ thuật xe, xuất hóa đơn/chi tiêu ra file PDF/Excel |

---

## 🌳 PHẦN III: SƠ ĐỒ PHÂN RÃ CHỨC NĂNG HỆ THỐNG (FUNCTIONAL TREE)

```text
HỆ THỐNG AUTOCARE OFFICE HELPER (ACOH)
├── 1. Phân hệ Dùng chung (Common & Public)
│   ├── Đăng nhập / Đăng ký / Quên mật khẩu OTP
│   ├── Bảng tin tin tức, kinh nghiệm chăm sóc xe (News & Tips)
│   ├── Banner dịch vụ & Khuyến mãi (Services & Promotions)
│   └── Giới thiệu & Tiêu chuẩn hoạt động Gara
│
├── 2. Phân hệ Chủ Phương Tiện (User / Customer)
│   ├── Quản lý Hồ sơ xe & Cập nhật Odometer (Số km)
│   ├── Quản lý Pháp lý: Đăng kiểm & Bảo hiểm TNDS/Thân vỏ
│   ├── Ma trận gợi ý bảo dưỡng theo cấp km (5k, 10k, 20k, 40k, 80k km)
│   ├── Tìm kiếm Gara & Đặt lịch hẹn sửa chữa trực tuyến
│   ├── Chat Realtime trực tiếp với Garage để tư vấn kỹ thuật
│   ├── Xem biểu đồ thống kê chi tiêu nuôi xe (Biểu đồ tròn/cột)
│   ├── Nhận thông báo đa kênh (Socket.IO Realtime & Email)
│   └── Trợ lý ảo AI Assistant giải đáp thắc mắc xe
│
├── 3. Phân hệ Đối tác Garage (Garage Partner)
│   ├── Quản lý & Tiếp nhận danh sách Lịch hẹn
│   ├── Quy trình nghiệp vụ 4 bước (Tiếp nhận -> Khảo sát -> Thi công -> Bàn giao)
│   ├── Hồ sơ định danh xe đã sửa tại xưởng (Lọc theo Biển số)
│   ├── Lập phiếu bảo dưỡng, kê khai phụ tùng & Xuất hóa đơn
│   ├── Chat tư vấn và gửi báo giá cho khách hàng
│   └── Thống kê doanh thu, lượng xe phục vụ và phụ tùng thay thế
│
└── 4. Phân hệ Quản trị Hệ thống (System Admin)
    ├── Quản lý người dùng (Khóa/Kích hoạt tài khoản)
    ├── Kiểm duyệt và phê duyệt Garage đối tác
    ├── Giám sát nhật ký hoạt động hệ thống
    └── Thống kê tổng thể toàn hệ thống ACOH
```

---

## 🔍 PHẦN IV: ĐẶC TẢ CHI TIẾT TỪNG MODULE NGHIỆP VỤ

### MODULE 1: XÁC THỰC, BẢO MẬT & PHÂN QUYỀN (AUTH & RBAC)
* **Nghiệp vụ:** Đăng ký tài khoản theo Role (`User`, `Garage`), đăng nhập nhận JWT Token, quên mật khẩu gửi mã OTP 6 số qua Email SMTP (Nodemailer), đổi mật khẩu và quản lý Profile cá nhân.
* **Giao diện (FE):** `LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPasswordPage.jsx`, `AccountPageSection.jsx`.
* **Logic (BE):** Băm mật khẩu `bcrypt.hash/compare`, sinh payload JWT (UserId, Role, Email), `AuthGuard`, `RolesGuard`.
* **APIs chính:**
  * `POST /api/auth/register` - Đăng ký tài khoản mới
  * `POST /api/auth/login` - Đăng nhập, trả về Bearer Token & Role
  * `GET /api/auth/profile` - Lấy thông tin tài khoản hiện tại
  * `PUT /api/auth/profile` - Cập nhật Họ tên, Số điện thoại
  * `POST /api/auth/forgot-password` & `POST /api/auth/reset-password` - Quên/Đổi mật khẩu bằng OTP

---

### MODULE 2: QUẢN LÝ PHƯƠNG TIỆN & CHỈ SỐ ODOMETER (VEHICLE & FLEET)
* **Nghiệp vụ:** Thêm mới ô tô/xe máy, quản lý thông số (Hãng, Dòng xe, Năm sản xuất, Biển số xe duy nhất). Cho phép cập nhật số kilomet hiện tại (Odometer) - biến số cốt lõi để kích hoạt cảnh báo bảo dưỡng.
* **Giao diện (FE):** `UserDashboard.jsx`, `VehicleCard.jsx`, `VehicleModal.jsx`, `OdometerModal.jsx`.
* **Logic (BE):** Ràng buộc biển số duy nhất (Unique), kiểm tra số km mới không được nhỏ hơn số km cũ, bảo vệ dữ liệu chỉ cho chủ sở hữu thao tác.
* **APIs chính:**
  * `GET /api/vehicles` - Danh sách xe của người dùng
  * `POST /api/vehicles` - Thêm phương tiện mới
  * `PUT /api/vehicles/:id` - Sửa thông tin xe
  * `PATCH /api/vehicles/:id/odometer` - Cập nhật nhanh số km Odometer
  * `DELETE /api/vehicles/:id` - Xóa xe khỏi danh sách

---

### MODULE 3: MA TRẬN BẢO DƯỠNG & CHECKLIST ODOMETER (MAINTENANCE MANAGEMENT)
* **Nghiệp vụ:** Cung cấp bộ checklist bảo dưỡng định kỳ tự động theo cấp kilomet chuẩn quốc tế:
  * Cấp 5.000 km: Thay dầu động cơ, kiểm tra lọc gió.
  * Cấp 10.000 km: Thay lọc dầu, đảo lốp, kiểm tra phanh.
  * Cấp 20.000 km: Thay lọc gió động cơ/điều hòa, vệ sinh bugi.
  * Cấp 40.000 km: Thay bugi, dầu phanh, dầu hộp số, nước làm mát.
  * Cấp 80.000 km: Bảo dưỡng đại tu, thay dây curoa cam.
  * Hiển thị **Sổ bảo dưỡng điện tử** do Gara trực tiếp cập nhật sau mỗi lần sửa xe.
* **Giao diện (FE):** `PresetOdometerChecklist.jsx`, `SmartMaintenanceAdvisorWidget.jsx`, `MaintenanceMatrixView.jsx`, `MaintenanceHistoryTab.jsx`.
* **Logic (BE):** Thuật toán đối chiếu `currentOdometer` của xe với các mốc chuẩn để hiển thị trạng thái `An toàn` / `Cần kiểm tra ngay`.
* **APIs chính:**
  * `GET /api/maintenances/schedules/:vehicleId` - Lấy danh sách lịch nhắc bảo dưỡng
  * `POST /api/maintenances/schedules` - Tạo mốc nhắc lịch mới
  * `GET /api/maintenances/history/:vehicleId` - Xem toàn bộ nhật ký sửa chữa quá khứ

---

### MODULE 4: HỒ SƠ PHÁP LÝ, ĐĂNG KIỂM & BẢO HIỂM (LEGAL DOCUMENTS)
* **Nghiệp vụ:** Theo dõi ngày hết hạn Đăng kiểm (áp dụng cho ô tô) và Hạn bảo hiểm (TNDS bắt buộc & Thân vỏ). Tự động tính toán số ngày còn lại (`DATEDIFF`) và hiển thị mã màu cảnh báo (Xanh: Còn hạn; Vàng: Sắp hết hạn trong 30 ngày; Đỏ: Quá hạn).
* **Giao diện (FE):** `LegalDocumentsTab.jsx`, `LegalDocumentModal.jsx`, `LicensePlateOcrModal.jsx`.
* **Logic (BE):** Tự động phân loại `Status` dựa trên thời gian thực máy chủ, hỗ trợ AI OCR đọc biển số/giấy tờ xe.
* **APIs chính:**
  * `GET /api/legal/:vehicleId` - Lấy danh sách giấy tờ pháp lý của xe
  * `POST /api/legal` - Thêm mới giấy tờ / hợp đồng bảo hiểm
  * `PUT /api/legal/:id` - Cập nhật / gia hạn giấy tờ
  * `POST /api/extensions/ocr/scan-plate` - AI OCR nhận diện biển số xe

---

### MODULE 5: ĐỘNG CƠ CẢNH BÁO ĐA KÊNH (NOTIFICATION ENGINE)
* **Nghiệp vụ:** Tự động phát hiện và gửi thông báo nhắc nhở khi:
  1. Xe sắp đến hạn bảo dưỡng theo số km (còn <= 500 km) hoặc theo ngày (còn <= 7 ngày).
  2. Giấy tờ Đăng kiểm / Bảo hiểm sắp hết hạn.
  3. Gara hoàn thành sửa xe -> Bắn thông báo In-app tức thì kèm email để khách đến nhận xe.
* **Giao diện (FE):** `Header (Quả chuông thông báo có Badge đếm)`, `NotificationsPageSection.jsx`, Popup Toasts.
* **Logic (BE):**
  * Cron Job ngầm chạy định kỳ (00:00 mỗi ngày).
  * Socket.IO Gateway gửi thông báo Realtime xuống Frontend ngay khi có sự kiện.
  * Nodemailer gửi email thông báo tự động.
* **APIs chính:**
  * `GET /api/notifications` - Danh sách thông báo của người dùng
  * `PATCH /api/notifications/:id/read` - Đánh dấu thông báo đã đọc
  * `PATCH /api/notifications/read-all` - Đánh dấu đọc tất cả

---

### MODULE 6: ĐẶT LỊCH HẸN & MẠNG LƯỚI GARA DỊCH VỤ (GARAGE APPOINTMENTS)
* **Nghiệp vụ:** Chủ xe tìm kiếm danh sách Gara uy tín, chọn ngày giờ, chọn xe và nội dung cần bảo dưỡng để gửi yêu cầu đặt lịch hẹn. Gara tiếp nhận yêu cầu, duyệt lịch hoặc từ chối kèm lý do.
* **Giao diện (FE):** `GarageBookingModal.jsx`, `AppointmentsList.jsx`, `ServicesPageSection.jsx`.
* **Logic (BE):** Quản lý State Machine của Lịch hẹn: `PENDING` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` / `CANCELLED`.
* **APIs chính:**
  * `POST /api/appointments` - Tạo yêu cầu đặt lịch bảo dưỡng
  * `GET /api/appointments/my-appointments` - Xem lịch hẹn của Chủ xe
  * `GET /api/appointments/garage` - Gara xem danh sách lịch hẹn cần duyệt
  * `PATCH /api/appointments/:id/status` - Cập nhật trạng thái lịch hẹn

---

### MODULE 7: QUY TRÌNH NGHIỆP VỤ GARA 4 BƯỚC & XUẤT HÓA ĐƠN (GARAGE INVOICING)
* **Nghiệp vụ:** Chuẩn hóa quy trình làm việc tại xưởng qua 4 bước:
  1. **Bước 1 (Tiếp nhận xe):** Quét biển số, kiểm tra thông tin xe và lịch sử sửa chữa cũ.
  2. **Bước 2 (Khảo sát & Báo giá):** Lên danh sách vật tư/phụ tùng thay thế và tiền công.
  3. **Bước 3 (Thực hiện bảo dưỡng):** Kỹ thuật viên thao tác và ghi nhận số Odometer lúc làm.
  4. **Bước 4 (Hoàn tất & Bàn giao):** Lưu lịch sử bảo dưỡng vào sổ xe của khách, tự động sinh Hóa đơn điện tử và gửi thông báo hoàn tất.
* **Giao diện (FE):** `GarageDashboard.jsx`, `GarageHistoryModal.jsx`, `InvoiceModal.jsx`.
* **Logic (BE):** Transaction an toàn: Vừa tạo hóa đơn, vừa ghi nhật ký `MaintenanceHistory`, vừa kích hoạt thông báo gửi sang tài khoản khách.
* **APIs chính:**
  * `GET /api/garages/serviced-vehicles` - Danh sách hồ sơ xe đã làm dịch vụ tại xưởng
  * `POST /api/maintenances/history/garage` - Gara lưu nhật ký bảo dưỡng chi tiết
  * `GET /api/invoices/:appointmentId` - Lấy chi tiết hóa đơn dịch vụ

---

### MODULE 8: TƯ VẤN TRỰC TUYẾN (REAL-TIME GARAGE CHAT)
* **Nghiệp vụ:** Cung cấp kênh trao đổi tin nhắn trực tiếp giữa Chủ xe và Garage dịch vụ. Hỗ trợ hỏi đáp tình trạng xe, gửi ảnh/mô tả lỗi trước khi mang xe đến xưởng.
* **Giao diện (FE):** `GarageChatSection.jsx` (Giao diện Chat trực quan với danh sách hội thoại, khung chat tin nhắn, hiển thị trạng thái online/offline).
* **Logic (BE):** WebSockets Gateway kết hợp lưu trữ tin nhắn vào Database, hỗ trợ phân loại cuộc trò chuyện theo `userId` và `garageId`.
* **APIs chính:**
  * `GET /api/chat/conversations` - Lấy danh sách các cuộc hội thoại
  * `GET /api/chat/messages/:conversationId` - Lấy lịch sử tin nhắn
  * `POST /api/chat/send` - Gửi tin nhắn mới (kết hợp phát Socket Event)

---

### MODULE 9: BẢNG TIN CHĂM SÓC XE & KHUYẾN MÃI (NEWS & PROMOTIONS)
* **Nghiệp vụ:** Cung cấp kênh tin tức hữu ích cho người dùng: Kinh nghiệm lái xe an toàn, mẹo bảo quản xe mùa mưa/mùa nắng, cẩm nang quy định đăng kiểm mới, và các gói ưu đãi dịch vụ của gara liên kết.
* **Giao diện (FE):** `NewsSection.jsx`, `NewsPageSection.jsx`, `BannerSlider.jsx`, `NewServicesSection.jsx`.
* **Logic (BE):** Quản lý bài viết danh mục tin tức, phân trang bài viết, lọc theo chủ đề (Bảo dưỡng, Đăng kiểm, Khuyến mãi).
* **APIs chính:**
  * `GET /api/news` - Lấy danh sách tin tức mới nhất
  * `GET /api/news/:id` - Xem chi tiết bài viết
  * `GET /api/services/promotions` - Danh sách gói khuyến mãi dịch vụ

---

### MODULE 10: BÁO CÁO THỐNG KÊ & PHÂN TÍCH VẬN HÀNH (ANALYTICS & DASHBOARD)
* **Nghiệp vụ:**
  * **Chủ xe (User):** Xem biểu đồ phân tích cơ cấu chi tiêu nuôi xe (Tiền nhớt, Đăng kiểm, Bảo hiểm, Sửa chữa) theo từng tháng qua biểu đồ trực quan (Recharts).
  * **Gara (Garage):** Thống kê tổng doanh thu theo tuần/tháng, số lượng lượt xe phục vụ, top dịch vụ được làm nhiều nhất.
  * **Quản trị viên (Admin):** Thống kê tổng số User, Garage, Lịch hẹn, phê duyệt tài khoản gara và quản trị toàn hệ thống.
* **Giao diện (FE):** `UserDashboard.jsx`, `GarageDashboard.jsx`, `AdminDashboard.jsx`.
* **Logic (BE):** Truy vấn tổng hợp dữ liệu SQL (`SUM`, `COUNT`, `GROUP BY`, `DATEDIFF`).
* **APIs chính:**
  * `GET /api/analytics/user/expenses` - Thống kê chi tiêu của chủ xe
  * `GET /api/analytics/garage/dashboard` - Báo cáo vận hành của Gara
  * `GET /api/admin/system-stats` - Thống kê toàn hệ thống cho Admin

---

### MODULE 11: TRỢ LÝ AI & TIỆN ÍCH MỞ RỘNG (AI ASSISTANT & EXPORT)
* **Nghiệp vụ:**
  * **AutoCare AI Assistant:** Trợ lý AI tích hợp mô hình ngôn ngữ lớn giúp giải đáp thắc mắc về lỗi động cơ, tư vấn dầu nhớt phù hợp theo dòng xe và giải thích các mốc đăng kiểm.
  * **Xuất báo cáo PDF / Excel:** Cho phép tải về bảng kê chi phí bảo dưỡng cá nhân và xuất hóa đơn sửa chữa dạng PDF tiêu chuẩn.
* **Giao diện (FE):** Widget Chat AI, nút "Xuất file PDF/Excel".
* **Logic (BE):** Kết nối API AI Engine (Gemini/OpenAI) và module xuất báo cáo dữ liệu.
* **APIs chính:**
  * `POST /api/extensions/ai-chat` - Gửi câu hỏi cho AI chẩn đoán kỹ thuật
  * `GET /api/extensions/export/expenses` - Tải xuống file chi tiêu cá nhân

---

## 🎬 PHẦN V: KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP THEO TỪNG SLIDE

| Bước | Slide | Vai trò | Nội dung Demo trực tiếp trước Hội đồng | Kết quả hiển thị |
| :---: | :---: | :---: | :--- | :--- |
| **1** | Slide Giới thiệu | Khách vãng lai | Vào trang chủ: Lướt xem **Bảng tin kinh nghiệm xe**, **Gói dịch vụ**, **Banner khuyến mãi**. | Giao diện hiện đại, mượt mà |
| **2** | Slide Người dùng | User | Đăng nhập tài khoản Chủ xe -> Vào Dashboard xem danh sách xe -> **Cập nhật số Odometer**. | Số km cập nhật, kích hoạt checklist |
| **3** | Slide Checklist | User | Mở tab **Preset Odometer Checklist** -> Xem gợi ý hạng mục cần làm ở cấp km hiện tại. | Trực quan hóa các mốc 5k, 10k, 20k km |
| **4** | Slide Đặt lịch | User | Chọn Gara uy tín -> Điền form **Đặt lịch hẹn bảo dưỡng**. | Lịch hẹn chuyển sang trạng thái chờ duyệt |
| **5** | Slide Chat Realtime | User & Garage | Mở **Garage Chat** -> Nhắn tin hỏi tình trạng xe và báo giá sơ bộ. | Tin nhắn tức thì bằng Socket.IO |
| **6** | Slide Nghiệp vụ Gara | Garage | Đăng nhập Gara -> Duyệt lịch hẹn -> Mở phiếu bảo dưỡng -> **Kê khai phụ tùng & Hoàn tất**. | Lưu nhật ký, sinh hóa đơn |
| **7** | Slide Thông báo | User | Kiểm tra Header chuông thông báo -> Thấy **Thông báo xe đã bảo dưỡng xong** + Email nhận xe. | Thông báo realtime In-App & Email |
| **8** | Slide Thống kê | User & Garage | Xem **Biểu đồ chi tiêu cá nhân** (User) và **Báo cáo doanh thu xưởng** (Garage). | Biểu đồ Recharts sinh động |
| **9** | Slide Quản trị | Admin | Đăng nhập Admin -> Xem **Thống kê toàn hệ thống**, quản lý duyệt Gara. | Bảng điều khiển quản trị toàn diện |

---

## 💡 PHẦN VI: BỘ CÂU HỎI THƯỜNG GẶP TẠI HỘI ĐỒNG (Q&A DEFENSE)

> [!TIP]
> **Câu hỏi 1: Hệ thống tính toán cảnh báo bảo dưỡng dựa trên tiêu chí nào?**
> * **Trả lời:** Hệ thống kết hợp 2 tiêu chí song song:
>   1. **Theo số Kilomet (Odometer):** Dựa vào số km người dùng cập nhật hoặc Gara ghi nhận, so sánh với các mốc chuẩn kỹ thuật (5.000km, 10.000km, 20.000km,...). Khi số km còn lại <= 500 km sẽ kích hoạt cảnh báo.
>   2. **Theo Thời gian (DATEDIFF):** Cron Job quét hàng ngày so sánh ngày hết hạn của Đăng kiểm và Bảo hiểm với thời điểm hiện tại. Khi còn <= 30 ngày sẽ chuyển sang màu cảnh báo và gửi thông báo đa kênh.

> [!TIP]
> **Câu hỏi 2: Tính năng Chat Realtime và Cảnh báo hoạt động như thế nào?**
> * **Trả lời:** Hệ thống sử dụng công nghệ **WebSockets (Socket.IO Gateway)** ở Backend NestJS kết hợp Socket.IO Client ở ReactJS. Khi Gara cập nhật trạng thái xe hoặc người dùng gửi tin nhắn, sự kiện được emit tức thời đến Room tương ứng mà không cần phải reload trang.

> [!TIP]
> **Câu hỏi 3: Quyền riêng tư dữ liệu giữa các Gara được giải quyết ra sao?**
> * **Trả lời:** Hệ thống áp dụng cơ chế phân quyền đa tầng (RBAC) và kiểm tra sở hữu ở tầng Service Backend. Một Gara chỉ có quyền xem thông số và lịch sử của chiếc xe khi chiếc xe đó đã từng đặt lịch hoặc bảo dưỡng tại chính Gara đó (`GarageID` khớp trong bảng `MaintenanceHistory`).
