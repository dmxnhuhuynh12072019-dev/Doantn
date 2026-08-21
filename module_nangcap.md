# TÀI LIỆU KIẾN TRÚC VÀ ĐẶC TẢ KỸ THUẬT NÂNG CẤP HỆ THỐNG ACOH (GIAI ĐOẠN 2 & MỞ RỘNG)

## 1. THÔNG TIN CHUNG & MỤC TIÊU NÂNG CẤP
* **Tên đề tài:** TÀI LIỆU ĐẶC TẢ KỸ THUẬT CÁC TÍNH NĂNG NÂNG CẤP HỆ THỐNG AUTOCARE OFFICE HELPER (ACOH)
* **Tài liệu tham chiếu:** [module.md](file:///d:/DOANTOTNGHIEP/module.md) & [project_status.md](file:///d:/DOANTOTNGHIEP/project_status.md)
* **Mục tiêu:** Định hướng kiến trúc, đặc tả chi tiết quy trình nghiệp vụ, giao diện, logic xử lý, hệ thống API và kịch bản kiểm thử cho các tính năng nâng cấp cốt lõi (AI OCR biển số ô tô & WebCam, Luồng bảo dưỡng 4 bước, Phân quyền vai trò theo gói mốc km, Tối ưu Header Responsive & Performance) phục vụ báo cáo hội đồng bảo vệ và vận hành gara thực tế.

---

## 2. DANH MỤC CÁC MODULE NÂNG CẤP

1. **MODULE 1:** Tích hợp Hệ thống Gửi tin nhắn Tự động Zalo ZNS & SMS Gateway
2. **MODULE 2:** Nhận diện và Bóc tách Sổ Đăng Kiểm Tự động bằng AI OCR (Registration Certificate OCR)
3. **MODULE 3:** Nhận diện và Trích xuất Hóa đơn Sửa xe / Phiếu bảo dưỡng cũ bằng AI OCR (Repair Invoice OCR)
4. **MODULE 4:** Hệ thống Tự động Khởi tạo Bộ Lịch Bảo dưỡng Mẫu theo Thông số Xe (Auto Preset Schedule Generator)
5. **MODULE 5:** Tích hợp Cổng Thanh toán Trực tuyến (VNPAY / MoMo / ZaloPay)
6. **MODULE 6:** Kết nối Thiết bị Phần cứng OBD2 / GPS Đồng bộ Số Kilomet Thời gian thực
7. **MODULE 7:** Phát triển Ứng dụng Di động Multi-Platform (React Native / Flutter Mobile Native App)
8. **MODULE 8:** Nhận diện Biển số Xe Ô tô Thực tế bằng AI OCR & WebCam Trực tiếp (Automobile OCR & WebCam Integration)
9. **MODULE 9:** Quy trình Nghiệp vụ Bảo dưỡng Ô tô 4 Bước & Phân quyền Vai trò (4-Step Maintenance Workflow & Role-Based Permissions)
10. **MODULE 10:** Tối ưu hóa Giao diện Header Responsive & Hiệu năng Dashboard (UI/UX Responsive Layout & Performance Optimization)

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
* **Mục tiêu:** Thay vì người dùng phải gõ tay từng thông tin trên Sổ đăng kiểm (Số quản lý, Ngày hết hạn, Số khung, Số máy), chỉ cần chụp ảnh mặt trong của Sổ đăng kiểm / Giấy chứng nhận kiểm định ô tô, AI sẽ tự bóc tách và điền thẳng vào form.
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

#### D. Hệ thống API Endpoints (`/api/extensions/ocr`)
* `POST /api/extensions/ocr/scan-registration` -> Upload `file` ảnh Sổ đăng kiểm (Multipart form data).

---

### MODULE 3: NHẬN DIỆN VÀ TRÍCH XUẤT HÓA ĐƠN SỬA XE / PHIẾU BẢO DƯỠNG CŨ (REPAIR INVOICE OCR)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:** Số hóa toàn bộ lịch sử sửa chữa cũ của xe bằng cách chụp ảnh hóa đơn/phiếu thanh toán. AI tự phân tích và trích xuất danh sách phụ tùng, chi phí và thông tin Gara.
* **Quy trình nghiệp vụ:**
  1. Chủ xe chọn "Quét Hóa đơn bảo dưỡng cũ".
  2. Upload tệp ảnh hóa đơn giấy hoặc phiếu xuất kho của tiệm sửa xe.
  3. AI OCR đọc cấu hình bảng:
     * *Tên Gara thực hiện*
     * *Ngày thực hiện & Số km bàn giao*
     * *Danh sách các dòng sản phẩm/dịch vụ*
     * *Tổng tiền thanh toán*.
  4. Trả về màn hình xem trước dưới dạng bảng điều chỉnh. Người dùng kiểm tra và nhấn "Xác nhận lưu vào Nhật ký bảo dưỡng".

---

### MODULE 8: NHẬN DIỆN BIỂN SỐ XE Ô TÔ THỰC TẾ BẰNG AI OCR & WEBCAM TRỰC TIẾP (AUTOMOBILE OCR & WEBCAM INTEGRATION)

#### A. Mô tả chức năng & Chi tiết quy trình nghiệp vụ
* **Mục tiêu:**
  * **Tập trung 100% vào Ô tô / Xe hơi**: Loại bỏ hoàn toàn quy trình nhận diện xe máy (vì trên thực tế ô tô mới có chu kỳ bảo dưỡng, đăng kiểm nghiêm ngặt).
  * **Xử lý bóc tách thật (Không dữ liệu test / fix cứng)**: Loại bỏ các đoạn code mock/hardcode biển số mẫu (`30G-567.89`, `69D1-666.66`, `59A-123.45`...). Sử dụng AI Tesseract OCR bóc tách thực tế từ hình ảnh bất kỳ do người dùng/hội đồng bảo vệ tải lên.
  * **Tích hợp Camera/WebCam trực tiếp**: Cho phép nhân viên gara bật WebCam trên laptop/máy tính hoặc camera thiết bị di động (`navigator.mediaDevices.getUserMedia`) để chụp ảnh xe ngay tại cầu nâng/cổng gara.
* **Quy trình nghiệp vụ:**
  1. Nhân viên Lễ tân / Kỹ thuật bấm chọn "Scan Biển số Xe".
  2. Lựa chọn nguồn ảnh: **Chụp từ WebCam/Camera trực tiếp** hoặc **Tải tệp ảnh ô tô từ máy tính**.
  3. Khi chụp WebCam: Hệ thống hiển thị luồng video thời gian thực, người dùng căn chỉnh biển số xe ô tô vào khung và bấm "Chụp ảnh".
  4. Ảnh (File/Blob) được gửi tới Endpoint Backend `POST /api/extensions/ocr/scan-plate`.
  5. Tesseract OCR bóc tách chuỗi chữ & số thực tế -> Regex lọc chuẩn định dạng biển số Ô tô Việt Nam (`30G-567.89`, `51K-123.45`, `30E-12345`...).
  6. FE hiển thị kết quả bóc tách lên ô Input có thể chỉnh sửa (Editable Text Field) để nhân viên rà soát lại nếu ảnh bị bẩn/lóa sáng trước khi thực hiện tra cứu hồ sơ.

#### B. Thành phần Front-end (FE Interface)
* **Modal Quét Biển Số Ô tô (`LicensePlateScannerModal`):**
  * Toggle Chế độ: `[Chụp bằng Camera/WebCam]` | `[Tải tệp ảnh lên]`.
  * Khung xem video WebCam (`<video autoPlay playsInline />`) kèm nút chuyển camera (Front/Back) và nút "Chụp ảnh".
  * Canvas chụp snapshot chuyển thành File Blob gửi API.
  * Ô nhập kết quả nhận diện biển số ô tô cho phép chỉnh sửa trực tiếp.

#### C. Thành phần Back-end (BE Logic)
* **Extensions Service (`ExtensionsService.scanPlate`):**
  * Loại bỏ toàn bộ mock hardcoded strings (`69D1-666.66`, `30G-567.89`, `59A-123.45`, `WAVE`, `SANTA`, etc.).
  * Điều chỉnh bộ regex `extractPlateFromText` tập trung vào định dạng biển số ô tô (dạng 1 dòng hoặc 2 dòng của ô tô).
  * Trả về kết quả bóc tách thật cùng hồ sơ xe trong CSDL nếu tìm thấy.

#### D. Hệ thống API Endpoints (`/api/extensions/ocr`)
* `POST /api/extensions/ocr/scan-plate` -> Upload file ảnh hoặc blob từ webcam (`multipart/form-data`) -> Trả về: `{ licensePlate: "...", vehicleId: 10, vehicleProfile: { ... } }`.

---

### MODULE 9: QUY TRÌNH NGHIỆP VỤ BẢO DƯỠNG Ô TÔ 4 BƯỚC & PHÂN QUYỀN VAI TRÒ (4-STEP MAINTENANCE WORKFLOW & ROLE-BASED PERMISSIONS)

#### A. Chi tiết Luồng Bảo dưỡng Ô tô 4 Bước (Workflow Flow)
1. **Bước 1 (Tiếp nhận & Định danh)**:
   - Nhân viên Lễ tân/Gara mở tính năng Scan Biển số (Camera/Upload) tiếp nhận xe vào xưởng.
   - Hệ thống bóc tách biển số xe -> Tự động truy xuất hồ sơ ô tô, chủ xe, và toàn bộ lịch sử bảo dưỡng trước đây (tại gara này hoặc liên gara).
2. **Bước 2 (Kiểm tra & Lên phương án)**:
   - Chuyển hồ sơ xe sang bộ phận Kỹ thuật viên/Kỹ sư.
   - Kỹ thuật viên kiểm tra xe thực tế và đối chiếu với **Bộ danh mục mốc bảo dưỡng chuẩn theo km dành cho ô tô**:
     * *Mốc 5.000 km / 3 tháng*: Thay dầu động cơ, vệ sinh lọc gió, kiểm tra nước rửa kính/nước làm mát.
     * *Mốc 10.000 km / 6 tháng*: Thay dầu động cơ, thay lọc dầu, đảo lốp, kiểm tra hệ thống phanh.
     * *Mốc 20.000 km / 12 tháng*: Thay dầu, thay lọc dầu, thay lọc gió động cơ, thay lọc gió máy lạnh, cân bằng động bánh xe.
     * *Mốc 40.000 km / 24 tháng*: Thay toàn bộ dầu số, dầu cầu, nước làm mát, lọc nhiên liệu, bugi, dầu phanh.
     * *Mốc 75.000 km & 100.000 km*: Kiểm tra bảo dưỡng toàn bộ dây curoa, bơm nước, rô tuân, giảm xóc.
3. **Bước 3 (Báo giá & Xác nhận)**:
   - Kỹ thuật viên tích chọn các hạng mục cần làm từ gói mốc km -> Hệ thống tự động chuyển phiếu kiểm tra sang bộ phận Lễ tân / Service Advisor.
   - Lễ tân lập bảng báo giá tổng thể (Phụ tùng + Tiền công) -> Gửi báo giá cho Khách hàng qua hệ thống hoặc thông báo trực tiếp -> Khách hàng bấm "Xác nhận báo giá".
4. **Bước 4 (Thi công & Nghiệm thu)**:
   - Kỹ thuật viên tiến hành thay thế phụ tùng & sửa chữa -> Cập nhật trạng thái "Hoàn tất thi công".
   - Hệ thống tự động ghi nhận dữ liệu vào `MaintenanceHistory`, cập nhật mốc Odometer mới của xe và xuất **Hóa đơn thanh toán (Invoice)**.

#### B. Phân quyền và Vai trò Người dùng (Roles & Permissions)
* **Khách hàng (`customer` / `user`)**:
  * Đặt lịch hẹn bảo dưỡng ô tô trực tuyến.
  * Theo dõi tiến độ xe đang bảo dưỡng real-time qua thanh trạng thái 4 bước (`Tiếp nhận` -> `Đang kiểm tra` -> `Đang báo giá` -> `Đang thi công` -> `Hoàn thành`).
  * Xem & duyệt báo giá; xem lại lịch sử bảo dưỡng & tải hóa đơn.
* **Kỹ thuật viên / Kỹ sư (`technician` / `mechanic`)**:
  * Tiếp nhận phiếu kiểm tra kỹ thuật xe.
  * Tích chọn nhanh các hạng mục bảo dưỡng từ Danh mục gói mốc km chuẩn (checkbox trực quan, không gõ chữ thô).
  * Chuyển trạng thái phiếu kiểm tra cho Lễ tân.
* **Lễ tân / Sale / Garage Admin (`advisor` / `admin` / `garage`)**:
  * Mở Camera/WebCam quét biển số xe tiếp nhận xe tại xưởng.
  * Đơn giá phụ tùng, tổng hợp tiền công và phát hành Báo giá.
  * Nghiệm thu xe, xác nhận thanh toán & xuất hóa đơn.

---

### MODULE 10: TỐI ƯU HÓA GIAO DIỆN HEADER RESPONSIVE & HIỆU NĂNG DASHBOARD (UI/UX RESPONSIVE LAYOUT & PERFORMANCE OPTIMIZATION)

#### A. Sửa lỗi vỡ Layout Header Responsive
* **Hiện trạng lỗi:** Trên màn hình Mobile và Tablet (chiều rộng nhỏ hơn 768px - 1024px), menu điều hướng header bị đè lên nội dung, nhảy layout khi cuộn trang hoặc khi bấm bật menu hamburger.
* **Giải pháp khắc phục:**
  1. Tối ưu lại container `Header.jsx`: Thiết lập `sticky top-0 z-50` chuẩn, sử dụng `backdrop-blur-md` kết hợp `bg-white/95 dark:bg-slate-900/95`.
  2. Tách biệt thanh Top Announcement Bar và Main Control Bar khi cuộn trang, ẩn gọn gàng bằng CSS `max-h` mà không làm thay đổi vị trí của dòng menu chính.
  3. Cấu hình lại Slide-over Mobile Drawer Menu (`isMobileMenuOpen`): Sử dụng `fixed inset-0 z-50` phủ toàn màn hình kèm `overflow-y-auto` để đảm bảo menu mobile hiển thị mượt mà trên mọi thiết bị.

#### B. Tối ưu Hiệu năng Dashboard & Bảng biểu Báo cáo
* Tải dữ liệu Dashboard theo dạng phân trang/lazy loading.
* Sử dụng `React.memo` và `useCallback` cho các widget biểu đồ và bảng lịch sử bảo dưỡng để loại bỏ độ trễ (lag) khi thao tác chuyển tab.

---

## 4. TỔNG KẾT VÀ BẢNG SO SÁNH LỘ TRÌNH DỰ ÁN

| Module nâng cấp | Mục tiêu chính | Công nghệ bổ sung | Mức độ ưu tiên |
| :--- | :--- | :--- | :--- |
| **Module 1: Zalo ZNS & SMS** | Gửi cảnh báo trực tiếp về SĐT / Zalo | Zalo OA API, Twilio/VietGuys SDK | **Cao (Ưu tiên #1)** |
| **Module 2: AI OCR Sổ Đăng Kiểm** | Số hóa tự động giấy tờ đăng kiểm ô tô | Google Cloud Vision API / Tesseract | **Cao (Ưu tiên #2)** |
| **Module 3: AI OCR Hóa Đơn Sửa Xe** | Số hóa nhật ký bảo dưỡng cũ | Table OCR Transformer / Regex Parser | **Trung bình** |
| **Module 4: Auto Preset Schedule** | Tự sinh lịch nhắc khi tạo xe mới | NestJS Event Emitter / Service Logic | **Cao (Ưu tiên #3)** |
| **Module 5: Thanh toán VNPAY/MoMo** | Thanh toán cọc & hóa đơn online | VNPAY SDK / Checksum HMAC SHA512 | **Trung bình** |
| **Module 6: Kết nối OBD2 / GPS** | Tự động đồng bộ số km thực tế | MQTT Broker / Hardware Webhook | **Mở rộng về sau** |
| **Module 7: Mobile Native App** | App di động Android & iOS | React Native / Expo / FCM | **Mở rộng về sau** |
| **Module 8: AI OCR Biển số Ô tô & WebCam** | Chụp WebCam & Bóc tách thực biển số ô tô | Tesseract.js / WebCam HTML5 API | **Đã triển khai (Cốt lõi)** |
| **Module 9: Luồng Bảo dưỡng 4 Bước & Roles** | Quy trình bảo dưỡng ô tô chuẩn 4 bước & phân quyền | NestJS RBAC / React Checkbox Presets | **Đã triển khai (Cốt lõi)** |
| **Module 10: Fix Header Responsive & UX** | Sửa vỡ layout header & tối ưu lag dashboard | Tailwind Responsive / React Memo | **Đã triển khai (Cốt lõi)** |
