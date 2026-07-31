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

    console.log('Step 1: Adding ThemePreference column if not exists...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'ThemePreference')
      BEGIN
          ALTER TABLE Users ADD ThemePreference VARCHAR(20) NOT NULL DEFAULT 'light';
          PRINT 'Added column ThemePreference';
      END
    `);

    console.log('Step 2: Dropping existing CHK_Users_Theme check constraint if exists...');
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Users_Theme')
      BEGIN
          ALTER TABLE Users DROP CONSTRAINT CHK_Users_Theme;
          PRINT 'Dropped constraint CHK_Users_Theme';
      END
    `);

    console.log('Step 3: Adding CHK_Users_Theme check constraint...');
    await pool.request().query(`
      ALTER TABLE Users ADD CONSTRAINT CHK_Users_Theme CHECK (ThemePreference IN ('light', 'dark', 'system'));
      PRINT 'Added constraint CHK_Users_Theme';
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
