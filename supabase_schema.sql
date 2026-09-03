-- ==============================================================================
-- ACOH (AutoCare Office Helper) - Supabase PostgreSQL Database Schema
-- Compatible with PostgreSQL 15+ & Supabase Cloud
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: Users (Tài khoản người dùng & Phân quyền)
CREATE TABLE IF NOT EXISTS "Users" (
    "UserID" SERIAL PRIMARY KEY,
    "FullName" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(150) UNIQUE NOT NULL,
    "PhoneNumber" VARCHAR(20) NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'User' CHECK ("Role" IN ('Admin', 'Garage', 'User')),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK ("Status" IN ('Active', 'Locked', 'Pending')),
    "ReceiveZaloNotif" BOOLEAN NOT NULL DEFAULT TRUE,
    "ReceiveSmsNotif" BOOLEAN NOT NULL DEFAULT TRUE,
    "ZaloPhoneNumber" VARCHAR(20) NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: Garages (Gara dịch vụ đối tác)
CREATE TABLE IF NOT EXISTS "Garages" (
    "GarageID" SERIAL PRIMARY KEY,
    "UserID" INT NULL REFERENCES "Users"("UserID") ON DELETE SET NULL,
    "GarageName" VARCHAR(255) NOT NULL,
    "Address" TEXT NOT NULL,
    "Phone" VARCHAR(30) NOT NULL,
    "Email" VARCHAR(150) NULL,
    "Rating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLE: Vehicles (Danh sách Phương tiện)
CREATE TABLE IF NOT EXISTS "Vehicles" (
    "VehicleID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "LicensePlate" VARCHAR(20) NOT NULL,
    "VehicleType" VARCHAR(50) NOT NULL DEFAULT 'Ô tô',
    "Brand" VARCHAR(100) NOT NULL,
    "Model" VARCHAR(100) NOT NULL,
    "ManufactureYear" INT NULL,
    "PurchaseDate" DATE NULL,
    "CurrentOdometer" INT NOT NULL DEFAULT 0,
    "IsCommercial" BOOLEAN NOT NULL DEFAULT FALSE,
    "HTXCode" VARCHAR(50) NULL,
    "BadgeNumber" VARCHAR(50) NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: Appointments (Lịch hẹn sửa chữa)
CREATE TABLE IF NOT EXISTS "Appointments" (
    "AppointmentID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "GarageID" INT NOT NULL REFERENCES "Garages"("GarageID") ON DELETE CASCADE,
    "VehicleID" INT NOT NULL REFERENCES "Vehicles"("VehicleID") ON DELETE CASCADE,
    "AppointmentDate" TIMESTAMPTZ NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Chờ xác nhận' 
        CHECK ("Status" IN ('Chờ xác nhận', 'Đã xác nhận', 'Đã cọc', 'Đang sửa chữa', 'Hoàn thành', 'Hủy lịch')),
    "DepositAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "PaymentStatus" VARCHAR(30) NOT NULL DEFAULT 'Chưa thanh toán'
        CHECK ("PaymentStatus" IN ('Chưa thanh toán', 'Đã cọc', 'Đã thanh toán', 'Hoàn tiền')),
    "Notes" TEXT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLE: MaintenanceCategories (Mốc Bảo Dưỡng Chuẩn)
CREATE TABLE IF NOT EXISTS "MaintenanceCategories" (
    "CategoryID" SERIAL PRIMARY KEY,
    "CategoryName" VARCHAR(150) NOT NULL,
    "VehicleType" VARCHAR(50) NOT NULL DEFAULT 'Ô tô',
    "IntervalKm" INT NOT NULL,
    "IntervalMonths" INT NULL,
    "Description" TEXT NULL
);

-- 7. TABLE: MaintenanceItems (Chi tiết Hạng mục Bảo Dưỡng)
CREATE TABLE IF NOT EXISTS "MaintenanceItems" (
    "ItemID" SERIAL PRIMARY KEY,
    "CategoryID" INT NOT NULL REFERENCES "MaintenanceCategories"("CategoryID") ON DELETE CASCADE,
    "ItemName" VARCHAR(200) NOT NULL,
    "ItemDescription" TEXT NULL,
    "IsRequired" BOOLEAN NOT NULL DEFAULT TRUE,
    "EstimatedCost" DECIMAL(15,2) NOT NULL DEFAULT 0
);

-- 8. TABLE: MaintenanceHistory (Nhật ký sửa chữa & Hóa đơn)
CREATE TABLE IF NOT EXISTS "MaintenanceHistory" (
    "HistoryID" SERIAL PRIMARY KEY,
    "AppointmentID" INT NULL REFERENCES "Appointments"("AppointmentID") ON DELETE SET NULL,
    "VehicleID" INT NOT NULL REFERENCES "Vehicles"("VehicleID") ON DELETE CASCADE,
    "GarageID" INT NULL REFERENCES "Garages"("GarageID") ON DELETE SET NULL,
    "ExecutionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "ExecutionOdometer" INT NOT NULL,
    "TotalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Details" TEXT NOT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABLE: MaintenanceSchedules (Lịch nhắc bảo dưỡng định kỳ)
CREATE TABLE IF NOT EXISTS "MaintenanceSchedules" (
    "ScheduleID" SERIAL PRIMARY KEY,
    "VehicleID" INT NOT NULL REFERENCES "Vehicles"("VehicleID") ON DELETE CASCADE,
    "CategoryName" VARCHAR(150) NOT NULL,
    "TargetOdometer" INT NULL,
    "TargetDate" DATE NULL,
    "AlertThresholdKM" INT NOT NULL DEFAULT 500,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Chưa thực hiện'
        CHECK ("Status" IN ('Chưa thực hiện', 'Đang thực hiện', 'Đã hoàn thành', 'Quá hạn')),
    "Notes" TEXT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TABLE: LegalDocuments (Giấy tờ xe & Đăng kiểm / Bảo hiểm)
CREATE TABLE IF NOT EXISTS "LegalDocuments" (
    "DocumentID" SERIAL PRIMARY KEY,
    "VehicleID" INT NOT NULL REFERENCES "Vehicles"("VehicleID") ON DELETE CASCADE,
    "DocumentType" VARCHAR(50) NOT NULL 
        CHECK ("DocumentType" IN ('Đăng kiểm', 'Bảo hiểm TNDS', 'Bảo hiểm thân vỏ', 'Phù hiệu HTX', 'Giấy phép lái xe')),
    "DocumentNumber" VARCHAR(100) NULL,
    "IssueDate" DATE NULL,
    "ExpiryDate" DATE NOT NULL,
    "FileUrl" TEXT NULL,
    "ReminderDays" INT NOT NULL DEFAULT 30,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABLE: Reviews (Đánh giá chất lượng Gara)
CREATE TABLE IF NOT EXISTS "Reviews" (
    "ReviewID" SERIAL PRIMARY KEY,
    "GarageID" INT NOT NULL REFERENCES "Garages"("GarageID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "Rating" INT NOT NULL CHECK ("Rating" BETWEEN 1 AND 5),
    "Comment" TEXT NULL,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TABLE: Notifications (Thông báo người dùng)
CREATE TABLE IF NOT EXISTS "Notifications" (
    "NotificationID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Message" TEXT NOT NULL,
    "NotificationType" VARCHAR(30) NOT NULL DEFAULT 'InApp'
        CHECK ("NotificationType" IN ('Email', 'InApp', 'ZaloZNS', 'SMS', 'All')),
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TABLE: NotificationLogs (Nhật ký gửi Zalo/SMS)
CREATE TABLE IF NOT EXISTS "NotificationLogs" (
    "LogID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "Channel" VARCHAR(20) NOT NULL,
    "Recipient" VARCHAR(100) NOT NULL,
    "Title" VARCHAR(200) NULL,
    "Message" TEXT NOT NULL,
    "Status" VARCHAR(30) NOT NULL,
    "ErrorMessage" TEXT NULL,
    "SentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TABLE: Payments (Giao dịch đặt cọc & thanh toán)
CREATE TABLE IF NOT EXISTS "Payments" (
    "PaymentID" SERIAL PRIMARY KEY,
    "AppointmentID" INT NOT NULL REFERENCES "Appointments"("AppointmentID") ON DELETE CASCADE,
    "UserID" INT NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
    "Amount" DECIMAL(15,2) NOT NULL,
    "PaymentMethod" VARCHAR(50) NOT NULL DEFAULT 'VNPay' CHECK ("PaymentMethod" IN ('VNPay', 'VietQR', 'Cash')),
    "TransactionCode" VARCHAR(100) NULL,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Thành công' CHECK ("Status" IN ('Thành công', 'Thất bại', 'Đang xử lý')),
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. INDEXES (Tối ưu hóa hiệu năng truy vấn)
CREATE INDEX IF NOT EXISTS "IDX_Vehicles_UserID" ON "Vehicles"("UserID");
CREATE INDEX IF NOT EXISTS "IDX_Vehicles_LicensePlate" ON "Vehicles"("LicensePlate");
CREATE INDEX IF NOT EXISTS "IDX_Appointments_UserID" ON "Appointments"("UserID");
CREATE INDEX IF NOT EXISTS "IDX_Appointments_GarageID" ON "Appointments"("GarageID");
CREATE INDEX IF NOT EXISTS "IDX_Appointments_VehicleID" ON "Appointments"("VehicleID");
CREATE INDEX IF NOT EXISTS "IDX_MaintenanceHistory_VehicleID" ON "MaintenanceHistory"("VehicleID");
CREATE INDEX IF NOT EXISTS "IDX_MaintenanceSchedules_VehicleID" ON "MaintenanceSchedules"("VehicleID");
CREATE INDEX IF NOT EXISTS "IDX_Notifications_UserID" ON "Notifications"("UserID");
