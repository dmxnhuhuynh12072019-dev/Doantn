-- ==============================================================================
-- ACOH (AutoCare Office Helper) - Supabase PostgreSQL Seed Data
-- ==============================================================================

-- 1. SEED USERS (Password: 123456 -> BCrypt Hash: $2b$10$wT8hM76ZkLCEG1.5xW9v0.oU.lW46Xj46rN6xW6Yt9uHqg8vL5dKq or standard bcrypt)
INSERT INTO "Users" ("UserID", "FullName", "Email", "PhoneNumber", "PasswordHash", "Role", "Status", "ReceiveZaloNotif", "ReceiveSmsNotif")
VALUES
(1, 'Nguyễn Văn Admin', 'admin@acoh.com', '0901234567', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Active', TRUE, TRUE),
(2, 'Trần Thị Garage', 'garage@acoh.com', '0912345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Garage', 'Active', TRUE, TRUE),
(3, 'Lê Văn User', 'user@acoh.com', '0923456789', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User', 'Active', TRUE, TRUE)
ON CONFLICT ("Email") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Users"', 'UserID'), COALESCE(MAX("UserID"), 1)) FROM "Users";

-- 2. SEED GARAGES
INSERT INTO "Garages" ("GarageID", "UserID", "GarageName", "Address", "Phone", "Email", "Rating", "IsActive")
VALUES
(1, 2, 'AUTO HUẤN ĐẶNG SERVICE', 'Tứ Dân – Khoái Châu – Hưng Yên', '0945561535', 'dnghuan@gmail.com', 5.00, TRUE),
(2, NULL, 'Gara Ô Tô AutoCare Hà Nội', '128 Phạm Văn Đồng, Cầu Giấy, Hà Nội', '0988123456', 'hanoi@autocare.vn', 4.90, TRUE),
(3, NULL, 'Gara Chuyên Sửa Chữa Sài Gòn', '45 Ung Văn Khiêm, Bình Thạnh, TP.HCM', '0909988776', 'saigon@autocare.vn', 4.85, TRUE)
ON CONFLICT ("GarageID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Garages"', 'GarageID'), COALESCE(MAX("GarageID"), 1)) FROM "Garages";

-- 3. SEED VEHICLES
INSERT INTO "Vehicles" ("VehicleID", "UserID", "LicensePlate", "VehicleType", "Brand", "Model", "ManufactureYear", "PurchaseDate", "CurrentOdometer", "IsCommercial")
VALUES
(1, 3, '51K-123.45', 'Ô tô', 'Toyota', 'Camry 2.5Q', 2021, '2021-08-20', 42100, FALSE),
(2, 3, '30H-889.99', 'Ô tô', 'Mazda', 'CX-5 Luxury', 2023, '2023-05-10', 23450, FALSE),
(3, 1, '49A-078.95', 'Ô tô', 'Honda', 'CR-V Turbo', 2022, '2022-11-15', 45680, FALSE)
ON CONFLICT ("VehicleID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Vehicles"', 'VehicleID'), COALESCE(MAX("VehicleID"), 1)) FROM "Vehicles";

-- 4. SEED MAINTENANCE CATEGORIES (Mốc km chuẩn hóa)
INSERT INTO "MaintenanceCategories" ("CategoryID", "CategoryName", "VehicleType", "IntervalKm", "IntervalMonths", "Description")
VALUES
(1, 'Bảo dưỡng cấp 1 (Cấp nhỏ - 5.000 km)', 'Ô tô', 5000, 6, 'Thay dầu động cơ, kiểm tra nước rửa kính, nước làm mát, vệ sinh lọc gió.'),
(2, 'Bảo dưỡng cấp 2 (Cấp trung bình - 10.000 km)', 'Ô tô', 10000, 12, 'Thay dầu máy, thay cốc lọc dầu, đảo lốp 4 bánh, kiểm tra phanh.'),
(3, 'Bảo dưỡng cấp 3 (Cấp trung bình lớn - 20.000 km)', 'Ô tô', 20000, 24, 'Thay dầu máy, lọc dầu, lọc gió động cơ, lọc gió điều hòa, bảo dưỡng phanh.'),
(4, 'Bảo dưỡng cấp 4 (Cấp lớn - 40.000 km / 80.000 km)', 'Ô tô', 40000, 48, 'Đại tu toàn bộ chất lỏng (dầu phanh, hộp số, trợ lực), bugi Iridium, dây curoa.')
ON CONFLICT ("CategoryID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"MaintenanceCategories"', 'CategoryID'), COALESCE(MAX("CategoryID"), 1)) FROM "MaintenanceCategories";

-- 5. SEED MAINTENANCE ITEMS
INSERT INTO "MaintenanceItems" ("ItemID", "CategoryID", "ItemName", "ItemDescription", "IsRequired", "EstimatedCost")
VALUES
(1, 1, 'Thay dầu động cơ (4L)', 'Dầu Castrol Magnatec / Motul 5W-30', TRUE, 450000),
(2, 1, 'Kiểm tra nước làm mát & nước rửa kính', 'Châm thêm nước chuyên dụng', TRUE, 50000),
(3, 1, 'Vệ sinh lọc gió động cơ & máy lạnh', 'Xịt bụi áp lực cao', FALSE, 50000),
(4, 2, 'Thay dầu động cơ cao cấp', 'Dầu tổng hợp toàn phần Fully Synthetic', TRUE, 650000),
(5, 2, 'Thay cốc lọc dầu chính hãng', 'Lọc nhớt tiêu chuẩn hãng', TRUE, 150000),
(6, 2, 'Đảo lốp 4 bánh & cân mâm', 'Đảo lốp theo sơ đồ chéo', TRUE, 150000),
(7, 3, 'Thay lọc gió động cơ mới', 'Lọc không khí buồng đốt', TRUE, 250000),
(8, 3, 'Thay lọc gió điều hòa khoang lái', 'Lọc than hoạt tính khử mùi', TRUE, 200000),
(9, 3, 'Bảo dưỡng tra mỡ phanh 4 bánh', 'Vệ sinh má phanh & đĩa phanh', TRUE, 350000),
(10, 4, 'Thay toàn bộ dầu phanh DOT4', 'Xả e và thay dầu phanh mới', TRUE, 350000),
(11, 4, 'Thay dầu hộp số tự động', 'Dầu hộp số ATF / CVT chuyên dụng', TRUE, 1200000),
(12, 4, 'Thay 4 bugi Iridium chân kim', 'Bugi đánh lửa hiệu suất cao', TRUE, 800000),
(13, 4, 'Thay nước làm mát động cơ', 'Nước làm mát tản nhiệt động cơ', TRUE, 300000)
ON CONFLICT ("ItemID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"MaintenanceItems"', 'ItemID'), COALESCE(MAX("ItemID"), 1)) FROM "MaintenanceItems";

-- 6. SEED MAINTENANCE HISTORY
INSERT INTO "MaintenanceHistory" ("HistoryID", "VehicleID", "GarageID", "ExecutionDate", "ExecutionOdometer", "TotalCost", "Details")
VALUES
(1, 1, 1, CURRENT_DATE - INTERVAL '120 days', 35000, 850000, 'Thay nhớt động cơ Castrol 5W-30, Vệ sinh lọc gió máy lạnh'),
(2, 2, 1, CURRENT_DATE - INTERVAL '45 days', 19000, 1200000, 'Thay dầu Castrol Magnatec 5W-30, Thay lọc nhớt động cơ, Kiểm tra phanh 4 bánh')
ON CONFLICT ("HistoryID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"MaintenanceHistory"', 'HistoryID'), COALESCE(MAX("HistoryID"), 1)) FROM "MaintenanceHistory";

-- 7. SEED APPOINTMENTS
INSERT INTO "Appointments" ("AppointmentID", "UserID", "GarageID", "VehicleID", "AppointmentDate", "Status", "DepositAmount", "PaymentStatus", "Notes")
VALUES
(1, 3, 1, 1, NOW() + INTERVAL '3 days', 'Đã xác nhận', 100000, 'Đã cọc', 'Bảo dưỡng định kỳ mốc 40.000 km và kiểm tra tiếng kêu gầm')
ON CONFLICT ("AppointmentID") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"Appointments"', 'AppointmentID'), COALESCE(MAX("AppointmentID"), 1)) FROM "Appointments";
