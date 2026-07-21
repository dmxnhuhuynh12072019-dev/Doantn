# Kịch bản kiểm thử Module 8 - Tiện ích nâng cao & Mở rộng (AI Chatbot, Xuất file & Đánh giá Gara)

Tài liệu này cung cấp kịch bản kiểm thử từng bước (step-by-step) dành cho Module 8, bao gồm cả kiểm thử qua API Endpoints (Backend) và kiểm thử qua giao diện người dùng (Frontend).

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

### Bước 2: Kiểm thử API Trợ lý ảo AI Chatbot
* **API Route:** `POST http://localhost:3000/api/extensions/ai-chat`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "message": "Xe tôi bị báo lỗi đèn cá vàng thì phải làm sao?"
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. backend trả về phản hồi tư vấn thông minh chứa chuỗi ký tự hướng dẫn chi tiết về lỗi động cơ (Check Engine).

---

### Bước 3: Khách hàng chấm điểm và viết đánh giá (Review) cho Gara
* **API Route:** `POST http://localhost:3000/api/extensions/garages/1/reviews`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Body (JSON):**
  ```json
  {
    "rating": 5,
    "comment": "Dịch vụ ở AutoCare Central Garage rất tốt, nhân viên kỹ thuật tay nghề cao, tư vấn nhiệt tình."
  }
  ```
* **Kết quả mong đợi:** HTTP `201 Created`. backend trả về:
  ```json
  {
    "message": "Đánh giá chất lượng Gara thành công!"
  }
  ```

---

### Bước 4: Lấy danh sách đánh giá của Gara
* **API Route:** `GET http://localhost:3000/api/extensions/garages/1/reviews`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`. Trả về mảng danh sách đánh giá của Gara có ID 1. Bản ghi đánh giá bạn vừa tạo ở Bước 3 phải xuất hiện đầu tiên, ghi nhận đúng số sao `5` và bình luận tương ứng kèm theo tên người viết `ReviewerName`.

---

### Bước 5: Khách hàng xuất báo cáo chi tiêu cá nhân ra file CSV
* **API Route:** `GET http://localhost:3000/api/extensions/export/expenses`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`.
  * Header phản hồi phải chứa:
    * `Content-Type: text/csv; charset=utf-8`
    * `Content-Disposition: attachment; filename=user_expenses.csv`
  * Dữ liệu trả về là chuỗi CSV chứa danh sách lịch sử sửa chữa và các mốc chi phí của bạn.

---

### Bước 6: Khách hàng xuất hóa đơn bảo dưỡng chi tiết ra file CSV
* **API Route:** `GET http://localhost:3000/api/extensions/export/invoice/1`
* **Header:** `Authorization: Bearer ${USER_TOKEN}`
* **Kết quả mong đợi:** HTTP `200 OK`.
  * Header phản hồi phải chứa:
    * `Content-Type: text/csv; charset=utf-8`
    * `Content-Disposition: attachment; filename=invoice_appt_1.csv`
  * Dữ liệu trả về là tệp biên nhận hóa đơn có đầy đủ thông tin tên xe, biển số, chi tiết linh kiện thay thế và tổng tiền.

---

## PHẦN 2: KIỂM THỬ TRÊN GIAO DIỆN NGƯỜI DÙNG (FRONTEND)

### Kịch bản 1: Trò chuyện và hỏi đáp cùng Trợ lý ảo AI Assistant
1. Truy cập `http://localhost:5173/login`, đăng nhập bằng tài khoản `user@acoh.com` / `user123`.
2. Ở góc dưới bên phải màn hình, kiểm tra xem có biểu tượng bong bóng tròn màu xanh dương nhấp nháy hình chat hay không.
3. Click vào biểu tượng bong bóng:
   * **Kết quả mong đợi:** Một cửa sổ chatbox mở lên ở góc phải với tin nhắn chào mừng mặc định của robot AI Assistant.
4. Nhập câu hỏi vào ô chat: *"Khi nào tôi cần thay nhớt động cơ xe máy và ô tô?"* và bấm nút gửi (hoặc nhấn Enter).
   * **Kết quả mong đợi:**
     * Tin nhắn của bạn xuất hiện bên phải.
     * Xuất hiện hiệu ứng 3 chấm nhấp nháy (typing indicator) báo robot đang trả lời.
     * Sau 0.5 giây, robot AI trả về chi tiết các mốc thay nhớt khuyến nghị bằng tiếng Việt rõ ràng, chuyên nghiệp.
5. Thử hỏi các từ khóa khác như: *"đăng kiểm"*, *"áp suất lốp"*, *"đèn báo cá vàng"* để xác minh robot phản hồi chính xác nội dung kỹ thuật.
6. Bấm nút **✕** ở góc trên cửa sổ chat để đóng hộp thoại chat lại.

---

### Kịch bản 2: Đăng đánh giá xếp hạng Gara
1. Nhấp chọn chiếc xe Toyota Vios (`59A-123.45`) $\rightarrow$ chọn tab **"Đặt lịch bảo dưỡng"**.
2. Tìm lịch hẹn có trạng thái **Hoàn thành** (nếu chưa có, hãy đăng nhập gara duyệt hoàn tất một lịch hẹn như kịch bản Module 6).
3. Bấm vào nút **"⭐ Đánh giá Gara"** trên thẻ lịch hẹn đó:
   * **Kết quả mong đợi:** Mở Modal đánh giá chất lượng dịch vụ Gara.
4. Thực hiện chấm điểm:
   * Di chuột lên dải sao $\rightarrow$ Các ngôi sao đổi màu vàng theo vị trí chuột.
   * Click chọn **5 sao** $\rightarrow$ Dòng chữ trạng thái đổi thành *"Rất hài lòng! 😍"*.
   * Nhập bình luận: *"AutoCare Q5 làm việc rất chuyên nghiệp, phòng chờ mát mẻ, thợ sửa tay nghề cứng!"*.
   * Bấm **"Gửi đánh giá"**.
5. **Kết quả mong đợi:** Hệ thống hiển thị thông báo cảm ơn, modal đóng lại.
6. Để kiểm tra điểm trung bình: Bấm nút **"+ Đặt lịch sửa xe"** ở tab lịch hẹn $\rightarrow$ Nhìn vào danh sách dropdown chọn Gara $\rightarrow$ Xác nhận xem điểm sao hiển thị cạnh tên gara `AutoCare Central Garage Q5` đã được tính toán cập nhật chính xác hay chưa.

---

### Kịch bản 3: Tải xuống báo cáo chi tiêu và hóa đơn thanh toán ngoại tuyến
1. **Xuất báo cáo chi tiêu:**
   * Quay lại màn hình chính của User, click chọn tab **"Phân tích chi tiêu"**.
   * Bấm nút **"📥 Xuất báo cáo (CSV)"** trên thẻ tổng chi phí bảo dưỡng.
   * **Kết quả mong đợi:** Trình duyệt lập tức tự động tải về file `personal_expenses.csv`. Mở file này bằng Excel (hoặc Notepad) $\rightarrow$ Dữ liệu hiển thị đúng danh sách xe, ngày làm, số km và nội dung chi phí bằng tiếng Việt không lỗi font.
2. **Xuất hóa đơn bảo dưỡng:**
   * Chọn xe bất kỳ $\rightarrow$ Vào tab **"Đặt lịch bảo dưỡng"** $\rightarrow$ Tìm lịch hẹn có trạng thái **Hoàn thành**.
   * Bấm nút **"📥 Xuất hóa đơn (CSV)"**.
   * **Kết quả mong đợi:** File `invoice_appointment_<id>.csv` được tải về máy. Mở file lên kiểm tra cấu trúc biên nhận thanh toán, tiền tệ và các hạng mục linh kiện thay thế hiển thị chính xác.
