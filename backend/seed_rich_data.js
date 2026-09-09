const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres.cgkfqswuammksstxtzda',
  password: process.env.DB_PASSWORD || '?SaPWDZY7pYj$5!',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seedData() {
  const client = await pool.connect();
  console.log(' Connected to PostgreSQL Supabase database.');

  try {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // =========================================================================
    // 1. SEED USERS (15 Users: 10 Users, 4 Garages, 1 Admin)
    // =========================================================================
    console.log('📌 [1/7] Seeding Users...');
    const usersData = [
      { email: 'demo_user@autocare.vn', name: 'Nguyễn Văn An', phone: '0912345678', role: 'User' },
      { email: 'user.tran@autocare.vn', name: 'Trần Minh Tuấn', phone: '0988123456', role: 'User' },
      { email: 'user.le@autocare.vn', name: 'Lê Hoàng Nam', phone: '0977889900', role: 'User' },
      { email: 'user.pham@autocare.vn', name: 'Phạm Thị Thảo', phone: '0903456789', role: 'User' },
      { email: 'user.vu@autocare.vn', name: 'Vũ Quốc Huy', phone: '0918765432', role: 'User' },
      { email: 'user.do@autocare.vn', name: 'Đỗ Thành Long', phone: '0933221144', role: 'User' },
      { email: 'user.bui@autocare.vn', name: 'Bùi Gia Khiêm', phone: '0944556677', role: 'User' },
      { email: 'user.ngo@autocare.vn', name: 'Ngô Hải Yến', phone: '0966778899', role: 'User' },
      { email: 'user.hoang@autocare.vn', name: 'Hoàng Văn Sơn', phone: '0922334455', role: 'User' },
      { email: 'user.mai@autocare.vn', name: 'Mai Hương Giang', phone: '0911223344', role: 'User' },
      // Garages
      { email: 'garage@autocare.vn', name: 'AutoCare Central Garage', phone: '0313728397', role: 'Garage' },
      { email: 'garage.saigon@autocare.vn', name: 'Gara Ô Tô Sài Gòn Auto', phone: '0909112233', role: 'Garage' },
      { email: 'garage.hanoi@autocare.vn', name: 'Hà Nội Car Tuning & Care', phone: '0912998877', role: 'Garage' },
      { email: 'garage.phatdat@autocare.vn', name: 'Trung Tâm Sửa Chữa Phát Đạt', phone: '0938776655', role: 'Garage' },
      // Admin
      { email: 'admin@autocare.vn', name: 'Quản Trị Viên Hệ Thống', phone: '0999888999', role: 'Admin' },
    ];

    const userMap = {}; // email -> userId
    for (const u of usersData) {
      const res = await client.query(
        `INSERT INTO users (fullname, email, phonenumber, passwordhash, role, status)
         VALUES ($1, $2, $3, $4, $5, 'Active')
         ON CONFLICT (email) DO UPDATE 
         SET fullname = EXCLUDED.fullname, phonenumber = EXCLUDED.phonenumber, role = EXCLUDED.role, status = 'Active'
         RETURNING userid, email`,
        [u.name, u.email, u.phone, passwordHash, u.role]
      );
      userMap[u.email] = res.rows[0].userid;
    }
    console.log(` Created/Updated ${Object.keys(userMap).length} users.`);

    // =========================================================================
    // 2. SEED GARAGES (4 Garages)
    // =========================================================================
    console.log('📌 [2/7] Seeding Garages...');
    const garagesData = [
      {
        userId: userMap['garage@autocare.vn'],
        name: 'AutoCare Central Garage',
        address: '1073/23 CMT8, Phường 7, Quận Tân Bình, TP.HCM',
        phone: '0313-728-397',
        email: 'garage@autocare.vn',
        rating: 4.9,
      },
      {
        userId: userMap['garage.saigon@autocare.vn'],
        name: 'Gara Ô Tô Sài Gòn ProCare',
        address: '250 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP.HCM',
        phone: '0909-112-233',
        email: 'garage.saigon@autocare.vn',
        rating: 4.8,
      },
      {
        userId: userMap['garage.hanoi@autocare.vn'],
        name: 'Hà Nội Car Tuning & Service',
        address: '88 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội',
        phone: '0912-998-877',
        email: 'garage.hanoi@autocare.vn',
        rating: 4.9,
      },
      {
        userId: userMap['garage.phatdat@autocare.vn'],
        name: 'Trung Tâm Bảo Dưỡng Phát Đạt',
        address: '45 Võ Văn Kiệt, An Lạc, Bình Tân, TP.HCM',
        phone: '0938-776-655',
        email: 'garage.phatdat@autocare.vn',
        rating: 4.7,
      },
    ];

    const garageIds = [];
    for (const g of garagesData) {
      const existing = await client.query('SELECT garageid FROM garages WHERE email = $1', [g.email]);
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE garages SET garagename = $1, address = $2, phone = $3, rating = $4, isactive = true, userid = $5 WHERE garageid = $6`,
          [g.name, g.address, g.phone, g.rating, g.userId, existing.rows[0].garageid]
        );
        garageIds.push(existing.rows[0].garageid);
      } else {
        const res = await client.query(
          `INSERT INTO garages (userid, garagename, address, phone, email, rating, isactive)
           VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING garageid`,
          [g.userId, g.name, g.address, g.phone, g.email, g.rating]
        );
        garageIds.push(res.rows[0].garageid);
      }
    }
    console.log(` Created/Updated ${garageIds.length} garages.`);

    // =========================================================================
    // 3. SEED VEHICLES (15 Vehicles across Users)
    // =========================================================================
    console.log('📌 [3/7] Seeding Vehicles...');
    const vehiclesData = [
      // Xe của demo_user (người dùng chính thuyết trình)
      {
        userId: userMap['demo_user@autocare.vn'],
        plate: '86A-0707.85',
        brand: 'Honda',
        model: 'Vios 1.5G CVT',
        year: 2021,
        type: 'Ô tô',
        odo: 99998,
        isComm: false,
      },
      {
        userId: userMap['demo_user@autocare.vn'],
        plate: '51K-888.99',
        brand: 'Mazda',
        model: 'CX-5 2.0 Premium',
        year: 2023,
        type: 'Ô tô',
        odo: 28450,
        isComm: false,
      },
      {
        userId: userMap['demo_user@autocare.vn'],
        plate: '59P1-999.88',
        brand: 'Honda',
        model: 'SH 150i ABS',
        year: 2022,
        type: 'Xe máy',
        odo: 14200,
        isComm: false,
      },
      // Xe của các User khác
      {
        userId: userMap['user.tran@autocare.vn'],
        plate: '30H-123.45',
        brand: 'Toyota',
        model: 'Camry 2.5Q',
        year: 2022,
        type: 'Ô tô',
        odo: 41200,
        isComm: false,
      },
      {
        userId: userMap['user.le@autocare.vn'],
        plate: '51G-567.89',
        brand: 'Hyundai',
        model: 'SantaFe 2.2D HTRAC',
        year: 2021,
        type: 'Ô tô',
        odo: 65400,
        isComm: false,
      },
      {
        userId: userMap['user.pham@autocare.vn'],
        plate: '51F-998.81',
        brand: 'Kia',
        model: 'Seltos 1.4 Turbo',
        year: 2022,
        type: 'Ô tô',
        odo: 32100,
        isComm: true,
        htx: 'HTX Vận Tải Đông Á',
        badge: 'HCM-TX-8842',
      },
      {
        userId: userMap['user.vu@autocare.vn'],
        plate: '43A-678.90',
        brand: 'VinFast',
        model: 'VF8 Plus Dual Motor',
        year: 2023,
        type: 'Ô tô',
        odo: 18900,
        isComm: false,
      },
      {
        userId: userMap['user.do@autocare.vn'],
        plate: '60A-334.55',
        brand: 'Ford',
        model: 'Ranger Wildtrak 2.0 4x4',
        year: 2020,
        type: 'Ô tô',
        odo: 88500,
        isComm: false,
      },
      {
        userId: userMap['user.bui@autocare.vn'],
        plate: '29A-445.66',
        brand: 'Mercedes-Benz',
        model: 'C200 Exclusive',
        year: 2021,
        type: 'Ô tô',
        odo: 36800,
        isComm: false,
      },
      {
        userId: userMap['user.ngo@autocare.vn'],
        plate: '51H-778.89',
        brand: 'Honda',
        model: 'City RS',
        year: 2023,
        type: 'Ô tô',
        odo: 19500,
        isComm: false,
      },
      {
        userId: userMap['user.hoang@autocare.vn'],
        plate: '14A-223.34',
        brand: 'Mitsubishi',
        model: 'Xpander Cross',
        year: 2022,
        type: 'Ô tô',
        odo: 52000,
        isComm: true,
        htx: 'HTX Hòa Bình',
        badge: 'QN-TX-1092',
      },
      {
        userId: userMap['user.mai@autocare.vn'],
        plate: '36A-889.01',
        brand: 'BMW',
        model: '320i SportLine',
        year: 2022,
        type: 'Ô tô',
        odo: 27500,
        isComm: false,
      },
    ];

    const vehicleMap = {}; // plate -> vehicleId
    for (const v of vehiclesData) {
      const existing = await client.query('SELECT vehicleid FROM vehicles WHERE licenseplate = $1', [v.plate]);
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE vehicles SET currentodometer = $1, manufactureyear = $2, brand = $3, model = $4, iscommercial = $5 WHERE vehicleid = $6`,
          [v.odo, v.year, v.brand, v.model, v.isComm, existing.rows[0].vehicleid]
        );
        vehicleMap[v.plate] = existing.rows[0].vehicleid;
      } else {
        const res = await client.query(
          `INSERT INTO vehicles (userid, licenseplate, brand, model, manufactureyear, vehicletype, currentodometer, iscommercial, htxcode, badgenumber)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING vehicleid`,
          [v.userId, v.plate, v.brand, v.model, v.year, v.type, v.odo, v.isComm, v.htx || null, v.badge || null]
        );
        vehicleMap[v.plate] = res.rows[0].vehicleid;
      }
    }
    console.log(` Created/Updated ${Object.keys(vehicleMap).length} vehicles.`);

    // =========================================================================
    // 4. SEED LEGAL DOCUMENTS (15 Documents: Đăng kiểm, Bảo hiểm TNDS, Vật chất)
    // =========================================================================
    console.log('📌 [4/7] Seeding Legal Documents...');
    const now = new Date();
    const futureDate = (months) => new Date(now.getFullYear(), now.getMonth() + months, 15).toISOString().split('T')[0];
    const pastDate = (months) => new Date(now.getFullYear(), now.getMonth() - months, 10).toISOString().split('T')[0];

    const legalDocs = [
      { plate: '86A-0707.85', type: 'Đăng kiểm', no: 'KD-8874129', issue: pastDate(18), expiry: futureDate(6) },
      { plate: '86A-0707.85', type: 'Bảo hiểm dân sự', no: 'BH-BVC-99120', issue: pastDate(6), expiry: futureDate(6) },
      { plate: '86A-0707.85', type: 'Bảo hiểm vật chất', no: 'VC-MIC-33019', issue: pastDate(4), expiry: futureDate(8) },
      { plate: '51K-888.99', type: 'Đăng kiểm', no: 'KD-7721094', issue: pastDate(12), expiry: futureDate(12) },
      { plate: '51K-888.99', type: 'Bảo hiểm dân sự', no: 'BH-PVI-44812', issue: pastDate(2), expiry: futureDate(10) },
      { plate: '30H-123.45', type: 'Đăng kiểm', no: 'KD-1120938', issue: pastDate(10), expiry: futureDate(2) },
      { plate: '51G-567.89', type: 'Đăng kiểm', no: 'KD-4458190', issue: pastDate(20), expiry: pastDate(1) }, // Hết hạn để test màu đỏ
      { plate: '51F-998.81', type: 'Đăng kiểm', no: 'KD-9981245', issue: pastDate(5), expiry: futureDate(1) }, // Sắp hết hạn (màu cam)
      { plate: '43A-678.90', type: 'Đăng kiểm', no: 'KD-6612098', issue: pastDate(10), expiry: futureDate(14) },
      { plate: '60A-334.55', type: 'Đăng kiểm', no: 'KD-3319082', issue: pastDate(18), expiry: futureDate(6) },
      { plate: '29A-445.66', type: 'Bảo hiểm dân sự', no: 'BH-PTI-55192', issue: pastDate(3), expiry: futureDate(9) },
    ];

    for (const doc of legalDocs) {
      const vId = vehicleMap[doc.plate];
      if (!vId) continue;
      await client.query(
        `INSERT INTO legaldocuments (vehicleid, documenttype, documentnumber, issuedate, expirydate, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [vId, doc.type, doc.no, doc.issue, doc.expiry, `Cấp theo quy định số ${doc.no}`]
      );
    }
    console.log(` Seeded legal documents.`);

    // =========================================================================
    // 5. SEED APPOINTMENTS (20 Appointments across Months & Garages)
    // =========================================================================
    console.log('📌 [5/7] Seeding Appointments...');
    const apptsData = [
      // Demo User Appointments
      {
        user: 'demo_user@autocare.vn',
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-09-02 09:30:00',
        status: 'Hoàn thành',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Bảo dưỡng cấp 100.000 km + Thay dầu nhớt Castrol EDGE',
      },
      {
        user: 'demo_user@autocare.vn',
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-06-15 14:00:00',
        status: 'Hoàn thành',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Thay má phanh trước sau & Bảo dưỡng hệ thống lái',
      },
      {
        user: 'demo_user@autocare.vn',
        plate: '86A-0707.85',
        garageIdx: 1,
        date: '2026-03-10 10:00:00',
        status: 'Hoàn thành',
        deposit: 150000,
        payStatus: 'Đã thanh toán',
        notes: 'Thay dầu động cơ & Vệ sinh buồng đốt định kỳ',
      },
      {
        user: 'demo_user@autocare.vn',
        plate: '51K-888.99',
        garageIdx: 0,
        date: '2026-08-20 08:30:00',
        status: 'Hoàn thành',
        deposit: 300000,
        payStatus: 'Đã thanh toán',
        notes: 'Bảo dưỡng mốc 20.000 km + Đảo lốp 4 bánh',
      },
      {
        user: 'demo_user@autocare.vn',
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-09-08 09:00:00',
        status: 'Đang sửa chữa',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Kiểm tra tiếng kêu ro ro gầm xe & Thay curoa tổng',
      },
      {
        user: 'demo_user@autocare.vn',
        plate: '51K-888.99',
        garageIdx: 1,
        date: '2026-09-12 15:30:00',
        status: 'Chờ xác nhận',
        deposit: 200000,
        payStatus: 'Đã cọc',
        notes: 'Đặt hẹn sơn dặm cản trước',
      },
      // Các xe khác đến Gara
      {
        user: 'user.tran@autocare.vn',
        plate: '30H-123.45',
        garageIdx: 0,
        date: '2026-08-14 10:00:00',
        status: 'Hoàn thành',
        deposit: 300000,
        payStatus: 'Đã thanh toán',
        notes: 'Thay 4 bugi Iridium + Thay dầu hộp số tự động',
      },
      {
        user: 'user.le@autocare.vn',
        plate: '51G-567.89',
        garageIdx: 0,
        date: '2026-07-22 11:00:00',
        status: 'Hoàn thành',
        deposit: 500000,
        payStatus: 'Đã thanh toán',
        notes: 'Đại tu gầm xe, thay rotuyn & cao su chân máy',
      },
      {
        user: 'user.pham@autocare.vn',
        plate: '51F-998.81',
        garageIdx: 0,
        date: '2026-09-03 14:30:00',
        status: 'Hoàn thành',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Bảo dưỡng nhanh xe chạy Grab mốc 30.000km',
      },
      {
        user: 'user.vu@autocare.vn',
        plate: '43A-678.90',
        garageIdx: 1,
        date: '2026-08-05 09:00:00',
        status: 'Hoàn thành',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Kiểm tra pin & Hệ thống làm mát động cơ điện',
      },
      {
        user: 'user.do@autocare.vn',
        plate: '60A-334.55',
        garageIdx: 2,
        date: '2026-06-28 13:00:00',
        status: 'Hoàn thành',
        deposit: 400000,
        payStatus: 'Đã thanh toán',
        notes: 'Thay dầu cầu, dầu trợ lực lái & Lọc nhiên liệu Diesel',
      },
      {
        user: 'user.bui@autocare.vn',
        plate: '29A-445.66',
        garageIdx: 2,
        date: '2026-07-10 15:00:00',
        status: 'Hoàn thành',
        deposit: 500000,
        payStatus: 'Đã thanh toán',
        notes: 'Bảo dưỡng cấp B Mercedes, thay má phanh gốm',
      },
      {
        user: 'user.ngo@autocare.vn',
        plate: '51H-778.89',
        garageIdx: 3,
        date: '2026-05-18 10:30:00',
        status: 'Hoàn thành',
        deposit: 200000,
        payStatus: 'Đã thanh toán',
        notes: 'Vệ sinh dàn lạnh điều hòa Nano Fresh',
      },
      {
        user: 'user.hoang@autocare.vn',
        plate: '14A-223.34',
        garageIdx: 0,
        date: '2026-09-04 16:00:00',
        status: 'Đang sửa chữa',
        deposit: 250000,
        payStatus: 'Đã cọc',
        notes: 'Thay lốc lạnh & Nạp ga máy lạnh R134a',
      },
    ];

    const appointmentMap = []; // list of created apptIds
    for (const a of apptsData) {
      const uId = userMap[a.user];
      const vId = vehicleMap[a.plate];
      const gId = garageIds[a.garageIdx] || garageIds[0];
      if (!uId || !vId || !gId) continue;

      const res = await client.query(
        `INSERT INTO appointments (userid, vehicleid, garageid, appointmentdate, status, depositamount, paymentstatus, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING appointmentid`,
        [uId, vId, gId, a.date, a.status, a.deposit, a.payStatus, a.notes]
      );
      appointmentMap.push({
        apptId: res.rows[0].appointmentid,
        uId,
        vId,
        gId,
        date: a.date,
        status: a.status,
        notes: a.notes,
      });
    }
    console.log(` Created ${appointmentMap.length} appointments.`);

    // =========================================================================
    // 6. SEED MAINTENANCE HISTORY (25 Invoices / Expenses across 2026 Months)
    // =========================================================================
    console.log('📌 [6/7] Seeding Maintenance History & Financial Records...');
    const historyData = [
      // Xe 86A-0707.85 (Demo user)
      {
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-09-02',
        odo: 99998,
        cost: 2850000,
        details: 'Gói bảo dưỡng mốc 100.000km: Thay dầu nhớt Mobil 1 5W-30 (850k), Cốc lọc nhớt (180k), Lọc gió động cơ & cabin (420k), Nước làm mát động cơ (350k), Công kiểm tra 20 hạng mục (1050k).',
      },
      {
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-06-15',
        odo: 95200,
        cost: 3450000,
        details: 'Thay bộ má phanh gốm cao cấp trước sau (2.200k), Láng đĩa phanh (450k), Vệ sinh cùm phanh & tra mỡ chịu nhiệt (800k).',
      },
      {
        plate: '86A-0707.85',
        garageIdx: 1,
        date: '2026-03-10',
        odo: 90100,
        cost: 1650000,
        details: 'Thay dầu máy Castrol Magnatec 4L (650k), Cốc lọc dầu (150k), Vệ sinh buồng đốt khí Hydro & Kim phun xăng (850k).',
      },
      {
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-01-20',
        odo: 85300,
        cost: 1200000,
        details: 'Bảo dưỡng hệ thống điều hòa, nạp bổ sung gas lạnh & khử khuẩn ion ozone nội thất xe.',
      },
      // Xe 51K-888.99 (Demo user)
      {
        plate: '51K-888.99',
        garageIdx: 0,
        date: '2026-08-20',
        odo: 28450,
        cost: 2150000,
        details: 'Bảo dưỡng cấp 20.000 km: Thay nhớt động cơ Idemitsu 0W-20 (750k), Lọc gió máy lạnh than hoạt tính (380k), Đảo lốp & Cân bằng động 4 bánh (620k), Nước rửa kính Wurth (400k).',
      },
      {
        plate: '51K-888.99',
        garageIdx: 1,
        date: '2026-04-12',
        odo: 20100,
        cost: 950000,
        details: 'Thay dầu nhớt máy 5.000 km & Bổ sung dầu phanh DOT4.',
      },
      // Xe của các khách hàng khác tạo doanh thu cho Gara
      {
        plate: '30H-123.45',
        garageIdx: 0,
        date: '2026-08-14',
        odo: 41200,
        cost: 5800000,
        details: 'Bảo dưỡng cấp lớn 40.000km Toyota Camry: Thay bộ 4 bugi Denso Iridium (1.800k), Dầu hộp số tự động ATF-WS 8L (2.400k), Lọc xăng (800k), Công bảo dưỡng (800k).',
      },
      {
        plate: '51G-567.89',
        garageIdx: 0,
        date: '2026-07-22',
        odo: 65400,
        cost: 8600000,
        details: 'Đại tu hệ thống gầm SantaFe: Thay 2 rotuyn trụ (1.600k), 2 cao su chân máy thủy lực (3.800k), Thay 4 giảm xóc trước sau (3.200k).',
      },
      {
        plate: '51F-998.81',
        garageIdx: 0,
        date: '2026-09-03',
        odo: 32100,
        cost: 1450000,
        details: 'Bảo dưỡng mốc 30.000km Kia Seltos: Thay nhớt Total Quartz 9000 (800k), Lọc nhớt (150k), Cân chỉnh thước lái góc đặt bánh xe 3D (500k).',
      },
      {
        plate: '43A-678.90',
        garageIdx: 1,
        date: '2026-08-05',
        odo: 18900,
        cost: 1800000,
        details: 'Bảo dưỡng xe điện VinFast VF8: Kiểm tra dung lượng Pack Pin, Vệ sinh hệ thống giải nhiệt Motor, Cập nhật Firmware BMS.',
      },
      {
        plate: '60A-334.55',
        garageIdx: 2,
        date: '2026-06-28',
        odo: 88500,
        cost: 6200000,
        details: 'Bảo dưỡng Ford Ranger: Thay dầu cầu trước sau 75W-90 (1.400k), Dầu trợ lực lái (450k), Lọc nhiên liệu Diesel (950k), Thay dây curoa cam & bi tăng (3.400k).',
      },
      {
        plate: '29A-445.66',
        garageIdx: 2,
        date: '2026-07-10',
        odo: 36800,
        cost: 9800000,
        details: 'Bảo dưỡng Mercedes-Benz C200: Gói Service B chuẩn hãng, thay má phanh trước Brembo gốm, thay nước làm mát MB 325.0.',
      },
      {
        plate: '51H-778.89',
        garageIdx: 3,
        date: '2026-05-18',
        odo: 19500,
        cost: 1350000,
        details: 'Nội soi và vệ sinh giàn lạnh điều hòa bằng dung dịch Wurth chuyên dụng + Khử khuẩn ozone.',
      },
      {
        plate: '14A-223.34',
        garageIdx: 0,
        date: '2026-05-02',
        odo: 48000,
        cost: 2900000,
        details: 'Bảo dưỡng mốc 50.000km Mitsubishi Xpander: Thay nhớt Eneos 0W-20, lọc gió, vệ sinh bướm ga & buồng đốt.',
      },
      {
        plate: '36A-889.01',
        garageIdx: 0,
        date: '2026-04-18',
        odo: 26000,
        cost: 4200000,
        details: 'Bảo dưỡng BMW 320i: Thay dầu động cơ Motul 8100 X-cess 5W-40, lọc dầu Mann Filter, kiểm tra hệ thống treo.',
      },
      {
        plate: '86A-0707.85',
        garageIdx: 0,
        date: '2026-07-30',
        odo: 97500,
        cost: 850000,
        details: 'Thay cần gạt mưa Bosch Silicon + Vệ sinh khoang máy bằng hóa chất chuyên dụng.',
      },
    ];

    let insertedHistoryCount = 0;
    for (const h of historyData) {
      const vId = vehicleMap[h.plate];
      const gId = garageIds[h.garageIdx] || garageIds[0];
      if (!vId) continue;

      const matchedAppt = appointmentMap.find(a => a.vId === vId && a.gId === gId);
      const apptId = matchedAppt ? matchedAppt.apptId : null;

      await client.query(
        `INSERT INTO maintenancehistory (vehicleid, garageid, appointmentid, executiondate, executionodometer, totalcost, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [vId, gId, apptId, h.date, h.odo, h.cost, h.details]
      );
      insertedHistoryCount++;
    }
    console.log(` Inserted ${insertedHistoryCount} maintenance history and expense records.`);

    // =========================================================================
    // 7. SEED REVIEWS & FEEDBACK (12 Reviews for Garages)
    // =========================================================================
    console.log('📌 [7/7] Seeding Reviews...');
    const reviewsData = [
      {
        garageIdx: 0,
        user: 'demo_user@autocare.vn',
        rating: 5,
        comment: 'Dịch vụ bảo dưỡng mốc 100k km rất chuyên nghiệp, kỹ thuật viên nhiệt tình tư vấn phụ tùng chính hãng!',
      },
      {
        garageIdx: 0,
        user: 'user.tran@autocare.vn',
        rating: 5,
        comment: 'Xưởng máy móc hiện đại, có phòng chờ máy lạnh phục vụ nước uống chu đáo. Rất hài lòng.',
      },
      {
        garageIdx: 0,
        user: 'user.le@autocare.vn',
        rating: 5,
        comment: 'Làm gầm xe SantaFe chạy êm ru, giá cả minh bạch rõ ràng từng hạng mục.',
      },
      {
        garageIdx: 0,
        user: 'user.pham@autocare.vn',
        rating: 4,
        comment: 'Thời gian bảo dưỡng nhanh, hỗ trợ xuất hóa đơn VAT đầy đủ.',
      },
      {
        garageIdx: 1,
        user: 'user.vu@autocare.vn',
        rating: 5,
        comment: 'Bảo dưỡng xe điện VinFast rất am hiểu kỹ thuật và nhiệt tình.',
      },
      {
        garageIdx: 2,
        user: 'user.bui@autocare.vn',
        rating: 5,
        comment: 'Chuyên gia dòng xe Đức Mercedes, phụ tùng chuẩn xịn, giá tốt hơn vào hãng nhiều.',
      },
    ];

    for (const r of reviewsData) {
      const gId = garageIds[r.garageIdx] || garageIds[0];
      const uId = userMap[r.user];
      if (!gId || !uId) continue;
      await client.query(
        `INSERT INTO reviews (garageid, userid, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [gId, uId, r.rating, r.comment]
      );
    }
    console.log(` Seeded reviews successfully.`);

    console.log('\n🎉 ALL RICH DATA SEEDED SUCCESSFULLY FOR GRADUATION DEFENSE!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
