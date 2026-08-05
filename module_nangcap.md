# TÀI LIỆU KIẾN TRÚC VÀ ĐẶC TẢ KỸ THUẬT NÂNG CẤP HỆ THỐNG ACOH (GIAI ĐOẠN 2 & MỞ RỘNG)

## 1. THÔNG TIN CHUNG & MỤC TIÊU NÂNG CẤP
* **Tên đề tài:** TÀI LIỆU ĐẶC TẢ KỸ THUẬT CÁC TÍNH NĂNG NÂNG CẤP HỆ THỐNG AUTOCARE OFFICE HELPER (ACOH)
* **Tài liệu tham chiếu:** [module.md](file:///d:/DOANTOTNGHIEP/module.md) & [project_status.md](file:///d:/DOANTOTNGHIEP/project_status.md)
* **Mục tiêu:** Định hướng kiến trúc, đặc tả chi tiết quy trình nghiệp vụ, giao diện, logic xử lý, hệ thống API và kịch bản kiểm thử cho 7 tính năng chưa thực hiện (nêu tại Phần III file `project_status.md`) nhằm phục vụ giai đoạn mở rộng sản phẩm.

---

## 2. DƠM MỤC CÁC MODULE NÂNG CẤP

1. **MODULE 1:** Tích hợp Hệ thống Gửi tin nhắn Tự động Zalo ZNS & SMS Gateway
2. **MODULE 2:** Nhận diện và Bóc tách Sổ Đăng Kiểm Tự động bằng AI OCR (Registration Certificate OCR)
3. **MODULE 3:** Nhận diện và Trích xuất Hóa đơn Sửa xe / Phiếu bảo dưỡng cũ bằng AI OCR (Repair Invoice OCR)
4. **MODULE 4:** Hệ thống Tự động Khởi tạo Bộ Lịch Bảo dưỡng Mẫu theo Thông số Xe (Auto Preset Schedule Generator)
5. **MODULE 5:** Tích hợp Cổng Thanh toán Trực tuyến (VNPAY / MoMo / ZaloPay)
6. **MODULE 6:** Kết nối Thiết bị Phần cứng OBD2 / GPS Đồng bộ Số Kilomet Thời gian thực
7. **MODULE 7:** Phát triển Ứng dụng Di động Multi-Platform (React Native / Flutter Mobile Native App)

---

## 3. CHI TIẾT CÁC MODULE NÂNG CẤP (FE, BE, API & TEST GUIDE)

---

### MODULE 1: TÍCH HỢP HỆ THỐNG GỬI TIN NHẮN TỰ ĐỘNG ZALO ZNS & SMS GATEWAY

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Bổ sung kênh gửi thông báo trực tiếp qua Zalo (Zalo Notification Service - ZNS) hoặc SMS thương hiệu (Brandname SMS) để đảm bảo chủ xe nhận được cảnh báo ngay cả khi không mở ứng dụng hoặc không dùng Email.
* **Quy trình nghiệp vụ:**
  1. Khi Cron Job hệ thống (`runSystemScan`) phát hiện giấy tờ xe (Đăng kiểm, Bảo hiểm) hoặc lịch thay nhớt/bảo dưỡng đến hạn (còn <= 7 ngày hoặc <= 500 km).
  2. Hệ thống kiểm tra cấu hình nhận thông báo của User (bật/tắt nhận Zalo/SMS).
  3. Backend gọi Zalo OpenAPI ZNS HTTP Endpoint kèm Access Token và Template ID đã đăng ký.
  4. Nếu tin nhắn Zalo ZNS gửi thành công (Response HTTP 200), hệ thống ghi log trạng thái `Sent`. Nếu thất bại (User chưa đăng ký Zalo hoặc chặn tin nhắn), tự động fallback sang SMS Gateway (như VietGuys, Twilio hoặc eSMS).

#### B. Thành phần Front-end (FE Interface)
* **Trang Cài đặt Thông báo (Notification Preferences):**
  * Toggle Switch cho phép bật/tắt nhận thông báo qua Zalo ZNS và SMS.
  * Ô nhập Số điện thoại nhận Zalo (mặc định lấy theo SĐT tài khoản).
  * Nút "Gửi thử tin nhắn Zalo" để kiểm tra kết nối Zalo OA.

#### C. Thành phần Back-end (BE Logic)
* **Zalo Zns Service (`ZaloZnsService`):**
  * Logic quản lý `refresh_token` và tự động gia hạn `access_token` với Zalo OA API.
  * Hàm `sendZnsMessage(phone, templateId, templateData)` nhận biến truyền vào (Tên khách, Biển số xe, Loại giấy tờ/bảo dưỡng, Ngày hết hạn).
* **Database Schema Update:**
  * Bổ sung bảng `NotificationLogs`: `LogID`, `UserID`, `Channel` ('ZaloZNS'|'SMS'|'Email'), `Status` ('Success'|'Failed'), `ErrorMessage`, `SentAt`.
  * Bổ sung cột vào `Users`: `ReceiveZaloNotif` (BIT), `ReceiveSmsNotif` (BIT).

#### D. Hệ thống API Endpoints (`/api/notifications/zns`)
* `POST /api/notifications/zns/test-send` -> Body: `{ phoneNumber, templateId }` (Gửi thử tin nhắn Zalo ZNS).
* `PUT /api/notifications/preferences` -> Body: `{ receiveZaloNotif, receiveSmsNotif, phoneNumber }` (Lưu cấu hình nhận tin).
* `GET /api/notifications/logs` -> Trả về danh sách nhật ký gửi tin Zalo/SMS của người dùng.

#### E. Hướng dẫn Kiểm thử Module 1 (Test Guide)
* **FE Test:** Vào Cài đặt cá nhân -> Bật "Nhận thông báo Zalo ZNS" -> Nhấn "Gửi thử tin nhắn Zalo" -> Xác nhận có thông báo Zalo ZNS gửi tới điện thoại.
* **API Test:** Gọi `POST /api/notifications/zns/test-send` với SĐT thử nghiệm -> Kiểm tra trả về Status Code 200 và Zalo ID message.

---

### MODULE 2: NHẬN DIỆN VÀ BÓC TÁCH SỔ ĐĂNG KIỂM TỰ ĐỘNG BẰNG AI OCR (REGISTRATION CERTIFICATE OCR)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Thay vì người dùng phải gõ tay từng thông tin trên Sổ đăng kiểm (Số quản lý, Ngày hết hạn, Số khung, Số máy), chỉ cần chụp ảnh mặt trong của Sổ đăng kiểm / Giấy chứng nhận kiểm định, AI sẽ tự bóc tách và điền thẳng vào form.
* **Quy trình nghiệp vụ:**
  1. Người dùng vào tab **Giấy tờ xe** -> Chọn "Tải ảnh Sổ Đăng Kiểm".
  2. Ảnh được gửi lên Backend API.
  3. BE gọi dịch vụ AI Vision (Google Cloud Vision API / Tesseract / Custom LayoutParser).
  4. Model AI tiền xử lý ảnh (cắt khung, xoay ảnh, tăng độ tương phản) -> Xử lý NLP regex trích xuất các trường:
     * *Số quản lý / Số giấy chứng nhận* (VD: `KC-1234567`)
     * *Biển số đăng ký* (VD: `30H-123.45`)
     * *Số khung (VIN)* & *Số máy*
     * *Ngày kiểm định* & *Hạn hiệu lực đăng kiểm* (VD: `15/12/2026`).
  5. BE trả về JSON dữ liệu đã bóc tách -> FE tự động fill các giá trị này vào Modal Form thêm mới/cập nhật giấy tờ đăng kiểm để người dùng rà soát và bấm "Lưu".

#### B. Thành phần Front-end (FE Interface)
* **Modal Upload & Preview Sổ Đăng Kiểm (`RegistrationOcrModal`):**
  * Khung chụp ảnh / Tải tệp ảnh Sổ đăng kiểm.
  * Hiệu ứng AI Loading & Bounding Box khoanh vùng chữ được nhận diện trên ảnh.
  * Form điền kết quả tự động kèm cảnh báo màu vàng ở các trường AI nghi ngờ chưa chính xác để người dùng sửa lại.

#### C. Thành phần Back-end (BE Logic)
* **Module Extension OCR (`RegistrationOcrService`):**
  * Tích hợp `@google-cloud/vision` hoặc thư viện OCR tiếng Việt.
  * Xây dựng bộ quy tắc Regex trích xuất ngày tháng (`DD/MM/YYYY`) đứng sau từ khóa "Có hiệu lực đến ngày" hoặc "Valid until".
  * Xử lý trường hợp ảnh mờ, lóa sáng: Trả về mức độ tin cậy (`confidenceScore`).

#### D. Hệ thống API Endpoints (`/api/extensions/ocr`)
* `POST /api/extensions/ocr/scan-registration` -> Upload `file` ảnh Sổ đăng kiểm (Multipart form data).
* **Response Body trả về:**
  ```json
  {
    "success": true,
    "confidenceScore": 0.92,
    "extractedData": {
      "documentNumber": "KC-9876543",
      "licensePlate": "59A-123.45",
      "chassisNumber": "RLHFD184000123456",
      "issueDate": "2024-06-15",
      "expiryDate": "2026-12-15"
    }
  }
  ```

#### E. Hướng dẫn Kiểm thử Module 2 (Test Guide)
* **FE Test:** Mở tab Giấy tờ xe -> Bấm "Quét Sổ Đăng Kiểm" -> Upload mẫu ảnh sổ đăng kiểm ô tô -> Xác nhận các ô "Số quản lý", "Ngày hết hạn" được điền tự động chính xác.
* **API Test:** Gọi API `POST /scan-registration` với file mẫu -> Kiểm tra dữ liệu JSON trả về có đúng các trường ngày hết hạn và biển số.

---

### MODULE 3: NHẬN DIỆN VÀ TRÍCH XUẤT HÓA ĐƠN SỬA XE / PHIẾU BẢO DƯỠNG CŨ (REPAIR INVOICE OCR)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Số hóa toàn bộ lịch sử sửa chữa cũ của xe bằng cách chụp ảnh hóa đơn/phiếu thanh toán. AI tự phân tích và trích xuất danh sách phụ tùng, chi phí và thông tin Gara.
* **Quy trình nghiệp vụ:**
  1. Chủ xe chọn "Quét Hóa đơn bảo dưỡng cũ".
  2. Upload tệp ảnh hóa đơn giấy hoặc phiếu xuất kho của tiệm sửa xe.
  3. AI OCR đọc cấu hình bảng (Table Transformer / Form Recognizer):
     * *Tên Gara thực hiện*
     * *Ngày thực hiện & Số km bàn giao*
     * *Danh sách các dòng sản phẩm/dịch vụ:* (VD: Thay nhớt Castrol 4L - 450.000đ, Thay lọc nhớt - 150.000đ, Tiền công - 100.000đ)
     * *Tổng tiền thanh toán*.
  4. Trả về màn hình xem trước dưới dạng bảng điều chỉnh. Người dùng kiểm tra và nhấn "Xác nhận lưu vào Nhật ký bảo dưỡng".

#### B. Thành phần Front-end (FE Interface)
* **Giao diện Review Hóa đơn (`InvoiceOcrReviewModal`):**
  * Màn hình chia đôi (Split view): Bên trái hiển thị ảnh chụp hóa đơn gốc, bên phải hiển thị Bảng dữ liệu trích xuất dạng Editable Table.
  * Cho phép thêm/sửa/xóa từng dòng hạng mục chi phí trước khi lưu.

#### C. Thành phần Back-end (BE Logic)
* **Invoice Parser Service (`InvoiceOcrService`):**
  * Xử lý trích xuất văn bản theo dạng bảng (Row/Column Extraction).
  * Chuẩn hóa đơn vị tiền tệ (loại bỏ chữ "đ", "VND", dấu chấm phân cách hàng nghìn).
  * Tự động liên kết bản ghi mới tạo với bảng `MaintenanceHistory` trên SQL Server.

#### D. Hệ thống API Endpoints (`/api/extensions/ocr`)
* `POST /api/extensions/ocr/scan-invoice` -> Upload `file` ảnh hóa đơn sửa xe.
* `POST /api/maintenances/history/batch-import` -> Body: Danh sách các hạng mục từ hóa đơn đã được xác nhận để lưu vào database.

#### E. Hướng dẫn Kiểm thử Module 3 (Test Guide)
* **FE Test:** Vào Nhật ký bảo dưỡng -> Chọn "Số hóa hóa đơn cũ" -> Chọn ảnh hóa đơn -> Kiểm tra danh sách dịch vụ và tổng tiền hiện đúng lên Bảng điều chỉnh -> Bấm Lưu -> Kiểm tra Lịch sử bảo dưỡng được cập nhật.

---

### MODULE 4: HỆ THỐNG TỰ ĐỘNG KHỞI TẠO BỘ LỊCH BẢO DƯỠNG MẪU THEO THÔNG SỐ XE (AUTO PRESET SCHEDULE GENERATOR)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Giúp người dùng mới không cần tự tạo thủ công từng lịch nhắc. Ngay khi bấm "Thêm xe mới", dựa vào Loại xe (Ô tô con, Xe máy, Xe tải) và Số km hiện tại / Ngày mua, hệ thống tự động tính toán và khởi tạo sẵn trọn bộ lịch nhắc bảo dưỡng tiêu chuẩn.
* **Quy trình nghiệp vụ:**
  1. Người dùng hoàn tất form thêm xe mới (VD: Ô tô Toyota Vios, Số km hiện tại: 12.000 km, Ngày mua: 01/01/2023).
  2. BE sau khi lưu xe vào bảng `Vehicles`, tự động gọi `PresetGeneratorService`.
  3. Dựa trên Ma trận bảo dưỡng chuẩn (`MaintenanceCategories`), hệ thống tính toán các mốc tiếp theo:
     * *Thay nhớt máy:* Mốc 15.000 km (Cách 3.000 km nữa).
     * *Thay lọc nhớt:* Mốc 20.000 km.
     * *Đăng kiểm tiếp theo:* Tự động cộng 12 tháng hoặc 24 tháng theo chu kỳ quy định của loại xe.
  4. Hệ thống tự động tạo một loạt bản ghi trong bảng `MaintenanceSchedules` và `LegalDocuments` ở trạng thái `Chưa thực hiện`.

#### B. Thành phần Front-end (FE Interface)
* **Checkbox tùy chọn trong Form Thêm Xe (`AddVehicleModal`):**
  * Tích chọn mặc định: *"Tự động khởi tạo lịch nhắc bảo dưỡng & thay nhớt tiêu chuẩn theo mốc km của nhà sản xuất"*.
  * Hiển thị danh sách xem trước các lịch nhắc sẽ được tự động tạo.

#### C. Thành phần Back-end (BE Logic)
* **Preset Generator Service (`PresetScheduleService`):**
  * Thuật toán làm tròn mốc km tiếp theo: `NextMilestone = Math.ceil(CurrentOdo / StepKM) * StepKM`.
  * Tự động thêm bản ghi vào `MaintenanceSchedules` với `TargetOdometer = NextMilestone`.

#### D. Hệ thống API Endpoints (`/api/vehicles`)
* `POST /api/vehicles` -> Body: `{ brand, model, currentOdometer, autoGenerateSchedules: true }`
* `GET /api/vehicles/:id/generated-schedules` -> Lấy danh sách các lịch nhắc tự động vừa sinh ra để xem/chỉnh sửa.

#### E. Hướng dẫn Kiểm thử Module 4 (Test Guide)
* **FE Test:** Thêm 1 chiếc xe ô tô mới với Odometer = 8.500 km -> Sau khi tạo xong, mở tab "Lịch nhắc bảo dưỡng" của xe đó -> Xác nhận đã có sẵn các lịch nhắc mốc 10.000 km (thay nhớt, lọc gió) mà không cần nhập tay.

---

### MODULE 5: TÍCH HỢP CỔNG THANH TOÁN TRỰC TUYẾN (VNPAY / MOMO / ZALOPAY)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Cho phép chủ xe thanh toán tiền đặt cọc giữ chỗ khi Đặt lịch hẹn với Gara, hoặc thanh toán trực tiếp Hóa đơn bảo dưỡng sau khi Gara hoàn thành sửa chữa.
* **Quy trình nghiệp vụ:**
  1. Tại màn hình Đặt lịch hẹn hoặc Hóa đơn thanh toán, người dùng chọn "Thanh toán qua VNPAY / MoMo".
  2. Backend tạo đơn hàng thanh toán, ký chữ ký số (HMAC SHA512) và sinh URL chuyển hướng thanh toán (Payment URL / QR Code).
  3. Người dùng thực hiện quét mã QR hoặc nhập thẻ ngân hàng trên cổng VNPAY/MoMo.
  4. Cổng thanh toán gọi IPN (Instant Payment Notification) Webhook về Backend ACOH để cập nhật trạng thái đơn hàng (`Paid`).
  5. Hệ thống gửi thông báo Realtime cho cả Chủ xe và Gara: "Thanh toán thành công".

#### B. Thành phần Front-end (FE Interface)
* **Modal Chọn Phương Thức Thanh Toán (`PaymentCheckoutModal`):**
  * Lựa chọn: Tiền mặt tại Gara, VNPAY QR, Ví MoMo, ZaloPay.
  * Hiển thị Mã QR Code chuyển khoản động.
  * Màn hình chờ kết quả thanh toán Realtime (tự chuyển trang thành công khi nhận Socket signal).

#### C. Thành phần Back-end (BE Logic)
* **Payment Module (`PaymentService`):**
  * Cấu hình `vnp_TmnCode`, `vnp_HashSecret`, `vnp_Url`.
  * Xử lý IPN Webhook (`/api/payments/vnpay-ipn`): Kiểm tra checksum chữ ký số, kiểm tra số tiền `vnp_Amount` khớp với hóa đơn.
* **Database Schema Update:**
  * Bổ sung bảng `Payments`: `PaymentID`, `AppointmentID`, `Amount`, `PaymentMethod`, `TransactionNo`, `Status` ('Pending'|'Success'|'Failed'), `CreatedAt`.

#### D. Hệ thống API Endpoints (`/api/payments`)
* `POST /api/payments/create-url` -> Body: `{ appointmentId, amount, paymentMethod }` (Tạo URL/QR thanh toán).
* `GET /api/payments/vnpay-ipn` -> Webhook nhận kết quả tự động từ VNPAY Server.
* `GET /api/payments/vnpay-return` -> Endpoint trả về trình duyệt sau khi người dùng hoàn tất thao tác.

#### E. Hướng dẫn Kiểm thử Module 5 (Test Guide)
* **FE Test:** Đặt 1 lịch hẹn bảo dưỡng -> Chọn thanh toán cọc 100.000đ qua VNPAY -> Quét mã QR Sandbox -> Nhập thông tin thẻ test VNPAY -> Xác nhận hiển thị thông báo "Thanh toán thành công" và trạng thái lịch hẹn chuyển sang "Đã cọc".

---

### MODULE 6: KẾT NỐI THIẾT BỊ PHẦN CỨNG OBD2 / GPS ĐỒNG BỘ SỐ KILOMET THỜI GIAN THỰC

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Loại bỏ hoàn toàn việc chủ xe phải nhớ và nhập số km thủ công. Bằng cách cắm thiết bị OBD2 (qua cổng chẩn đoán xe) hoặc bộ giám sát hành trình GPS, số km di chuyển thực tế được đẩy liên tục về máy chủ ACOH.
* **Quy trình nghiệp vụ:**
  1. Thiết bị phần cứng (OBD2 Dongle / GPS Tracker) gắn trên xe gửi dữ liệu định kỳ (JSON via MQTT/HTTP POST) chứa: `deviceID`, `currentOdometer`, `speed`, `engineStatus`.
  2. BE IoT Telemetry Service nhận dữ liệu, giải mã packet và cập nhật cột `CurrentOdometer` trong bảng `Vehicles`.
  3. Khi số km vượt qua ngưỡng bảo dưỡng, hệ thống kích hoạt ngay Notification Realtime đẩy về điện thoại chủ xe: *"Xe bạn vừa đạt mốc 20.000 km, hãy đặt lịch thay nhớt!"*.

#### B. Thành phần Front-end (FE Interface)
* **Widget Trạng thái Phương tiện Thời gian thực (`LiveVehicleTelemetry`):**
  * Biểu tượng kết nối thiết bị IoT (Đang kết nối / Mất tín hiệu).
  * Đồng hồ hiển thị số km chạy thực (Live Odometer Counter) cập nhật tự động.

#### C. Thành phần Back-end (BE Logic)
* **IoT Telemetry Gateway (`TelemetryService`):**
  * Xây dựng MQTT Broker / HTTP Webhook Ingestion Receiver nhận gói tin IoT.
  * Tự động trigger kiểm tra mốc bảo dưỡng ngay khi số Odometer tăng lên.

#### D. Hệ thống API Endpoints (`/api/telemetry`)
* `POST /api/telemetry/odometer-sync` -> Header: `X-Device-Token`. Body: `{ deviceId, odometer, timestamp }`.
* `GET /api/vehicles/:id/telemetry-status` -> Trả về trạng thái kết nối phần cứng và số km cập nhật mới nhất.

#### E. Hướng dẫn Kiểm thử Module 6 (Test Guide)
* **API Test:** Giả lập thiết bị phần cứng gửi request `POST /api/telemetry/odometer-sync` với `odometer: 15005` -> Kiểm tra số km của xe trên Dashboard tự động nhảy từ 14.800 km lên 15.005 km và thông báo cảnh báo bảo dưỡng xuất hiện.

---

### MODULE 7: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG MULTI-PLATFORM (REACT NATIVE / FLUTTER MOBILE NATIVE APP)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Đóng gói toàn bộ tính năng ứng dụng thành App di động Native cài đặt trực tiếp từ App Store (iOS) và Google Play Store (Android), tận dụng các tính năng phần cứng di động như Push Notification (FCM/APNS), Bluetooth kết nối OBD2, và Camera quét QR/OCR mượt mà.
* **Quy trình nghiệp vụ:**
  1. Chủ xe tải App ACOH từ cửa hàng ứng dụng.
  2. Đăng nhập và nhận Push Notification từ Firebase Cloud Messaging (FCM) ngay cả khi ứng dụng bị tắt hoàn toàn (Background/Killed state).
  3. Sử dụng Camera Native với tốc độ lấy nét nhanh để quét biển số xe / hóa đơn.

#### B. Thành phần Mobile Native App (Mobile UI Architecture)
* **Tech Stack:** **React Native (Expo)** hoặc **Flutter**.
* **Cấu trúc màn hình:**
  * *Bottom Tab Navigator:* Trang chủ, Xe của tôi, Đặt lịch, Thông báo, Tài khoản.
  * *Push Notification Integration:* Tích hợp `expo-notifications` kết hợp Firebase Cloud Messaging (FCM).
  * *Native Camera Module:* `expo-camera` tối ưu hóa tốc độ chụp và truyền tệp ảnh lên Server.

#### C. Thành phần Back-end (BE Logic)
* **Push Notification Service (`FcmService`):**
  * Tích hợp Firebase Admin SDK (`firebase-admin`).
  * Quản lý lưu trữ `fcmToken` thiết bị di động trong bảng `UserDevices`: `DeviceID`, `UserID`, `FcmToken`, `Platform` ('iOS'|'Android').
  * Gửi thông báo Push đến đúng thiết bị di động khi có sự kiện.

#### D. Hệ thống API Endpoints (`/api/devices`)
* `POST /api/devices/register-fcm` -> Body: `{ fcmToken, platform, deviceModel }` (Đăng ký Token nhận thông báo trên điện thoại).
* `POST /api/devices/unregister-fcm` -> Body: `{ fcmToken }` (Hủy nhận thông báo khi đăng xuất).

#### E. Hướng dẫn Kiểm thử Module 7 (Test Guide)
* **Mobile Test:** Mở App trên điện thoại Android/iOS -> Đăng nhập -> Tắt hẳn ứng dụng -> Dùng Postman kích hoạt 1 thông báo cảnh báo -> Kiểm tra điện thoại hiển thị Notification Banner trên màn hình khóa.

---

## 4. TỔNG KẾT VÀ BẢNG SO SÁNH LỘ TRÌNH DỰ ÁN

| Module nâng cấp | Mục tiêu chính | Công nghệ bổ sung | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- |
| **Module 1: Zalo ZNS & SMS** | Gửi cảnh báo trực tiếp về SĐT / Zalo | Zalo OA API, Twilio/VietGuys SDK | **Cao (Ưu tiên #1)** |
| **Module 2: AI OCR Sổ Đăng Kiểm** | Số hóa tự động giấy tờ đăng kiểm | Google Cloud Vision API / LayoutParser | **Cao (Ưu tiên #2)** |
| **Module 3: AI OCR Hóa Đơn Sửa Xe** | Số hóa nhật ký bảo dưỡng cũ | Table OCR Transformer / Regex Parser | **Trung bình** |
| **Module 4: Auto Preset Schedule** | Tự sinh lịch nhắc khi tạo xe mới | NestJS Event Emitter / Service Logic | **Cao (Ưu tiên #3)** |
| **Module 5: Thanh toán VNPAY/MoMo** | Thanh toán cọc & hóa đơn online | VNPAY SDK / Checksum HMAC SHA512 | **Trung bình** |
| **Module 6: Kết nối OBD2 / GPS** | Tự động đồng bộ số km thực tế | MQTT Broker / Hardware Webhook | **Mở rộng về sau** |
| **Module 7: Mobile Native App** | App di động Android & iOS | React Native / Expo / FCM | **Mở rộng về sau** |
