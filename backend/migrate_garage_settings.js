const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres.cgkfqswuammksstxtzda',
  password: process.env.DB_PASSWORD || '?SaPWDZY7pYj$5!',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Migrating garage settings columns...');
    await pool.query(`
      ALTER TABLE garages
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS opening_hours VARCHAR(100) DEFAULT '07:30 - 18:00',
        ADD COLUMN IF NOT EXISTS open_days VARCHAR(100) DEFAULT 'Thứ 2 - Thứ 7 (Nghỉ CN)',
        ADD COLUMN IF NOT EXISTS service_capacity INTEGER DEFAULT 6,
        ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 45,
        ADD COLUMN IF NOT EXISTS max_parallel_slots INTEGER DEFAULT 4,
        ADD COLUMN IF NOT EXISTS tax_code VARCHAR(50) DEFAULT '0109887766',
        ADD COLUMN IF NOT EXISTS rescue_hotline VARCHAR(50) DEFAULT '1900 6868',
        ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) DEFAULT 'Vietcombank',
        ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50) DEFAULT '998877665544',
        ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(100) DEFAULT 'CTY TNHH DICH VU AUTOCARE',
        ADD COLUMN IF NOT EXISTS services_offered TEXT DEFAULT 'Bảo dưỡng định kỳ, Sửa chữa gầm máy, Chẩn đoán điện tử, Đồng sơn cao cấp, Phụ tùng chính hãng, Cứu hộ 24/7',
        ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 10,
        ADD COLUMN IF NOT EXISTS warranty_terms TEXT DEFAULT 'Bảo hành phụ tùng 12 tháng hoặc 20.000km tùy điều kiện nào đến trước. Miễn phí công kiểm tra lại trong vòng 7 ngày.',
        ADD COLUMN IF NOT EXISTS invoice_footer_note TEXT DEFAULT 'AutoCare trân trọng cảm ơn Quý khách. Kính chúc Quý khách vạn dặm bình an!',
        ADD COLUMN IF NOT EXISTS receive_zalo_notif BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS receive_sms_notif BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS receive_email_report BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS sound_alert_enabled BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS banner_url TEXT;
    `);
    console.log('✅ Successfully added garage settings columns!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}
main();
