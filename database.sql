
-- KHỞI TẠO DATABASE
CREATE DATABASE ACOH_DB;
GO
USE ACOH_DB;
GO

-- 1. Bảng Người dùng (Users)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15) NULL,
    ZaloPhoneNumber VARCHAR(15) NULL,
    ReceiveZaloNotif BIT NOT NULL DEFAULT 1,
    ReceiveSmsNotif BIT NOT NULL DEFAULT 1,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'User', 
    Status NVARCHAR(20) NOT NULL DEFAULT N'Hoạt động',
    ThemePreference VARCHAR(20) NOT NULL DEFAULT 'light',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_Users PRIMARY KEY (UserID),
    CONSTRAINT UC_Users_Email UNIQUE (Email),
    CONSTRAINT CHK_Users_Role CHECK (Role IN ('User', 'Garage', 'Admin')),
    CONSTRAINT CHK_Users_Status CHECK (Status IN (N'Hoạt động', N'Bị khóa')),
    CONSTRAINT CHK_Users_Theme CHECK (ThemePreference IN ('light', 'dark', 'system'))
);

-- 2. Bảng Phương tiện (Vehicles)
CREATE TABLE Vehicles (
    VehicleID INT IDENTITY(1,1),
    UserID INT NOT NULL,
    LicensePlate VARCHAR(20) NOT NULL,
    VehicleType NVARCHAR(20) NOT NULL, 
    Brand NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NOT NULL,
    ManufactureYear INT NULL,
    PurchaseDate DATE NULL,
    CurrentOdometer INT NOT NULL DEFAULT 0,
    IsCommercial BIT NOT NULL DEFAULT 0,
    HTXCode NVARCHAR(100) NULL,
    BadgeNumber NVARCHAR(100) NULL,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_Vehicles PRIMARY KEY (VehicleID),
    CONSTRAINT UC_Vehicles_LicensePlate UNIQUE (LicensePlate),
    CONSTRAINT FK_Vehicles_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT CHK_Vehicles_Type CHECK (VehicleType IN (N'Ô tô', N'Xe máy')),
    CONSTRAINT CHK_Vehicles_Odometer CHECK (CurrentOdometer >= 0)
);

-- 3. Bảng Giấy tờ pháp lý & Bảo hiểm (LegalDocuments)
CREATE TABLE LegalDocuments (
    DocumentID INT IDENTITY(1,1),
    VehicleID INT NOT NULL,
    DocumentType NVARCHAR(50) NOT NULL, 
    IssueDate DATE NULL,
    ExpiryDate DATE NOT NULL,
    AlertThresholdDays INT NOT NULL DEFAULT 30,
    Status NVARCHAR(20) NOT NULL DEFAULT N'Còn hạn',
    
    CONSTRAINT PK_LegalDocuments PRIMARY KEY (DocumentID),
    CONSTRAINT FK_LegalDocuments_Vehicles FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE,
    CONSTRAINT CHK_LegalDocuments_Type CHECK (DocumentType IN (N'Đăng kiểm', N'Bảo hiểm dân sự', N'Bảo hiểm vật chất', N'Giấy phép lái xe')),
    CONSTRAINT CHK_LegalDocuments_Status CHECK (Status IN (N'Còn hạn', N'Sắp hết hạn', N'Quá hạn'))
);

-- 4. Bảng Kế hoạch bảo dưỡng định kỳ - Nhắc lịch (MaintenanceSchedules)
CREATE TABLE MaintenanceSchedules (
    ScheduleID INT IDENTITY(1,1),
    VehicleID INT NOT NULL,
    CategoryName NVARCHAR(100) NOT NULL, 
    TargetOdometer INT NULL,         
    TargetDate DATE NULL,            
    AlertThresholdKM INT NOT NULL DEFAULT 500,
    Status NVARCHAR(20) NOT NULL DEFAULT N'Chưa thực hiện', 
    Notes NVARCHAR(MAX) NULL,
    
    CONSTRAINT PK_MaintenanceSchedules PRIMARY KEY (ScheduleID),
    CONSTRAINT FK_MaintenanceSchedules_Vehicles FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID) ON DELETE CASCADE,
    CONSTRAINT CHK_MaintenanceSchedules_Status CHECK (Status IN (N'Chưa thực hiện', N'Đã hoàn thành', N'Quá hạn'))
);

-- 5. Bảng Garage đối tác liên kết (Garages)
CREATE TABLE Garages (
    GarageID INT IDENTITY(1,1),
    UserID INT NULL, -- Kết nối với bảng Users để xác định tài khoản quản lý của chủ gara
    GarageName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Email VARCHAR(100) NULL,
    Rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    IsActive BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT PK_Garages PRIMARY KEY (GarageID),
    CONSTRAINT FK_Garages_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT CHK_Garages_Rating CHECK (Rating >= 0.00 AND Rating <= 5.00)
);

-- 6. Bảng Đơn đặt lịch bảo dưỡng (Appointments)
CREATE TABLE Appointments (
    AppointmentID INT IDENTITY(1,1),
    UserID INT NOT NULL,
    GarageID INT NOT NULL,
    VehicleID INT NOT NULL,
    AppointmentDate DATETIME NOT NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT N'Chờ xác nhận', 
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_Appointments PRIMARY KEY (AppointmentID),
    CONSTRAINT FK_Appointments_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Appointments_Garages FOREIGN KEY (GarageID) REFERENCES Garages(GarageID),
    CONSTRAINT FK_Appointments_Vehicles FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    CONSTRAINT CHK_Appointments_Status CHECK (Status IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đang sửa chữa', N'Hoàn thành', N'Hủy lịch'))
);

-- 7. Bảng Nhật ký lịch sử sửa chữa & Chi phí (MaintenanceHistory)
CREATE TABLE MaintenanceHistory (
    HistoryID INT IDENTITY(1,1),
    VehicleID INT NOT NULL,       -- Liên kết chặt chẽ để định danh chính xác xe được bảo dưỡng
    GarageID INT NULL,            -- Lưu vết Gara nào thực hiện sửa chữa để Gara tra cứu danh sách xe đã làm
    AppointmentID INT NULL, 
    ExecutionDate DATE NOT NULL DEFAULT GETDATE(),
    ExecutionOdometer INT NOT NULL,
    TotalCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Details NVARCHAR(MAX) NOT NULL, 
    
    CONSTRAINT PK_MaintenanceHistory PRIMARY KEY (HistoryID),
    CONSTRAINT FK_MaintenanceHistory_Vehicles FOREIGN KEY (VehicleID) REFERENCES Vehicles(VehicleID),
    CONSTRAINT FK_MaintenanceHistory_Garages FOREIGN KEY (GarageID) REFERENCES Garages(GarageID),
    CONSTRAINT FK_MaintenanceHistory_Appointments FOREIGN KEY (AppointmentID) REFERENCES Appointments(AppointmentID),
    CONSTRAINT CHK_MaintenanceHistory_Cost CHECK (TotalCost >= 0.00)
);

-- 8. Bảng Hệ thống thông báo đẩy (Notifications)
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1),
    UserID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType VARCHAR(20) NOT NULL, 
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_Notifications PRIMARY KEY (NotificationID),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT CHK_Notifications_Type CHECK (NotificationType IN ('Email', 'InApp', 'ZaloZNS', 'SMS', 'All'))
);

-- 9. Bảng Khung/Bộ mốc bảo dưỡng (MaintenanceCategories)
CREATE TABLE MaintenanceCategories (
    CategoryID INT IDENTITY(1,1),
    CategoryName NVARCHAR(150) NOT NULL,
    TargetOdometer INT NOT NULL,
    VehicleType NVARCHAR(20) NOT NULL DEFAULT N'Ô tô',
    Description NVARCHAR(MAX) NULL,
    
    CONSTRAINT PK_MaintenanceCategories PRIMARY KEY (CategoryID),
    CONSTRAINT CHK_MaintenanceCategories_Type CHECK (VehicleType IN (N'Ô tô', N'Xe máy'))
);

-- 10. Bảng Chi tiết hạng mục kiểm tra/thay thế (MaintenanceItems)
CREATE TABLE MaintenanceItems (
    ItemID INT IDENTITY(1,1),
    CategoryID INT NOT NULL,
    ItemName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    IsRequired BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT PK_MaintenanceItems PRIMARY KEY (ItemID),
    CONSTRAINT FK_MaintenanceItems_Categories FOREIGN KEY (CategoryID) REFERENCES MaintenanceCategories(CategoryID) ON DELETE CASCADE
);
GO

-- TẠO CHỈ MỤC TỐI ƯU (INDEXES)
CREATE NONCLUSTERED INDEX IX_Vehicles_UserID ON Vehicles(UserID);
CREATE NONCLUSTERED INDEX IX_MaintenanceHistory_GarageID ON MaintenanceHistory(GarageID);
CREATE NONCLUSTERED INDEX IX_Appointments_Status_Date ON Appointments(Status, AppointmentDate);
CREATE NONCLUSTERED INDEX IX_MaintenanceCategories_Odometer ON MaintenanceCategories(TargetOdometer, VehicleType);
GO