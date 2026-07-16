# AutoCare Office Helper (ACOH)

## Yêu cầu
- Node.js v18+
- SQL Server 2014+

## Cách chạy

### 1. Khởi tạo Database
Mở SSMS, chạy lần lượt:
- `database.sql` — tạo bảng
- `seed.sql` — nạp dữ liệu mẫu

### 2. Cấu hình Backend
Mở `backend/.env`, điền mật khẩu SQL Server thật:
```env
DB_PASSWORD=MậtKhẩuCủaBạn
```

### 3. Chạy Backend
```powershell
cd backend
npm install
npm run start:dev
```
✅ Thành công khi thấy: `Application is running on: http://localhost:3000`

### 4. Chạy Frontend
```powershell
cd frontend
npm install
npm run dev
```
✅ Thành công khi thấy: `Local: http://localhost:5173/`

### Tài khoản mẫu
| Email | Mật khẩu | Vai trò |
|---|---|---|
| admin@acoh.com | admin123 | Admin |
| garage@acoh.com | garage123 | Garage |
| user@acoh.com | user123 | User |
