const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

// Khởi tạo Presentation
const pptx = new pptxgen();

pptx.title = 'Báo Cáo Đồ Án Tốt Nghiệp - AutoCare Office Helper (ACOH)';
pptx.subject = 'Hệ thống Quản lý Lịch Đăng kiểm, Bảo dưỡng và Bảo hiểm Phương tiện';
pptx.author = 'Sinh viên thực hiện Đồ án Tốt nghiệp';
pptx.company = 'Hội đồng Bảo vệ Đồ án Tốt nghiệp';
pptx.layout = 'LAYOUT_16x9';

// Bảng màu thiết kế chuyên nghiệp cho Đồ án Tốt nghiệp (Corporate & Modern Tech)
const COLORS = {
  darkBg: '0F172A',        // Slate 900
  darkCardBg: '1E293B',    // Slate 800
  lightBg: 'F8FAFC',       // Slate 50
  white: 'FFFFFF',         // Pure White
  primaryBlue: '1D4ED8',   // Blue 700
  accentCyan: '0284C7',    // Sky 600
  accentGold: 'D97706',    // Amber 600
  textDark: '0F172A',      // Slate 900
  textMuted: '475569',     // Slate 600
  textLight: 'F1F5F9',     // Slate 100
  borderLight: 'E2E8F0',   // Slate 200
  borderDark: '334155',    // Slate 700
  dangerRed: 'DC2626',     // Red 600
  successGreen: '16A34A',  // Green 600
  purple: '7C3AED'         // Violet 600
};

// Helper tạo Header cho Slide chuẩn
function addSlideHeader(slide, titleStr, subtitleStr, isDark = false) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 0.4, w: 0.08, h: 0.8,
    fill: { color: isDark ? COLORS.accentGold : COLORS.primaryBlue },
    line: { color: isDark ? COLORS.accentGold : COLORS.primaryBlue, width: 0 }
  });
  slide.addText(titleStr, {
    x: 0.8, y: 0.35, w: 11.8, h: 0.45,
    fontSize: 20, bold: true, color: isDark ? COLORS.accentGold : COLORS.primaryBlue,
    fontFace: 'Segoe UI'
  });
  slide.addText(subtitleStr, {
    x: 0.8, y: 0.8, w: 11.8, h: 0.35,
    fontSize: 12.5, color: isDark ? COLORS.textLight : COLORS.textMuted,
    fontFace: 'Segoe UI', valign: 'middle'
  });
}

function setSlideBg(slide, isDark = false) {
  slide.background = { fill: isDark ? COLORS.darkBg : COLORS.lightBg };
}

// -------------------------------------------------------------
// SLIDE 1: TRANG BÌA (COVER SLIDE - DARK THEME)
// -------------------------------------------------------------
const slide1 = pptx.addSlide();
setSlideBg(slide1, true);

slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 5.66, y: 0.9, w: 2.0, h: 0.06,
  fill: { color: COLORS.accentGold },
  line: { color: COLORS.accentGold, width: 0 }
});

slide1.addText('TRƯỜNG ĐẠI HỌC ... - KHOA CÔNG NGHỆ THÔNG TIN', {
  x: 0.5, y: 1.1, w: 12.33, h: 0.35,
  fontSize: 13, bold: true, color: COLORS.accentGold,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 1.5
});

slide1.addText('BÁO CÁO BẢO VỆ ĐỒ ÁN TỐT NGHIỆP', {
  x: 0.5, y: 1.5, w: 12.33, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.textLight,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 1
});

slide1.addText('AUTOCARE OFFICE HELPER (ACOH)', {
  x: 0.5, y: 2.1, w: 12.33, h: 0.9,
  fontSize: 30, bold: true, color: COLORS.white,
  align: 'center', fontFace: 'Segoe UI'
});

slide1.addText('Hệ Thống Số Hóa & Tự Động Quản Lý Lịch Đăng Kiểm, Bảo Dưỡng, Bảo Hiểm Phương Tiện', {
  x: 1.0, y: 3.1, w: 11.33, h: 0.5,
  fontSize: 14, italic: true, color: '94A3B8',
  align: 'center', fontFace: 'Segoe UI'
});

// Card thông tin
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 2.2, y: 4.1, w: 8.93, h: 2.5,
  fill: { color: COLORS.darkCardBg },
  line: { color: COLORS.borderDark, width: 1.5 }
});

slide1.addText([
  { text: 'GIẢNG VIÊN HƯỚNG DẪN\n', options: { bold: true, color: COLORS.accentGold, fontSize: 11 } },
  { text: 'ThS. / TS. [Họ và Tên GVHD]\n', options: { bold: true, fontSize: 14, color: COLORS.white } },
  { text: 'Bộ môn: Kỹ thuật Phần mềm / CNTT', options: { fontSize: 12, color: '94A3B8' } }
], {
  x: 2.6, y: 4.4, w: 4.0, h: 1.9,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 22
});

slide1.addText([
  { text: 'SINH VIÊN THỰC HIỆN\n', options: { bold: true, color: COLORS.accentGold, fontSize: 11 } },
  { text: '1. [Họ và Tên Sinh Viên] (MSSV: ...)\n', options: { bold: true, fontSize: 13, color: COLORS.white } },
  { text: 'Chuyên ngành: Kỹ thuật Phần mềm\n', options: { fontSize: 12, color: '94A3B8' } },
  { text: 'Khóa / Niên khóa: 2022 - 2026', options: { fontSize: 12, color: '94A3B8' } }
], {
  x: 6.8, y: 4.4, w: 4.0, h: 1.9,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 22
});

// -------------------------------------------------------------
// SLIDE 2: BỐI CẢNH & TÍNH CẤP THIẾT CỦA ĐỀ TÀI
// -------------------------------------------------------------
const slide2 = pptx.addSlide();
setSlideBg(slide2, false);
addSlideHeader(slide2, '01. BỐI CẢNH & TÍNH CẤP THIẾT CỦA ĐỀ TÀI', 'Lý do nghiên cứu, khó khăn thực tế của chủ xe và các cơ sở dịch vụ bảo dưỡng');

// 3 Thẻ thực trạng
const painPoints = [
  {
    title: '1. Quên mốc pháp lý & bảo dưỡng',
    color: COLORS.dangerRed,
    items: [
      'Chủ xe (đặc biệt giới văn phòng) thường quên chu kỳ đăng kiểm, hạn bảo hiểm bắt buộc TNDS.',
      'Bị xử phạt hành chính từ 4 - 16 triệu đồng và tước GPLX khi quá hạn đăng kiểm.',
      'Quên thay dầu nhớt, nước làm mát định kỳ gây hao mòn động cơ nghiêm trọng.'
    ]
  },
  {
    title: '2. Quản trị thủ công & Rời rạc',
    color: COLORS.accentGold,
    items: [
      'Ghi chép sổ tay hoặc giữ giấy tờ rời rạc, dễ thất lạc hóa đơn sửa chữa.',
      'Không có công cụ tính toán chi phí vận hành (TCO) và theo dõi biến động kilomet thực tế.',
      'Khó quản lý đội xe dịch vụ (Grab, Taxi, Hợp tác xã, xe thương mại).'
    ]
  },
  {
    title: '3. Gara dịch vụ thiếu số hóa',
    color: COLORS.primaryBlue,
    items: [
      'Đặt lịch thủ công qua điện thoại, tỷ lệ lỡ hẹn và dồn ứ xe vào giờ cao điểm.',
      'Quy trình tiếp nhận, báo giá và nghiệm thu chưa minh bạch, tốn thời gian trao đổi.',
      'Thiếu sổ nhật ký điện tử liên thông giữa khách hàng và xưởng dịch vụ.'
    ]
  }
];

painPoints.forEach((p, idx) => {
  const cX = 0.6 + idx * 4.05;
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: cX, y: 1.5, w: 3.85, h: 5.3,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderLight, width: 1.5 }
  });
  slide2.addShape(pptx.shapes.RECTANGLE, {
    x: cX, y: 1.5, w: 3.85, h: 0.1,
    fill: { color: p.color },
    line: { color: p.color, width: 0 }
  });
  slide2.addText(p.title, {
    x: cX + 0.2, y: 1.8, w: 3.45, h: 0.4,
    fontSize: 14, bold: true, color: p.color, fontFace: 'Segoe UI'
  });
  const textArr = [];
  p.items.forEach(it => {
    textArr.push({ text: `• ${it}\n\n`, options: { color: COLORS.textMuted, fontSize: 11.5 } });
  });
  slide2.addText(textArr, {
    x: cX + 0.2, y: 2.3, w: 3.45, h: 4.3,
    fontFace: 'Segoe UI', lineSpacing: 18
  });
});

// -------------------------------------------------------------
// SLIDE 3: MỤC TIÊU & GIẢI PHÁP ĐỀ XUẤT (ACOH)
// -------------------------------------------------------------
const slide3 = pptx.addSlide();
setSlideBg(slide3, false);
addSlideHeader(slide3, '02. MỤC TIÊU & HỆ THỐNG ĐỀ XUẤT ACOH', 'Nền tảng AutoCare Office Helper kết nối toàn diện Chủ xe - Gara - Quản trị viên');

// Left Box: Mục tiêu
slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.5, w: 5.8, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});
slide3.addText('MỤC TIÊU CỐT LÕI CỦA ĐỒ ÁN', {
  x: 0.9, y: 1.8, w: 5.2, h: 0.4,
  fontSize: 15, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});
slide3.addText([
  { text: '1. Số hóa tập trung: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Lưu trữ toàn diện hồ sơ phương tiện, đăng kiểm, bảo hiểm, nhật ký sửa chữa trên đám mây.\n\n', options: { color: COLORS.textMuted } },
  { text: '2. Cảnh báo tự động đa kênh: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Quét ngầm Cron Job lúc 00:00, đẩy cảnh báo Real-time Socket.IO & Email SMTP trước hạn.\n\n', options: { color: COLORS.textMuted } },
  { text: '3. Khép kín quy trình Gara 4 bước: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Tiếp nhận xe → Kiểm tra mốc km → Báo giá điện tử → Thi công & Xuất hóa đơn.\n\n', options: { color: COLORS.textMuted } },
  { text: '4. Ứng dụng Trí tuệ Nhân tạo (AI): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'AI OCR quét biển số xe qua WebCam thực tế và AI Chatbot hỗ trợ kỹ thuật xe 24/7.', options: { color: COLORS.textMuted } }
], {
  x: 0.9, y: 2.3, w: 5.2, h: 4.3,
  fontSize: 12, fontFace: 'Segoe UI', lineSpacing: 18
});

// Right Box: 3 Đối tượng người dùng
slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.5, w: 5.9, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});
slide3.addText('MÔ HÌNH PHÂN QUYỀN ĐA VAI TRÒ (RBAC)', {
  x: 7.1, y: 1.8, w: 5.3, h: 0.4,
  fontSize: 15, bold: true, color: COLORS.successGreen, fontFace: 'Segoe UI'
});

const roles = [
  { role: 'CHỦ PHƯƠNG TIỆN (USER)', desc: 'Quản lý xe ô tô/xe máy, cập nhật nhanh số km, nhận cảnh báo hết hạn, đặt lịch sửa chữa, xem biểu đồ chi tiêu và hỏi đáp với AI Chatbot.', color: COLORS.primaryBlue },
  { role: 'GARA ĐỐI TÁC (GARAGE)', desc: 'Tiếp nhận xe qua quét biển số OCR WebCam, duyệt lịch hẹn, lập báo giá theo mốc km, cập nhật sổ bảo dưỡng điện tử và quản lý doanh thu.', color: COLORS.accentGold },
  { role: 'QUẢN TRỊ VIÊN (ADMIN)', desc: 'Quản lý người dùng, kiểm duyệt gara đối tác, giám sát toàn bộ hoạt động giao dịch và thống kê tăng trưởng hệ thống qua Dashboard.', color: COLORS.purple }
];

roles.forEach((r, idx) => {
  const rY = 2.4 + idx * 1.4;
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.1, y: rY, w: 5.3, h: 1.25,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.borderLight, width: 1 }
  });
  slide3.addText(r.role, {
    x: 7.3, y: rY + 0.1, w: 4.9, h: 0.3,
    fontSize: 11, bold: true, color: r.color, fontFace: 'Segoe UI'
  });
  slide3.addText(r.desc, {
    x: 7.3, y: rY + 0.4, w: 4.9, h: 0.75,
    fontSize: 10, color: COLORS.textMuted, fontFace: 'Segoe UI', lineSpacing: 14
  });
});

// -------------------------------------------------------------
// SLIDE 4: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (CLEAN ARCHITECTURE)
// -------------------------------------------------------------
const slide4 = pptx.addSlide();
setSlideBg(slide4, false);
addSlideHeader(slide4, '03. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ SỬ DỤNG', 'Mô hình Clean Architecture 3 lớp đảm bảo tính mở rộng, bảo mật và hiệu năng cao');

// Left Column: Tech Stack Cards
slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.5, w: 5.5, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});
slide4.addText('CÔNG NGHỆ PHÁT TRIỂN (TECH STACK)', {
  x: 0.9, y: 1.8, w: 4.9, h: 0.4,
  fontSize: 15, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

const techItems = [
  { layer: 'Front-end Architecture', detail: 'ReactJS (Vite), TailwindCSS, Shadcn/ui Components, Recharts, Socket.IO Client, Axios, Mobile-First Responsive.' },
  { layer: 'Back-end Clean Architecture', detail: 'NestJS Framework (TypeScript), Modules Controller - Service - Gateway, JWT Authentication, BCrypt băm mật khẩu, Nodemailer SMTP.' },
  { layer: 'Database & Caching Engine', detail: 'Microsoft SQL Server (2014+) chuẩn hóa 3NF, Non-clustered Indexes trên UserID, VehicleID, ExecutionDate.' },
  { layer: 'AI & Automation Engine', detail: 'Tesseract.js OCR Engine trích xuất biển số xe, Google Generative AI (Chatbot tư vấn xe), Cron Job Scheduling (@Cron 00:00).' }
];

techItems.forEach((t, i) => {
  const tY = 2.3 + i * 1.05;
  slide4.addText([
    { text: `• ${t.layer}:\n`, options: { bold: true, color: COLORS.textDark, fontSize: 11 } },
    { text: `${t.detail}`, options: { color: COLORS.textMuted, fontSize: 10 } }
  ], {
    x: 0.9, y: tY, w: 4.9, h: 0.95,
    fontFace: 'Segoe UI', lineSpacing: 14
  });
});

// Right Column: Embed Clean Architecture Image if exists, or Card structure
const imgCleanArch = path.join(__dirname, '..', 'hinh_2_1_clean_architecture.png');
if (fs.existsSync(imgCleanArch)) {
  slide4.addImage({
    path: imgCleanArch,
    x: 6.4, y: 1.5, w: 6.3, h: 5.3
  });
} else {
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.4, y: 1.5, w: 6.3, h: 5.3,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderLight, width: 1.5 }
  });
  slide4.addText('MÔ HÌNH KIẾN TRÚC CLEAN ARCHITECTURE', {
    x: 6.7, y: 1.8, w: 5.7, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
  });
}

// -------------------------------------------------------------
// SLIDE 5: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)
// -------------------------------------------------------------
const slide5 = pptx.addSlide();
setSlideBg(slide5, false);
addSlideHeader(slide5, '04. PHÂN TÍCH & THIẾT KẾ CƠ SỞ DỮ LIỆU (ERD)', '11 bảng dữ liệu chuẩn hóa quan hệ toàn vẹn và tối ưu hóa hiệu năng truy vấn');

// Embed ERD Image
const imgERD = path.join(__dirname, '..', 'hinh_3_3_mo_hinh_erd.png');
if (fs.existsSync(imgERD)) {
  slide5.addImage({
    path: imgERD,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

// Right summary card
slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide5.addText('CÁC THỰC THỂ CỐT LÕI (11 BẢNG)', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

const dbEntities = [
  'Users: Định danh tài khoản, mật khẩu băm, Role.',
  'Vehicles: Xe cá nhân & xe dịch vụ (HTX, Phù hiệu, Odo).',
  'LegalDocuments: Đăng kiểm, Bảo hiểm TNDS, Bằng lái.',
  'MaintenanceCategories & Items: Ma trận mốc km.',
  'MaintenanceSchedules: Lịch nhắc bảo dưỡng theo km/ngày.',
  'MaintenanceHistory: Sổ nhật ký chi tiết vật tư & chi phí.',
  'Garages & Appointments: Mạng lưới gara & đặt lịch hẹn.',
  'Notifications: Lưu trữ thông báo đẩy đa kênh.',
  'GarageReviews & Payments: Đánh giá & thanh toán online.'
];

const dbTextArr = [];
dbEntities.forEach(e => {
  const parts = e.split(':');
  dbTextArr.push({ text: `• ${parts[0]}: `, options: { bold: true, color: COLORS.textDark, fontSize: 10 } });
  dbTextArr.push({ text: `${parts[1]}\n`, options: { color: COLORS.textMuted, fontSize: 10 } });
});

slide5.addText(dbTextArr, {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontFace: 'Segoe UI', lineSpacing: 15
});

// -------------------------------------------------------------
// SLIDE 6: MODULE 1, 2 - QUẢN LÝ PHƯƠNG TIỆN & XE DỊCH VỤ
// -------------------------------------------------------------
const slide6 = pptx.addSlide();
setSlideBg(slide6, false);
addSlideHeader(slide6, '05. QUẢN LÝ PHƯƠNG TIỆN & ĐỘI XE THƯƠNG MẠI', 'Hỗ trợ quản lý đa phương tiện (ô tô, xe máy) và phân hệ chuyên biệt cho xe chạy dịch vụ');

const imgVehicles = path.join(__dirname, '..', 'hinh_4_2_quan_ly_phuong_tien.png');
if (fs.existsSync(imgVehicles)) {
  slide6.addImage({
    path: imgVehicles,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide6.addText('ĐẶC TẢ NGHIỆP VỤ NỔI BẬT', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

slide6.addText([
  { text: '• Phân loại xe linh hoạt: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Quản lý đồng thời Ô tô và Xe máy với các trường kỹ thuật chuẩn (Hãng, Dòng xe, Năm SX, Biển số Unique).\n\n', options: { color: COLORS.textMuted } },
  { text: '• Quản lý xe Dịch vụ (Commercial Fleet): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Bổ sung thông tin Mã Hợp tác xã (HTX) và Số Phù hiệu xe cho tài xế Grab, Be, Taxi công nghệ.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Cập nhật Odometer nhanh: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Popup cập nhật kilomet hàng ngày/tuần với validation chặn nhập số km mới nhỏ hơn số km cũ.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Tự động kích hoạt bộ lịch mẫu: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Khi thêm xe mới, hệ thống tự động sinh sẵn các mốc nhắc bảo dưỡng +5k km, +10k km, +40k km.', options: { color: COLORS.textMuted } }
], {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontSize: 11, fontFace: 'Segoe UI', lineSpacing: 16
});

// -------------------------------------------------------------
// SLIDE 7: MODULE 4 - HỒ SƠ PHÁP LÝ & CHU KỲ ĐĂNG KIỂM
// -------------------------------------------------------------
const slide7 = pptx.addSlide();
setSlideBg(slide7, false);
addSlideHeader(slide7, '06. QUẢN LÝ HỒ SƠ PHÁP LÝ, ĐĂNG KIỂM & BẢO HIỂM', 'Giám sát chu kỳ kiểm định kỹ thuật, bảo hiểm bắt buộc TNDS và cảnh báo 3 cấp độ');

const imgLegal = path.join(__dirname, '..', 'hinh_4_3_ho_so_phap_ly_dang_kiem.png');
if (fs.existsSync(imgLegal)) {
  slide7.addImage({
    path: imgLegal,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide7.addText('CƠ CHẾ CẢNH BÁO 3 CẤP ĐỘ', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

slide7.addText([
  { text: '• Quản lý 4 nhóm giấy tờ: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Sổ Đăng kiểm ô tô, Bảo hiểm TNDS bắt buộc, Bảo hiểm thân vỏ tự nguyện, Giấy phép lái xe.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Động cơ phân loại màu sắc tự động:\n', options: { bold: true, color: COLORS.textDark } },
  { text: '  - XANH (Còn hạn an toàn): > 30 ngày.\n  - CAM (Sắp hết hạn): <= 30 ngày (cần gia hạn).\n  - ĐỎ (Đã quá hạn nguy hiểm): < 0 ngày.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Tính toán thời gian thực: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Sử dụng DATEDIFF(day, GETDATE(), ExpiryDate) đếm ngược số ngày chính xác từng giây.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Gia hạn 1 chạm: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Cập nhật chu kỳ mới lưu giữ toàn bộ vết lịch sử.', options: { color: COLORS.textMuted } }
], {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontSize: 11, fontFace: 'Segoe UI', lineSpacing: 16
});

// -------------------------------------------------------------
// SLIDE 8: MODULE 3, 5 - MA TRẬN BẢO DƯỠNG & ĐỘNG CƠ CẢNH BÁO
// -------------------------------------------------------------
const slide8 = pptx.addSlide();
setSlideBg(slide8, false);
addSlideHeader(slide8, '07. MA TRẬN BẢO DƯỠNG & ĐỘNG CƠ CẢNH BÁO TỰ ĐỘNG', 'Chuẩn hóa quy trình kỹ thuật xe ô tô và tự động hóa khâu giám sát bằng Cron Job ngầm');

const imgMatrix = path.join(__dirname, '..', 'hinh_4_4_ma_tran_bao_duong_gara.png');
if (fs.existsSync(imgMatrix)) {
  slide8.addImage({
    path: imgMatrix,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide8.addText('ĐẶC TẢ MA TRẬN & CRON ENGINE', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

slide8.addText([
  { text: '• Chuẩn hóa Ma trận mốc Km: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Gói 5.000 km (Nhớt máy) -> Gói 10.000 km (Lọc dầu, đảo lốp) -> Gói 20.000 km (Lọc gió/AC) -> Gói 40.000 km (Dầu số, bugi, nước mát).\n\n', options: { color: COLORS.textMuted } },
  { text: '• Cron Job Quét ngầm (@Cron 00:00): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Tự động rà soát hạn giấy tờ và mốc kilomet (TargetOdometer - CurrentOdometer <= 500 km).\n\n', options: { color: COLORS.textMuted } },
  { text: '• Hạ tầng thông báo đa kênh: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Bắn tín hiệu tức thì qua WebSockets Socket.IO (In-app Popup) kết hợp gửi Email HTML qua Nodemailer SMTP.', options: { color: COLORS.textMuted } }
], {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontSize: 11, fontFace: 'Segoe UI', lineSpacing: 16
});

// -------------------------------------------------------------
// SLIDE 9: MODULE 6, 10 - QUY TRÌNH GARA KHÉP KÍN 4 BƯỚC
// -------------------------------------------------------------
const slide9 = pptx.addSlide();
setSlideBg(slide9, false);
addSlideHeader(slide9, '08. QUY TRÌNH NGHIỆP VỤ BẢO DƯỠNG GARA 4 BƯỚC', 'Số hóa toàn diện sự phối hợp giữa Khách hàng - Tiếp tân - Kỹ thuật viên Gara');

const imgWarning = path.join(__dirname, '..', 'hinh_4_5_dong_co_canh_bao_dat_lich.png');
if (fs.existsSync(imgWarning)) {
  slide9.addImage({
    path: imgWarning,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide9.addText('4 BƯỚC VẬN HÀNH DỊCH VỤ GARA', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

const stepsGarage = [
  { step: 'BƯỚC 1: TIẾP NHẬN & ĐỊNH DANH', desc: 'Quét biển số xe bằng WebCam AI OCR, truy xuất hồ sơ và lịch sử xe.' },
  { step: 'BƯỚC 2: KIỂM TRA & LÊN PHƯƠNG ÁN', desc: 'Kỹ thuật viên kiểm tra xe thực tế, tích chọn checklist mốc kilomet.' },
  { step: 'BƯỚC 3: BÁO GIÁ & XÁC NHẬN', desc: 'Cố vấn lập báo giá điện tử (vật tư + tiền công + VAT), khách hàng duyệt trên app.' },
  { step: 'BƯỚC 4: THI CÔNG & NGHIỆM THU', desc: 'Kỹ thuật thi công, nghiệm thu, xuất hóa đơn và tự động ghi sổ bảo dưỡng.' }
];

const stepTxt = [];
stepsGarage.forEach((s, idx) => {
  stepTxt.push({ text: `${s.step}\n`, options: { bold: true, color: COLORS.primaryBlue, fontSize: 10.5 } });
  stepTxt.push({ text: `${s.desc}\n\n`, options: { color: COLORS.textMuted, fontSize: 10 } });
});

slide9.addText(stepTxt, {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontFace: 'Segoe UI', lineSpacing: 14
});

// -------------------------------------------------------------
// SLIDE 10: MODULE 9 - AI OCR NHẬN DIỆN BIỂN SỐ XE THỰC TẾ
// -------------------------------------------------------------
const slide10 = pptx.addSlide();
setSlideBg(slide10, false);
addSlideHeader(slide10, '09. ĐỘT PHÁ CÔNG NGHỆ: AI OCR QUÉT BIỂN SỐ XE', 'Ứng dụng Tesseract OCR & Regex chuẩn hóa biển số xe Việt Nam trực tiếp qua WebCam');

const imgOCR = path.join(__dirname, '..', 'hinh_4_3_ai_ocr_so_dang_kiem.png');
if (fs.existsSync(imgOCR)) {
  slide10.addImage({
    path: imgOCR,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide10.addText('CƠ CHẾ XỬ LÝ AI OCR THỰC TẾ', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

slide10.addText([
  { text: '• Bóc tách 100% bằng AI thực tế: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Sử dụng Tesseract.js OCR engine xử lý trực tiếp hình ảnh/video từ WebCam của thiết bị.\n\n', options: { color: COLORS.textMuted } },
  { text: '• 2 Chế độ linh hoạt: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Chụp trực tiếp từ camera xưởng hoặc tải tệp ảnh có sẵn lên hệ thống.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Bộ lọc Regex biển số Việt Nam: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Tự động chuẩn hóa định dạng biển số 1 dòng và 2 dòng (VD: 30G-567.89, 51K-123.45).\n\n', options: { color: COLORS.textMuted } },
  { text: '• Định danh & Điền tự động: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Truy xuất ngay thông tin xe trong CSDL, giảm 90% thời gian gõ phím tại quầy tiếp tân.', options: { color: COLORS.textMuted } }
], {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontSize: 11, fontFace: 'Segoe UI', lineSpacing: 16
});

// -------------------------------------------------------------
// SLIDE 11: MODULE 7, 8 - TRỢ LÝ AI CHATBOT & DASHBOARD ANALYTICS
// -------------------------------------------------------------
const slide11 = pptx.addSlide();
setSlideBg(slide11, false);
addSlideHeader(slide11, '10. TRỢ LÝ AI CHATBOT & THỐNG KÊ TRỰC QUAN', 'Tích hợp Trợ lý Trí tuệ Nhân tạo tư vấn kỹ thuật và hệ thống biểu đồ phân tích chi phí');

const imgChatbot = path.join(__dirname, '..', 'hinh_4_6_ai_chatbot_analytics.png');
if (fs.existsSync(imgChatbot)) {
  slide11.addImage({
    path: imgChatbot,
    x: 0.6, y: 1.5, w: 6.8, h: 5.3
  });
}

slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 7.7, y: 1.5, w: 5.0, h: 5.3,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderLight, width: 1.5 }
});

slide11.addText('TÍNH NĂNG NỔI BẬT KHÁC', {
  x: 8.0, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.primaryBlue, fontFace: 'Segoe UI'
});

slide11.addText([
  { text: '• Trợ lý AutoCare AI: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Tích hợp mô hình ngôn ngữ lớn LLM, giải đáp tức thì ý nghĩa đèn báo lỗi taplo xe (Check Engine, ABS...), tư vấn cách chăm sóc xe.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Dashboard Recharts trực quan: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Biểu đồ tròn cơ cấu chi phí, biểu đồ cột so sánh chi tiêu theo tháng, biểu đồ đường theo dõi kilomet.\n\n', options: { color: COLORS.textMuted } },
  { text: '• Đánh giá Gara & Xuất báo cáo: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Chấm điểm sao 1-5 sao minh bạch uy tín xưởng; Xuất file CSV (UTF-8 BOM) và Hóa đơn sửa chữa.', options: { color: COLORS.textMuted } }
], {
  x: 8.0, y: 2.3, w: 4.4, h: 4.3,
  fontSize: 11, fontFace: 'Segoe UI', lineSpacing: 16
});

// -------------------------------------------------------------
// SLIDE 12: KIỂM THỬ HỆ THỐNG & ĐÁNH GIÁ KẾT QUẢ (TESTING)
// -------------------------------------------------------------
const slide12 = pptx.addSlide();
setSlideBg(slide12, false);
addSlideHeader(slide12, '11. KIỂM THỬ HỆ THỐNG & ĐẢM BẢO CHẤT LƯỢNG', 'Kiểm thử toàn diện chức năng (Black-box), kiểm thử API Postman và kịch bản bất thường');

const testColumns = [
  {
    title: 'Kiểm thử Chức năng (Black-box)',
    color: COLORS.primaryBlue,
    desc: '• 100% Test Scenarios hoàn thành đạt yêu cầu.\n• Xác thực phân quyền 3 Role (User, Garage, Admin) nghiêm ngặt.\n• Chặn truy cập trái phép qua Protected Routes và JWT Guards.'
  },
  {
    title: 'Kiểm thử API & Ràng buộc CSDL',
    color: COLORS.successGreen,
    desc: '• Kiểm tra toàn bộ Endpoints với dữ liệu hợp lệ và biên dị thường.\n• Kiểm tra ràng buộc Unique Biển số xe.\n• Kiểm tra tính toàn vẹn Transaction khi hoàn tất bảo dưỡng.'
  },
  {
    title: 'Kiểm thử Real-time & Ngoại lệ',
    color: COLORS.accentGold,
    desc: '• Đảm bảo độ trễ thông báo WebSockets < 200ms.\n• Xử lý ảnh OCR bị mờ/nghiêng bằng khung chỉnh sửa bù trừ trực tiếp.\n• Kiểm thử gửi Email SMTP khi mất kết nối mạng và phục hồi.'
  }
];

testColumns.forEach((t, i) => {
  const tX = 0.6 + i * 4.05;
  slide12.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: tX, y: 1.6, w: 3.85, h: 5.1,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderLight, width: 1.5 }
  });
  slide12.addShape(pptx.shapes.RECTANGLE, {
    x: tX, y: 1.6, w: 3.85, h: 0.1,
    fill: { color: t.color },
    line: { color: t.color, width: 0 }
  });
  slide12.addText(t.title, {
    x: tX + 0.2, y: 1.9, w: 3.45, h: 0.45,
    fontSize: 13, bold: true, color: t.color, fontFace: 'Segoe UI'
  });
  slide12.addText(t.desc, {
    x: tX + 0.2, y: 2.5, w: 3.45, h: 4.0,
    fontSize: 11.5, color: COLORS.textMuted, fontFace: 'Segoe UI', lineSpacing: 18
  });
});

// -------------------------------------------------------------
// SLIDE 13: KẾT QUẢ ĐẠT ĐƯỢC & ĐÓNG GÓP CỦA ĐỀ TÀI
// -------------------------------------------------------------
const slide13 = pptx.addSlide();
setSlideBg(slide13, false);
addSlideHeader(slide13, '12. KẾT QUẢ ĐẠT ĐƯỢC & ĐÓNG GÓP CỦA ĐỀ TÀI', 'Tổng kết những giá trị thực tiễn và tính ứng dụng nổi bật của hệ thống ACOH');

const achievements = [
  {
    iconTitle: '1. Về mặt Kỹ thuật & Công nghệ',
    color: COLORS.primaryBlue,
    points: [
      'Xây dựng thành công hệ thống Web App Responsive chuẩn Mobile-First bằng ReactJS & NestJS Clean Architecture.',
      'Thiết kế CSDL SQL Server chuẩn hóa quan hệ toàn vẹn, đánh index tối ưu hóa tốc độ truy vấn.',
      'Tích hợp thành công AI OCR Tesseract nhận diện biển số xe thực tế và WebSockets Real-time thông suốt.'
    ]
  },
  {
    iconTitle: '2. Về mặt Nghiệp vụ & Thực tiễn',
    color: COLORS.successGreen,
    points: [
      'Giải quyết triệt để bài toán quên hạn đăng kiểm, bảo hiểm và mốc thay dầu cho chủ phương tiện.',
      'Cung cấp quy trình vận hành dịch vụ gara 4 bước minh bạch, số hóa phiếu kiểm tra và hóa đơn điện tử.',
      'Tạo dựng kênh kết nối trực tiếp, tin cậy giữa chủ xe và hệ thống trạm dịch vụ.'
    ]
  }
];

achievements.forEach((ach, i) => {
  const aY = 1.6 + i * 2.65;
  slide13.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: aY, w: 12.13, h: 2.45,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderLight, width: 1.5 }
  });
  slide13.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: aY, w: 0.1, h: 2.45,
    fill: { color: ach.color },
    line: { color: ach.color, width: 0 }
  });
  slide13.addText(ach.iconTitle, {
    x: 0.9, y: aY + 0.15, w: 11.5, h: 0.35,
    fontSize: 14, bold: true, color: ach.color, fontFace: 'Segoe UI'
  });
  const ptArr = [];
  ach.points.forEach(p => {
    ptArr.push({ text: `• ${p}\n`, options: { color: COLORS.textMuted, fontSize: 11.5 } });
  });
  slide13.addText(ptArr, {
    x: 0.9, y: aY + 0.55, w: 11.5, h: 1.75,
    fontFace: 'Segoe UI', lineSpacing: 16
  });
});

// -------------------------------------------------------------
// SLIDE 14: HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI (ROADMAP)
// -------------------------------------------------------------
const slide14 = pptx.addSlide();
setSlideBg(slide14, false);
addSlideHeader(slide14, '13. ĐỊNH HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI', 'Kế hoạch mở rộng các tính năng thông minh và kết nối phần cứng IoT Telematics');

const futureModules = [
  { num: '01', title: 'Cổng Tin nhắn Zalo ZNS / SMS', desc: 'Gửi cảnh báo trực tiếp qua Zalo OA và Brandname SMS đến số điện thoại chủ xe, đảm bảo không bỏ lỡ thông báo.', color: COLORS.primaryBlue },
  { num: '02', title: 'AI OCR Sổ Đăng Kiểm Tự Động', desc: 'Ứng dụng AI Vision bóc tách toàn bộ thông số kỹ thuật (Số khung VIN, Số máy, Hạn kiểm định) từ ảnh chụp sổ đăng kiểm.', color: COLORS.purple },
  { num: '03', title: 'Kết nối Phần cứng IoT OBD2 / GPS', desc: 'Cắm thiết bị OBD2 tự động đồng bộ số Odometer thực tế và đọc mã lỗi phần cứng xe theo thời gian thực.', color: COLORS.accentGold },
  { num: '04', title: 'Ứng dụng Di động Native App', desc: 'Đóng gói ứng dụng di động trên nền tảng React Native / Flutter cho iOS và Android kèm Push Notification Firebase FCM.', color: COLORS.successGreen }
];

futureModules.forEach((f, i) => {
  const fX = 0.6 + (i % 2) * 6.2;
  const fY = 1.6 + Math.floor(i / 2) * 2.65;
  slide14.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: fX, y: fY, w: 5.93, h: 2.45,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderLight, width: 1.5 }
  });
  slide14.addShape(pptx.shapes.RECTANGLE, {
    x: fX, y: fY, w: 0.1, h: 2.45,
    fill: { color: f.color },
    line: { color: f.color, width: 0 }
  });
  slide14.addText(`MỞ RỘNG ${f.num}: ${f.title}`, {
    x: fX + 0.3, y: fY + 0.2, w: 5.3, h: 0.35,
    fontSize: 13, bold: true, color: f.color, fontFace: 'Segoe UI'
  });
  slide14.addText(f.desc, {
    x: fX + 0.3, y: fY + 0.65, w: 5.3, h: 1.6,
    fontSize: 11.5, color: COLORS.textMuted, fontFace: 'Segoe UI', lineSpacing: 18
  });
});

// -------------------------------------------------------------
// SLIDE 15: LỜI CẢM ƠN & HỎI ĐÁP (Q&A SLIDE - DARK THEME)
// -------------------------------------------------------------
const slide15 = pptx.addSlide();
setSlideBg(slide15, true);

slide15.addShape(pptx.shapes.RECTANGLE, {
  x: 5.66, y: 1.2, w: 2.0, h: 0.08,
  fill: { color: COLORS.accentGold },
  line: { color: COLORS.accentGold, width: 0 }
});

slide15.addText('CHÂN THÀNH CẢM ƠN', {
  x: 0.5, y: 1.5, w: 12.33, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.accentGold,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 2
});

slide15.addText('QUÝ THẦY CÔ TRONG HỘI ĐỒNG', {
  x: 0.5, y: 2.0, w: 12.33, h: 0.9,
  fontSize: 28, bold: true, color: COLORS.white,
  align: 'center', fontFace: 'Segoe UI'
});

slide15.addText('Đã lắng nghe và theo dõi phần trình bày Báo cáo Đồ án Tốt nghiệp!', {
  x: 1.0, y: 3.0, w: 11.33, h: 0.5,
  fontSize: 14, italic: true, color: COLORS.textLight,
  align: 'center', fontFace: 'Segoe UI'
});

slide15.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 3.66, y: 3.9, w: 6.0, h: 2.2,
  fill: { color: COLORS.darkCardBg },
  line: { color: COLORS.accentGold, width: 1.5 }
});

slide15.addText('PHIÊN HỎI ĐÁP & ĐÓNG GÓP Ý KIẾN (Q&A)', {
  x: 3.86, y: 4.1, w: 5.6, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.accentGold,
  align: 'center', fontFace: 'Segoe UI'
});

slide15.addText('Kính mong nhận được những nhận xét, đánh giá và câu hỏi phản biện từ Quý Thầy Cô để nhóm tiếp tục hoàn thiện đề tài.', {
  x: 3.96, y: 4.6, w: 5.4, h: 1.3,
  fontSize: 12, color: COLORS.textLight,
  align: 'center', fontFace: 'Segoe UI', lineSpacing: 18
});

// Xuất file PowerPoint
const outputFile = path.join(__dirname, '..', 'AutoCare_Office_Helper_Graduation_Defense.pptx');
pptx.writeFile({ fileName: outputFile })
  .then(() => {
    console.log(`Defense Presentation successfully generated at: ${outputFile}`);
  })
  .catch(err => {
    console.error('Error generating presentation:', err);
  });
