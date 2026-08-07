const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ACOH_DB',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function runMigration() {
  console.log('Connecting to SQL Server...');
  try {
    const pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully.');

    console.log('Step 1: Creating Payments table if not exists...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Payments')
      BEGIN
          CREATE TABLE Payments (
              PaymentID INT IDENTITY(1,1) PRIMARY KEY,
              AppointmentID INT NULL FOREIGN KEY REFERENCES Appointments(AppointmentID) ON DELETE SET NULL,
              UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
              Amount DECIMAL(18,2) NOT NULL,
              PaymentMethod NVARCHAR(50) NOT NULL DEFAULT N'VNPAY',
              TxnRef NVARCHAR(100) NOT NULL UNIQUE,
              TransactionNo NVARCHAR(100) NULL,
              OrderInfo NVARCHAR(255) NULL,
              Status NVARCHAR(50) NOT NULL DEFAULT N'Pending',
              CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
              PaidAt DATETIME NULL
          );
          PRINT 'Created table Payments successfully.';
      END
      ELSE
      BEGIN
          PRINT 'Table Payments already exists.';
      END
    `);

    console.log('Step 2: Checking and updating constraint on Appointments Status if needed...');
    // Đảm bảo cột Status của Appointments hỗ trợ trạng thái 'Đã cọc' và 'Đã thanh toán'
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Appointments_Status')
      BEGIN
          ALTER TABLE Appointments DROP CONSTRAINT CHK_Appointments_Status;
          PRINT 'Dropped constraint CHK_Appointments_Status';
      END
    `);

    console.log('Migration Module 5 completed successfully!');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed with error:', err.message);
    process.exit(1);
  }
}

runMigration();
