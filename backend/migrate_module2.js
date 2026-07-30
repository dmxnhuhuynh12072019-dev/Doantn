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

    console.log('Migrating Vehicles table schema...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicles]') AND name = N'IsCommercial')
      BEGIN
          ALTER TABLE Vehicles ADD IsCommercial BIT NOT NULL DEFAULT 0;
          PRINT 'Added column IsCommercial';
      END

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicles]') AND name = N'HTXCode')
      BEGIN
          ALTER TABLE Vehicles ADD HTXCode NVARCHAR(100) NULL;
          PRINT 'Added column HTXCode';
      END

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vehicles]') AND name = N'BadgeNumber')
      BEGIN
          ALTER TABLE Vehicles ADD BadgeNumber NVARCHAR(100) NULL;
          PRINT 'Added column BadgeNumber';
      END
    `);

    console.log('Migrating LegalDocuments table constraint...');
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_LegalDocuments_Type')
      BEGIN
          ALTER TABLE LegalDocuments DROP CONSTRAINT CHK_LegalDocuments_Type;
      END

      ALTER TABLE LegalDocuments ADD CONSTRAINT CHK_LegalDocuments_Type CHECK (DocumentType IN (N'Đăng kiểm', N'Bảo hiểm dân sự', N'Bảo hiểm vật chất', N'Giấy phép lái xe'));
    `);

    console.log('Migration completed successfully!');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed with error:', err.message);
    process.exit(1);
  }
}

runMigration();
