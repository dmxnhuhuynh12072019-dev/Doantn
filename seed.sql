-- SEED DATA FOR ACOH DATABASE (SQL SERVER 2014)
-- Đảm bảo đã chạy file database.sql để khởi tạo cấu trúc bảng trước khi chạy file seed này.

USE ACOH_DB;
GO

-- Xóa dữ liệu cũ nếu có (theo thứ tự phụ thuộc khóa ngoại ngược)
DELETE FROM Notifications;
DELETE FROM MaintenanceHistory;
DELETE FROM Appointments;
DELETE FROM Garages;
DELETE FROM MaintenanceSchedules;
DELETE FROM LegalDocuments;
DELETE FROM Vehicles;
DELETE FROM Users;
GO

-- Reset IDENTITY values
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('Vehicles', RESEED, 0);
DBCC CHECKIDENT ('LegalDocuments', RESEED, 0);
DBCC CHECKIDENT ('MaintenanceSchedules', RESEED, 0);
DBCC CHECKIDENT ('Garages', RESEED, 0);
DBCC CHECKIDENT ('Appointments', RESEED, 0);
DBCC CHECKIDENT ('MaintenanceHistory', RESEED, 0);
DBCC CHECKIDENT ('Notifications', RESEED, 0);
GO

-- 1. Thêm Người dùng (Users)
-- Mật khẩu tương ứng (đã băm bằng bcrypt):
-- admin123  -> $2b$10$9PtIahocBCw/1axmuwS2hOYUAJ0h7eIqtzvRaF.oO516f8DSTAefG
-- garage123 -> $2b$10$.Nt6MXwxG2Qh52IDWLI.HObbb4WVZWSGaWCrl28h3P4XjegFbpH6.
-- user123   -> $2b$10$wItV.oHvW7Gr8M2iMf.rPuhEeleGM8nrzBOxGCJUVFkL7UJwyZbAS

INSERT INTO Users (FullName, Email, PhoneNumber, PasswordHash, Role, Status, CreatedAt)
VALUES 
(N'Nguyễn Văn Admin', 'admin@acoh.com', '0901112222', '$2b$10$9PtIahocBCw/1axmuwS2hOYUAJ0h7eIqtzvRaF.oO516f8DSTAefG', 'Admin', N'Hoạt động', GETDATE()),
(N'Trần Thị Garage', 'garage@acoh.com', '0903334444', '$2b$10$.Nt6MXwxG2Qh52IDWLI.HObbb4WVZWSGaWCrl28h3P4XjegFbpH6.', 'Garage', N'Hoạt động', GETDATE()),
(N'Lê Văn User', 'user@acoh.com', '0905556666', '$2b$10$wItV.oHvW7Gr8M2iMf.rPuhEeleGM8nrzBOxGCJUVFkL7UJwyZbAS', 'User', N'Hoạt động', GETDATE());
GO

-- 2. Thêm Garage đối tác (Garages)
-- UserID = 2 (Trần Thị Garage) quản lý Gara này
INSERT INTO Garages (UserID, GarageName, Address, Phone, Email, Rating, IsActive)
VALUES 
(2, N'AutoCare Central Garage Q5', N'123 Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh', '02838383838', 'contact@autocareq5.com', 4.80, 1);
GO

-- 3. Thêm Phương tiện (Vehicles)
-- Tất cả xe thuộc sở hữu của UserID = 3 (Lê Văn User)
INSERT INTO Vehicles (UserID, LicensePlate, VehicleType, Brand, Model, ManufactureYear, PurchaseDate, CurrentOdometer, UpdatedAt)
VALUES 
(3, '59A-123.45', N'Ô tô', N'Toyota', N'Vios 1.5G', 2020, '2020-05-15', 35200, GETDATE()),
(3, '59B-678.90', N'Xe máy', N'Honda', N'SH Mode 125cc', 2021, '2021-08-20', 12350, GETDATE());
GO

-- 4. Thêm Giấy tờ pháp lý & Bảo hiểm (LegalDocuments)
-- Gắn với xe 59A-123.45 (VehicleID = 1) và xe 59B-678.90 (VehicleID = 2)
INSERT INTO LegalDocuments (VehicleID, DocumentType, IssueDate, ExpiryDate, AlertThresholdDays, Status)
VALUES 
-- Xe ô tô (ID 1)
(1, N'Đăng kiểm', '2025-06-01', '2026-12-31', 30, N'Còn hạn'),
(1, N'Bảo hiểm dân sự', '2025-09-15', '2026-09-15', 15, N'Còn hạn'),
-- Giả sử đã hết hạn để test hiển thị cảnh báo đỏ
(1, N'Bảo hiểm vật chất', '2024-05-10', '2025-05-10', 30, N'Quá hạn'),

-- Xe máy (ID 2)
(2, N'Bảo hiểm dân sự', '2025-08-20', '2026-08-20', 15, N'Còn hạn');
GO

-- 5. Thêm Kế hoạch bảo dưỡng định kỳ - Nhắc lịch (MaintenanceSchedules)
-- Lên lịch nhắc bảo dưỡng tiếp theo dựa trên số km
INSERT INTO MaintenanceSchedules (VehicleID, CategoryName, TargetOdometer, TargetDate, AlertThresholdKM, Status, Notes)
VALUES 
(1, N'Thay nhớt máy & lọc nhớt', 40000, '2026-09-15', 500, N'Chưa thực hiện', N'Thay nhớt định kỳ mốc 40k km. Khuyên dùng nhớt tổng hợp toàn phần.'),
(1, N'Đảo lốp xe & cân mâm', 38000, '2026-08-01', 500, N'Chưa thực hiện', N'Kiểm tra độ mòn lốp trước khi đảo.'),
(2, N'Thay nhớt xe máy', 14000, '2026-10-01', 200, N'Chưa thực hiện', N'Nhớt Castrol Power1.');
GO

-- 6. Thêm Đơn đặt lịch bảo dưỡng (Appointments)
-- Đặt lịch hẹn sửa xe tại GarageID = 1
INSERT INTO Appointments (UserID, GarageID, VehicleID, AppointmentDate, Status, Notes, CreatedAt)
VALUES 
(3, 1, 1, '2026-07-20 09:00:00', N'Chờ xác nhận', N'Tôi muốn kiểm tra thắng và thay nhớt định kỳ.', GETDATE());
GO

-- 7. Thêm Nhật ký lịch sử sửa chữa & Chi phí (MaintenanceHistory)
-- Lưu trữ lịch sử sửa xe trước đây
INSERT INTO MaintenanceHistory (VehicleID, GarageID, AppointmentID, ExecutionDate, ExecutionOdometer, TotalCost, Details)
VALUES 
(1, 1, NULL, '2026-01-10', 30000, 1500000.00, N'Thay nhớt máy Castrol Magnatec, Thay lọc nhớt động cơ, Vệ sinh lọc gió động cơ, Bảo dưỡng hệ thống phanh 4 bánh.');
GO

-- 8. Thêm Hệ thống thông báo đẩy (Notifications)
-- Thông báo mẫu gửi tới người dùng
INSERT INTO Notifications (UserID, Title, Message, NotificationType, IsRead, CreatedAt)
VALUES 
(3, N'Chào mừng bạn đến với ACOH', N'Hệ thống AutoCare Office Helper đã sẵn sàng hỗ trợ bạn quản lý phương tiện của mình.', 'InApp', 0, GETDATE()),
(3, N'Cảnh báo giấy tờ hết hạn', N'Bảo hiểm vật chất của xe 59A-123.45 đã hết hạn từ ngày 10/05/2025. Vui lòng gia hạn gấp!', 'All', 0, GETDATE() - 1);
GO

-- XÁC NHẬN DỮ LIỆU ĐÃ SEED
SELECT 'Users' AS TableName, COUNT(*) AS TotalRows FROM Users UNION ALL
SELECT 'Garages', COUNT(*) FROM Garages UNION ALL
SELECT 'Vehicles', COUNT(*) FROM Vehicles UNION ALL
SELECT 'LegalDocuments', COUNT(*) FROM LegalDocuments UNION ALL
SELECT 'MaintenanceSchedules', COUNT(*) FROM MaintenanceSchedules UNION ALL
SELECT 'Appointments', COUNT(*) FROM Appointments UNION ALL
SELECT 'MaintenanceHistory', COUNT(*) FROM MaintenanceHistory UNION ALL
SELECT 'Notifications', COUNT(*) FROM Notifications;
GO
