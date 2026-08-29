const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

// Khởi tạo Presentation Widescreen 16:9
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.title = 'BÁO CÁO ĐỒ ÁN TỐT NGHIỆP - AUTOCARE OFFICE HELPER (ACOH)';
pptx.subject = 'Hệ thống Quản lý Lịch Đăng kiểm, Bảo dưỡng và Bảo hiểm Phương tiện Thông minh';
pptx.author = 'Sinh viên thực hiện Đồ án';
pptx.company = 'Hội đồng Chấm Bảo vệ Đồ án Tốt nghiệp';

// =========================================================================
// BẢNG MÀU PREMIUM TECH (CYBER DARK & GLASSMORPHISM AESTHETICS)
// =========================================================================
const PALETTE = {
  bgDeep: '0A0E17',        // Deep Space Navy (Nền chính cực sang)
  cardBg: '121B2B',        // Dark Glass Card
  cardInnerBg: '182438',   // Inner Highlight Card
  cardLightBg: '1E293B',   // Slate 800 Card
  borderGlow: '1E3A8A',    // Deep Blue Border Glow
  borderCyan: '06B6D4',    // Cyber Cyan Border
  borderSky: '38BDF8',     // Sky Blue Accent
  borderSlate: '334155',   // Subtle Slate Border
  
  textWhite: 'FFFFFF',     // Pure White
  textMuted: '94A3B8',     // Slate 400 (Phụ đề)
  textBody: 'E2E8F0',      // Slate 200 (Nội dung chính dễ đọc)
  textCyan: '38BDF8',      // Sky Glow
  textGold: 'FBBF24',      // Amber Gold
  textGreen: '34D399',     // Emerald Green
  textRed: 'F87171',       // Soft Red Alert
  
  accentBlue: '2563EB',    // Blue 600
  accentSky: '0284C7',     // Sky 600
  accentCyan: '06B6D4',    // Cyan 500
  accentGold: 'F59E0B',    // Amber 500
  accentEmerald: '10B981', // Emerald 500
  accentPurple: '8B5CF6',  // Violet 500
  accentRed: 'EF4444'      // Red 500
};

// =========================================================================
// HELPER: TẠO HEADER CHUẨN XỊN (TECH CATEGORY BADGE + TITLE + DECORATION)
// =========================================================================
function renderSlideHeader(slide, categoryStr, titleStr, subtitleStr, slideIndex, totalSlides = 16) {
  // Nền slide
  slide.background = { fill: PALETTE.bgDeep };

  // Top Glowing Accent Line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.0, y: 0.0, w: 13.33, h: 0.06,
    fill: { color: PALETTE.accentCyan },
    line: { color: PALETTE.accentCyan, width: 0 }
  });

  // Category Pill Badge (VD: ✦ 01. BỐI CẢNH & TÍNH CẤP THIẾT)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 0.28, w: 2.8, h: 0.32,
    fill: { color: '172554' }, // Deep Blue Pill
    line: { color: PALETTE.borderCyan, width: 1 }
  });
  slide.addText(`✦ ${categoryStr}`, {
    x: 0.6, y: 0.28, w: 2.8, h: 0.32,
    fontSize: 9.5, bold: true, color: PALETTE.textCyan,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  // Slide Title
  slide.addText(titleStr, {
    x: 3.55, y: 0.22, w: 7.8, h: 0.42,
    fontSize: 18, bold: true, color: PALETTE.textWhite,
    fontFace: 'Segoe UI', valign: 'middle'
  });

  // Slide Subtitle
  slide.addText(subtitleStr, {
    x: 0.6, y: 0.64, w: 10.8, h: 0.28,
    fontSize: 11, italic: true, color: PALETTE.textMuted,
    fontFace: 'Segoe UI'
  });

  // Slide Counter Badge góc phải
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 11.6, y: 0.28, w: 1.13, h: 0.32,
    fill: { color: PALETTE.cardBg },
    line: { color: PALETTE.borderSlate, width: 1 }
  });
  slide.addText(`${slideIndex}/${totalSlides}`, {
    x: 11.6, y: 0.28, w: 1.13, h: 0.32,
    fontSize: 10, bold: true, color: PALETTE.textGold,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  // Bottom Footer Bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 7.15, w: 12.13, h: 0.02,
    fill: { color: PALETTE.borderSlate },
    line: { color: PALETTE.borderSlate, width: 0 }
  });
  slide.addText('AUTOCARE OFFICE HELPER (ACOH) — BÁO CÁO ĐỒ ÁN TỐT NGHIỆP CÔNG NGHỆ THÔNG TIN', {
    x: 0.6, y: 7.18, w: 8.0, h: 0.25,
    fontSize: 8.5, color: '64748B', fontFace: 'Segoe UI'
  });
  slide.addText('HỆ THỐNG QUẢN LÝ LỊCH ĐĂNG KIỂM & BẢO DƯỠNG XE THÔNG MINH', {
    x: 8.6, y: 7.18, w: 4.13, h: 0.25,
    fontSize: 8.5, color: '64748B', align: 'right', fontFace: 'Segoe UI'
  });
}

// Helper đóng khung Card công nghệ
function drawTechCard(slide, x, y, w, h, borderColor = PALETTE.borderSlate, fillColor = PALETTE.cardBg) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: borderColor, width: 1.5 }
  });
}

// Helper đóng khung và nhúng Ảnh
function drawFramedImage(slide, imagePath, x, y, w, h, label = '') {
  drawTechCard(slide, x, y, w, h, PALETTE.borderCyan, PALETTE.cardBg);
  if (fs.existsSync(imagePath)) {
    slide.addImage({
      path: imagePath,
      x: x + 0.08, y: y + 0.08, w: w - 0.16, h: h - (label ? 0.42 : 0.16)
    });
  }
  if (label) {
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.08, y: y + h - 0.36, w: w - 0.16, h: 0.28,
      fill: { color: '0F172A' },
      line: { color: PALETTE.borderSlate, width: 0 }
    });
    slide.addText(label, {
      x: x + 0.08, y: y + h - 0.36, w: w - 0.16, h: 0.28,
      fontSize: 9.5, bold: true, color: PALETTE.textCyan,
      align: 'center', valign: 'middle', fontFace: 'Segoe UI'
    });
  }
}


// =========================================================================
// SLIDE 1: TRANG BÌA ĐỈNH CAO (HIGH-TECH HERO COVER)
// =========================================================================
const slide1 = pptx.addSlide();
slide1.background = { fill: PALETTE.bgDeep };

// Top Glowing Gradient Accent
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 13.33, h: 0.08,
  fill: { color: PALETTE.accentCyan }, line: { color: PALETTE.accentCyan, width: 0 }
});

// Category Badge
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 4.16, y: 0.75, w: 5.0, h: 0.4,
  fill: { color: '172554' },
  line: { color: PALETTE.borderCyan, width: 1.5 }
});
slide1.addText('✦ BÁO CÁO BẢO VỆ ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC ✦', {
  x: 4.16, y: 0.75, w: 5.0, h: 0.4,
  fontSize: 11, bold: true, color: PALETTE.textCyan,
  align: 'center', valign: 'middle', fontFace: 'Segoe UI', characterSpacing: 1
});

// Main Super Title
slide1.addText('AUTOCARE OFFICE HELPER', {
  x: 0.5, y: 1.35, w: 12.33, h: 0.9,
  fontSize: 34, bold: true, color: PALETTE.textWhite,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 1.5
});

// Sub-banner with glow
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 1.5, y: 2.35, w: 10.33, h: 0.65,
  fill: { color: PALETTE.cardBg },
  line: { color: PALETTE.borderSky, width: 1.5 }
});
slide1.addText('HỆ THỐNG SỐ HÓA & QUẢN LÝ LỊCH ĐĂNG KIỂM, BẢO DƯỠNG, BẢO HIỂM PHƯƠNG TIỆN', {
  x: 1.6, y: 2.35, w: 10.13, h: 0.65,
  fontSize: 14, bold: true, color: PALETTE.textGold,
  align: 'center', valign: 'middle', fontFace: 'Segoe UI'
});

// 3 Metric Badges
const heroMetrics = [
  { val: 'CLEAN ARCHITECTURE', sub: 'NestJS + ReactJS + SQL Server', color: PALETTE.accentSky },
  { val: 'CRON JOB 00:00', sub: 'Real-time WebSocket & Email Push', color: PALETTE.accentEmerald },
  { val: 'AI OCR & LLM CHATBOT', sub: 'Tesseract WebCam & Gemini API', color: PALETTE.accentPurple }
];

heroMetrics.forEach((m, idx) => {
  const mX = 1.0 + idx * 3.9;
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: mX, y: 3.25, w: 3.53, h: 0.95,
    fill: { color: PALETTE.cardInnerBg },
    line: { color: m.color, width: 1.5 }
  });
  slide1.addText(m.val, {
    x: mX, y: 3.32, w: 3.53, h: 0.42,
    fontSize: 11.5, bold: true, color: m.color,
    align: 'center', fontFace: 'Segoe UI'
  });
  slide1.addText(m.sub, {
    x: mX, y: 3.74, w: 3.53, h: 0.38,
    fontSize: 9.5, color: PALETTE.textMuted,
    align: 'center', fontFace: 'Segoe UI'
  });
});

// Bottom Info Container Card
drawTechCard(slide1, 1.8, 4.45, 9.73, 2.3, PALETTE.borderCyan, PALETTE.cardBg);

// Left Column: GVHD
slide1.addText([
  { text: 'GIẢNG VIÊN HƯỚNG DẪN\n', options: { bold: true, color: PALETTE.textGold, fontSize: 11 } },
  { text: 'ThS. / TS. [Họ và Tên GVHD]\n', options: { bold: true, fontSize: 14, color: PALETTE.textWhite } },
  { text: 'Khoa Công nghệ Thông tin / Kỹ thuật Phần mềm\nTrường Đại học [Tên Trường]', options: { fontSize: 11, color: PALETTE.textMuted } }
], {
  x: 2.2, y: 4.65, w: 4.4, h: 1.9,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 20
});

// Vertical Divider Line
slide1.addShape(pptx.shapes.LINE, {
  x: 6.66, y: 4.75, w: 0, h: 1.7,
  line: { color: PALETTE.borderSlate, width: 1.5 }
});

// Right Column: Sinh viên
slide1.addText([
  { text: 'SINH VIÊN THỰC HIỆN\n', options: { bold: true, color: PALETTE.textCyan, fontSize: 11 } },
  { text: '1. [Họ và Tên Sinh Viên] (MSSV: ...)\n', options: { bold: true, fontSize: 13.5, color: PALETTE.textWhite } },
  { text: 'Chuyên ngành: Kỹ thuật Phần mềm\n', options: { fontSize: 11, color: PALETTE.textBody } },
  { text: 'Khóa / Niên khóa: 2022 - 2026', options: { fontSize: 10.5, color: PALETTE.textMuted } }
], {
  x: 7.0, y: 4.65, w: 4.2, h: 1.9,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 20
});


// =========================================================================
// SLIDE 2: BỐI CẢNH & TÍNH CẤP THIẾT (3 THỰC TRẠNG LỚN)
// =========================================================================
const slide2 = pptx.addSlide();
renderSlideHeader(slide2, '01. BỐI CẢNH & ĐẶT VẤN ĐỀ', 'BỐI CẢNH THỰC TẾ VÀ TÍNH CẤP THIẾT CỦA ĐỀ TÀI', 'Thực trạng quản lý phương tiện cơ giới tại Việt Nam và những nút thắt cần giải quyết', 2);

const problems = [
  {
    num: '01',
    badge: 'RỦI RO PHÁP LÝ & AN TOÀN',
    color: PALETTE.accentRed,
    title: 'Quên Mốc Đăng Kiểm & Bảo Dưỡng',
    desc: '• Chủ xe cá nhân & văn phòng bận rộn thường quên chu kỳ kiểm định kỹ thuật (đăng kiểm) và hạn bảo hiểm bắt buộc TNDS.\n• Mức xử phạt hành chính rất nặng từ 4 - 16 triệu đồng kèm nguy cơ tước GPLX.\n• Bỏ quên chu kỳ thay nhớt/phụ tùng gây hỏng hóc động cơ nghiêm trọng.'
  },
  {
    num: '02',
    badge: 'QUẢN TRỊ THỦ CÔNG RỜI RẠC',
    color: PALETTE.accentGold,
    title: 'Thiếu Công Cụ Giám Sát Chi Phí',
    desc: '• Sổ sách ghi chép bằng tay hoặc giữ hóa đơn giấy dễ thất lạc, không nắm được tổng chi phí sở hữu xe (TCO).\n• Khó theo dõi số kilomet (Odometer) thực tế cho nhiều xe cùng lúc.\n• Bất cập trong quản lý đội xe chạy dịch vụ (Grab, Taxi, Hợp tác xã).'
  },
  {
    num: '03',
    badge: 'GARA THIẾU KÊNH KỸ THUẬT SỐ',
    color: PALETTE.accentSky,
    title: 'Quy Trình Dịch Vụ Chưa Minh Bạch',
    desc: '• Tiếp nhận xe thủ công qua điện thoại gây quá tải và trễ hẹn giờ cao điểm.\n• Chưa có quy trình báo giá điện tử và nghiệm thu 4 bước khép kín.\n• Thiếu sổ nhật ký bảo dưỡng điện tử liên thông giữa khách hàng và xưởng.'
  }
];

problems.forEach((p, idx) => {
  const pX = 0.6 + idx * 4.05;
  drawTechCard(slide2, pX, 1.15, 3.85, 5.75, p.color, PALETTE.cardBg);

  // Top header indicator
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: pX + 0.2, y: 1.35, w: 3.45, h: 0.35,
    fill: { color: '0F172A' },
    line: { color: p.color, width: 1 }
  });
  slide2.addText(p.badge, {
    x: pX + 0.2, y: 1.35, w: 3.45, h: 0.35,
    fontSize: 9, bold: true, color: p.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  // Title
  slide2.addText(p.title, {
    x: pX + 0.2, y: 1.8, w: 3.45, h: 0.65,
    fontSize: 14, bold: true, color: PALETTE.textWhite,
    fontFace: 'Segoe UI', valign: 'middle'
  });

  // Divider
  slide2.addShape(pptx.shapes.LINE, {
    x: pX + 0.2, y: 2.5, w: 3.45, h: 0,
    line: { color: PALETTE.borderSlate, width: 1 }
  });

  // Content
  slide2.addText(p.desc, {
    x: pX + 0.2, y: 2.65, w: 3.45, h: 4.0,
    fontSize: 11, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// =========================================================================
// SLIDE 3: MỤC TIÊU & MÔ HÌNH USE CASE TỔNG QUÁT (RBAC)
// =========================================================================
const slide3 = pptx.addSlide();
renderSlideHeader(slide3, '02. MỤC TIÊU & TÁC NHÂN HỆ THỐNG', 'MỤC TIÊU ĐỀ TÀI & PHÂN QUYỀN ĐA VAI TRÒ (RBAC)', 'Số hóa toàn diện sự phối hợp giữa Chủ xe (User), Xưởng dịch vụ (Garage) và Quản trị viên (Admin)', 3);

// Left: Use Case Image
const imgUseCase = path.join(__dirname, '..', 'hinh_3_1_use_case_tong_quat.png');
drawFramedImage(slide3, imgUseCase, 0.6, 1.15, 6.8, 5.75, 'SƠ ĐỒ USE CASE TỔNG QUÁT HỆ THỐNG ACOH');

// Right: 3 Roles details
const rolesData = [
  {
    role: 'CHỦ XE (USER)',
    badge: 'ROLE: USER',
    color: PALETTE.accentSky,
    desc: '• Quản lý ô tô / xe máy & xe chạy dịch vụ (HTX, Phù hiệu).\n• Nhận cảnh báo đa kênh Real-time Socket.IO & Email SMTP.\n• Đặt lịch hẹn xưởng, duyệt báo giá điện tử, hỏi đáp AI Chatbot.'
  },
  {
    role: 'XƯỞNG DỊCH VỤ (GARAGE)',
    badge: 'ROLE: GARAGE',
    color: PALETTE.accentGold,
    desc: '• Tiếp nhận xe bằng AI OCR quét biển số qua WebCam.\n• Tích chọn checklist mốc km, lập báo giá điện tử.\n• Cập nhật sổ bảo dưỡng điện tử, xuất hóa đơn chi tiết.'
  },
  {
    role: 'QUẢN TRỊ VIÊN (ADMIN)',
    badge: 'ROLE: ADMIN',
    color: PALETTE.accentPurple,
    desc: '• Quản lý người dùng, phân quyền bảo mật RBAC nghiêm ngặt.\n• Kiểm duyệt gara đối tác liên kết tham gia mạng lưới.\n• Giám sát Dashboard doanh thu và tăng trưởng toàn hệ thống.'
  }
];

rolesData.forEach((r, idx) => {
  const rY = 1.15 + idx * 1.95;
  drawTechCard(slide3, 7.6, rY, 5.13, 1.85, r.color, PALETTE.cardBg);

  slide3.addText(r.role, {
    x: 7.8, y: rY + 0.15, w: 3.2, h: 0.35,
    fontSize: 12, bold: true, color: r.color, fontFace: 'Segoe UI'
  });
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 11.2, y: rY + 0.15, w: 1.3, h: 0.28,
    fill: { color: '0F172A' }, line: { color: r.color, width: 1 }
  });
  slide3.addText(r.badge, {
    x: 11.2, y: rY + 0.15, w: 1.3, h: 0.28,
    fontSize: 8.5, bold: true, color: r.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  slide3.addText(r.desc, {
    x: 7.8, y: rY + 0.55, w: 4.7, h: 1.2,
    fontSize: 10, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 15
  });
});


// =========================================================================
// SLIDE 4: KIẾN TRÚC CLEAN ARCHITECTURE & TECH STACK
// =========================================================================
const slide4 = pptx.addSlide();
renderSlideHeader(slide4, '03. KIẾN TRÚC HỆ THỐNG', 'KIẾN TRÚC CLEAN ARCHITECTURE & CÔNG NGHỆ (TECH STACK)', 'Mô hình 3 lớp phân tách Controller - Service - Data Layer đảm bảo hiệu năng và tính mở rộng cao', 4);

// Left: Architecture Image
const imgCleanArch = path.join(__dirname, '..', 'hinh_2_1_clean_architecture.png');
drawFramedImage(slide4, imgCleanArch, 0.6, 1.15, 6.8, 5.75, 'MÔ HÌNH CLEAN ARCHITECTURE 3 TẦNG ĐỘC LẬP');

// Right: Tech Stack details
const techCards = [
  {
    layer: 'FRONT-END (CLIENT LAYER)',
    color: PALETTE.accentSky,
    items: '• ReactJS (Vite Build Tool) — Tối ưu tốc độ tải trang cực nhanh\n• TailwindCSS & Shadcn/ui — UI/UX Mobile-First Responsive\n• Socket.IO Client & Recharts — Nhận thông báo tức thì & Biểu đồ trực quan'
  },
  {
    layer: 'BACK-END (APPLICATION LAYER)',
    color: PALETTE.accentEmerald,
    items: '• NestJS Framework (TypeScript) — Kiến trúc Module hóa chuẩn Clean Arch\n• JWT Auth & BCrypt — Bảo mật phân quyền RBAC & mã hóa một chiều\n• Nodemailer SMTP & Cron Task Scheduling — Tự động quét gửi mail'
  },
  {
    layer: 'DATABASE & AI ENGINE',
    color: PALETTE.accentPurple,
    items: '• MS SQL Server 2014+ — Chuẩn hóa 3NF, Non-clustered Indexes\n• Tesseract.js Engine — AI OCR nhận diện biển số trực tiếp qua WebCam\n• Google Generative AI (LLM) — Trợ lý ảo tư vấn bảo dưỡng thông minh'
  }
];

techCards.forEach((tc, idx) => {
  const tY = 1.15 + idx * 1.95;
  drawTechCard(slide4, 7.6, tY, 5.13, 1.85, tc.color, PALETTE.cardBg);

  slide4.addText(tc.layer, {
    x: 7.8, y: tY + 0.15, w: 4.7, h: 0.35,
    fontSize: 11.5, bold: true, color: tc.color, fontFace: 'Segoe UI'
  });
  slide4.addText(tc.items, {
    x: 7.8, y: tY + 0.55, w: 4.7, h: 1.2,
    fontSize: 10, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 15
  });
});


// =========================================================================
// SLIDE 5: THIẾT KẾ CƠ SỞ DỮ LIỆU & MÔ HÌNH ERD (11 BẢNG CHUẨN)
// =========================================================================
const slide5 = pptx.addSlide();
renderSlideHeader(slide5, '04. CƠ SỞ DỮ LIỆU', 'MÔ HÌNH THỰC THỂ LIÊN KẾT (ERD) & CƠ SỞ DỮ LIỆU', '11 bảng dữ liệu quan hệ toàn vẹn, tối ưu hóa Index truy vấn và bảo đảm tính toàn vẹn Transaction', 5);

// Left: ERD Image
const imgERD = path.join(__dirname, '..', 'hinh_3_3_mo_hinh_erd.png');
drawFramedImage(slide5, imgERD, 0.6, 1.15, 7.2, 5.75, 'SƠ ĐỒ CƠ SỞ DỮ LIỆU QUAN HỆ 11 BẢNG (MS SQL SERVER)');

// Right: Database Core Highlights
drawTechCard(slide5, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide5.addText('CẤU TRÚC 11 THỰC THỂ CỐT LÕI', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 12.5, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const dbEntitiesList = [
  { name: 'Users', desc: 'Định danh, mật khẩu BCrypt, Role (User, Garage, Admin)' },
  { name: 'Vehicles', desc: 'Ô tô/xe máy, Odometer, Biển số Unique, Xe dịch vụ (HTX)' },
  { name: 'LegalDocuments', desc: 'Sổ Đăng kiểm, Bảo hiểm TNDS, Bằng lái (3 cấp độ màu)' },
  { name: 'MaintenanceCategories', desc: 'Ma trận gói mốc kilomet chuẩn (5k, 10k, 20k, 40k...)' },
  { name: 'MaintenanceSchedules', desc: 'Lịch nhắc bảo dưỡng theo km hoặc thời gian thực tế' },
  { name: 'MaintenanceHistory', desc: 'Sổ nhật ký điện tử ghi vết vật tư thay thế & chi phí' },
  { name: 'Garages & Appointments', desc: 'Mạng lưới xưởng dịch vụ & Đặt lịch hẹn trực tuyến' },
  { name: 'Notifications & Payments', desc: 'Lưu trữ thông báo đẩy đa kênh & Giao dịch thanh toán' }
];

let dbTxtY = 1.75;
dbEntitiesList.forEach((e) => {
  slide5.addText([
    { text: `● ${e.name}: `, options: { bold: true, color: PALETTE.textGold, fontSize: 10 } },
    { text: `${e.desc}\n`, options: { color: PALETTE.textBody, fontSize: 9.5 } }
  ], {
    x: 8.2, y: dbTxtY, w: 4.3, h: 0.45,
    fontFace: 'Segoe UI', lineSpacing: 13
  });
  dbTxtY += 0.45;
});

// Highlight Transaction Box
slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 8.2, y: 5.55, w: 4.33, h: 1.15,
  fill: { color: '172554' },
  line: { color: PALETTE.borderSky, width: 1 }
});
slide5.addText('⚡ TÍNH TOÀN VẸN TRANSACTION (ACID):\nKhi hoàn tất đơn bảo dưỡng: Tự động cập nhật Odometer xe, ghi Sổ lịch sử, đóng Lịch nhắc và phát thông báo Real-time đồng thời.', {
  x: 8.3, y: 5.6, w: 4.13, h: 1.05,
  fontSize: 9.5, color: PALETTE.textWhite, fontFace: 'Segoe UI', lineSpacing: 14
});


// =========================================================================
// SLIDE 6: MODULE 1, 2 - QUẢN LÝ PHƯƠNG TIỆN & ĐỘI XE THƯƠNG MẠI
// =========================================================================
const slide6 = pptx.addSlide();
renderSlideHeader(slide6, '05. PHÂN HỆ PHƯƠNG TIỆN', 'QUẢN LÝ PHƯƠNG TIỆN ĐA DẠNG & XE CHẠY DỊCH VỤ', 'Quản lý tập trung ô tô, xe máy và phân hệ quản lý chuyên biệt cho xe chạy dịch vụ (Grab, Taxi, HTX)', 6);

const imgVehicles = path.join(__dirname, '..', 'hinh_4_2_quan_ly_phuong_tien.png');
drawFramedImage(slide6, imgVehicles, 0.6, 1.15, 7.2, 5.75, 'GIAO DIỆN QUẢN LÝ PHƯƠNG TIỆN & CẬP NHẬT NHANH ODOMETER');

drawTechCard(slide6, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide6.addText('TÍNH NĂNG NGHIỆP VỤ NỔI BẬT', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const vehicleFeatures = [
  {
    title: '1. Quản lý đa phương tiện',
    desc: 'Quản lý không giới hạn số lượng Ô tô và Xe máy trên một tài khoản. Ràng buộc Unique Biển số xe toàn hệ thống.'
  },
  {
    title: '2. Phân hệ Xe chạy Dịch vụ (Fleet)',
    desc: 'Bổ sung quản lý Mã Hợp tác xã (HTX) và Số Phù hiệu xe cho tài xế công nghệ (Grab, Be, Taxi) theo luật GTVT Việt Nam.'
  },
  {
    title: '3. Cập nhật nhanh Odometer',
    desc: 'Popup cập nhật kilomet hàng ngày/tuần. Validation logic chặt chẽ: Chặn tuyệt đối nhập số Odometer mới < số Odometer cũ.'
  },
  {
    title: '4. Tự động sinh Lịch bảo dưỡng mẫu',
    desc: 'Khi tạo xe mới, hệ thống tự động sinh trọn bộ lịch nhắc bảo dưỡng tiêu chuẩn (+5.000km, +10.000km, +40.000km).'
  }
];

let vY = 1.8;
vehicleFeatures.forEach(vf => {
  slide6.addText(vf.title, {
    x: 8.2, y: vY, w: 4.3, h: 0.3,
    fontSize: 11, bold: true, color: PALETTE.textGold, fontFace: 'Segoe UI'
  });
  slide6.addText(vf.desc, {
    x: 8.2, y: vY + 0.3, w: 4.3, h: 0.7,
    fontSize: 10, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  vY += 1.05;
});


// =========================================================================
// SLIDE 7: MODULE 4 - HỒ SƠ PHÁP LÝ & CẢNH BÁO ĐĂNG KIỂM 3 CẤP ĐỘ
// =========================================================================
const slide7 = pptx.addSlide();
renderSlideHeader(slide7, '06. HỒ SƠ PHÁP LÝ', 'HỒ SƠ PHÁP LÝ, CHU KỲ ĐĂNG KIỂM & BẢO HIỂM', 'Cơ chế động cơ tính toán ngày đếm ngược và phân loại màu sắc cảnh báo an toàn 3 cấp độ', 7);

const imgLegal = path.join(__dirname, '..', 'hinh_4_3_ho_so_phap_ly_dang_kiem.png');
drawFramedImage(slide7, imgLegal, 0.6, 1.15, 7.2, 5.75, 'DANH SÁCH GIẤY TỜ & CHU KỲ ĐĂNG KIỂM THEO THỜI GIAN THỰC');

drawTechCard(slide7, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide7.addText('CƠ CHẾ CẢNH BÁO 3 CẤP ĐỘ', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const alertLevels = [
  {
    badge: '🟢 MÃ MÀU XANH — CÒN HẠN AN TOÀN',
    color: PALETTE.accentEmerald,
    desc: 'Thời gian hiệu lực còn > 30 ngày. Phương tiện đủ điều kiện lưu thông hợp pháp trên đường.'
  },
  {
    badge: '🟠 MÃ MÀU CAM — CẢNH BÁO SẮP HẾT HẠN',
    color: PALETTE.accentGold,
    desc: 'Thời gian hiệu lực còn <= 30 ngày. Hệ thống bắt đầu kích hoạt cảnh báo nhắc nhở chủ xe chuẩn bị gia hạn.'
  },
  {
    badge: '🔴 MÃ MÀU ĐỎ — NGUY CẤP: ĐÃ QUÁ HẠN',
    color: PALETTE.accentRed,
    desc: 'Thời gian hiệu lực < 0 ngày (đã quá hạn). Báo động đỏ nguy cơ bị xử phạt vi phạm hành chính nặng.'
  }
];

let alY = 1.85;
alertLevels.forEach(al => {
  slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.2, y: alY, w: 4.33, h: 0.32,
    fill: '0F172A', line: { color: al.color, width: 1 }
  });
  slide7.addText(al.badge, {
    x: 8.2, y: alY, w: 4.33, h: 0.32,
    fontSize: 9, bold: true, color: al.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });
  slide7.addText(al.desc, {
    x: 8.2, y: alY + 0.38, w: 4.33, h: 0.65,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  alY += 1.15;
});

// Query Tech Note
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 8.2, y: 5.4, w: 4.33, h: 1.3,
  fill: '172554', line: { color: PALETTE.borderSky, width: 1 }
});
slide7.addText('⚙ THUẬT TOÁN ĐẾM NGƯỢC THỜI GIAN THỰC:\nSử dụng hàm SQL DATEDIFF(day, GETDATE(), ExpiryDate) tính toán chính xác số ngày còn lại theo thời gian thực mỗi khi mở ứng dụng.', {
  x: 8.3, y: 5.45, w: 4.13, h: 1.2,
  fontSize: 9.5, color: PALETTE.textWhite, fontFace: 'Segoe UI', lineSpacing: 14
});


// =========================================================================
// SLIDE 8: MODULE 3, 5 - MA TRẬN BẢO DƯỠNG & CRON ENGINE QUÉT NGẦM
// =========================================================================
const slide8 = pptx.addSlide();
renderSlideHeader(slide8, '07. BẢO DƯỠNG & CẢNH BÁO', 'MA TRẬN MỐC BẢO DƯỠNG & ĐỘNG CƠ CRON JOB 00:00', 'Chuẩn hóa quy trình kỹ thuật ô tô và tự động hóa khâu giám sát bằng tác vụ quét ngầm định kỳ', 8);

const imgMatrix = path.join(__dirname, '..', 'hinh_4_4_ma_tran_bao_duong_gara.png');
drawFramedImage(slide8, imgMatrix, 0.6, 1.15, 7.2, 5.75, 'MA TRẬN CÁC GÓI MỐC BẢO DƯỠNG KM & TIẾN TRÌNH XE');

drawTechCard(slide8, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide8.addText('ĐẶC TẢ MA TRẬN & CRON ENGINE', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const cronFeatures = [
  {
    title: 'Gói mốc Km chuẩn hóa:',
    desc: '• 5.000 km: Thay dầu động cơ, vệ sinh lọc gió.\n• 10.000 km: Thay lọc dầu, đảo lốp, kiểm tra phanh.\n• 20.000 km: Thay lọc gió động cơ & máy lạnh.\n• 40.000 km: Thay dầu số, bugi, nước làm mát.'
  },
  {
    title: 'Cron Job quét ngầm (@Cron 00:00):',
    desc: 'Tự động rà soát hạn giấy tờ và mốc kilomet chênh lệch (TargetOdometer - CurrentOdometer <= 500 km) mỗi đêm lúc 00:00.'
  },
  {
    title: 'Hạ tầng thông báo đa kênh:',
    desc: 'Phát tín hiệu Real-time WebSockets lên màn hình kết hợp gửi Email HTML qua Nodemailer SMTP.'
  }
];

let cY = 1.8;
cronFeatures.forEach(cf => {
  slide8.addText(cf.title, {
    x: 8.2, y: cY, w: 4.3, h: 0.3,
    fontSize: 10.5, bold: true, color: PALETTE.textGold, fontFace: 'Segoe UI'
  });
  slide8.addText(cf.desc, {
    x: 8.2, y: cY + 0.3, w: 4.3, h: 0.95,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  cY += 1.3;
});


// =========================================================================
// SLIDE 9: MODULE 6, 10 - QUY TRÌNH DỊCH VỤ GARA KHÉP KÍN 4 BƯỚC
// =========================================================================
const slide9 = pptx.addSlide();
renderSlideHeader(slide9, '08. QUY TRÌNH GARA 4 BƯỚC', 'QUY TRÌNH VẬN HÀNH DỊCH VỤ BẢO DƯỠNG GARA 4 BƯỚC', 'Số hóa toàn diện sự phối hợp giữa Khách hàng - Lễ tân - Kỹ thuật viên Gara', 9);

const imgWarning = path.join(__dirname, '..', 'hinh_4_5_dong_co_canh_bao_dat_lich.png');
drawFramedImage(slide9, imgWarning, 0.6, 1.15, 7.2, 5.75, 'QUY TRÌNH ĐẶT LỊCH HẸN TRỰC TUYẾN & TIẾP NHẬN XƯỞNG');

drawTechCard(slide9, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide9.addText('4 BƯỚC DỊCH VỤ KHÉP KÍN', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const garageSteps = [
  { step: 'BƯỚC 1: TIẾP NHẬN & ĐỊNH DANH', color: PALETTE.accentSky, desc: 'Quét biển số xe bằng WebCam AI OCR, tự động truy xuất hồ sơ xe và lịch sử sửa chữa cũ.' },
  { step: 'BƯỚC 2: KIỂM TRA & LÊN PHƯƠNG ÁN', color: PALETTE.accentEmerald, desc: 'Kỹ thuật viên kiểm tra xe thực tế, tích chọn checklist mốc km (vật tư phụ tùng cần thay).' },
  { step: 'BƯỚC 3: BÁO GIÁ & XÁC NHẬN', color: PALETTE.accentGold, desc: 'Lập báo giá điện tử (phụ tùng + tiền công + VAT), khách hàng duyệt online trực tiếp trên app.' },
  { step: 'BƯỚC 4: THI CÔNG & NGHIỆM THU', color: PALETTE.accentPurple, desc: 'Thi công, nghiệm thu, xuất hóa đơn điện tử và tự động cập nhật Sổ nhật ký bảo dưỡng xe.' }
];

let gsY = 1.8;
garageSteps.forEach(gs => {
  slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.2, y: gsY, w: 4.33, h: 0.28,
    fill: '0F172A', line: { color: gs.color, width: 1 }
  });
  slide9.addText(gs.step, {
    x: 8.2, y: gsY, w: 4.33, h: 0.28,
    fontSize: 9, bold: true, color: gs.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });
  slide9.addText(gs.desc, {
    x: 8.2, y: gsY + 0.32, w: 4.33, h: 0.65,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  gsY += 1.1;
});


// =========================================================================
// SLIDE 10: MODULE 9 - ĐỘT PHÁ CÔNG NGHỆ: AI OCR QUÉT BIỂN SỐ XE WEBCAM
// =========================================================================
const slide10 = pptx.addSlide();
renderSlideHeader(slide10, '09. ĐỘT PHÁ AI OCR', 'ĐỘT PHÁ CÔNG NGHỆ: AI OCR QUÉT BIỂN SỐ XE WEBCAM', 'Ứng dụng Tesseract.js OCR & Regex nhận diện biển số xe ô tô thực tế 100% không dùng mock data', 10);

const imgOCR = path.join(__dirname, '..', 'hinh_4_3_ai_ocr_so_dang_kiem.png');
drawFramedImage(slide10, imgOCR, 0.6, 1.15, 7.2, 5.75, 'LUỒNG NHẬN DIỆN BIỂN SỐ Ô TÔ THỰC TẾ QUA WEBCAM & CAMERA');

drawTechCard(slide10, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide10.addText('CƠ CHẾ AI OCR THỰC TẾ', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const ocrHighlights = [
  {
    title: '• Xử lý AI thực tế 100%:',
    desc: 'Tích hợp Tesseract.js engine bóc tách trực tiếp chuỗi ký tự từ luồng video WebCam hoặc tệp ảnh chụp thực tế.'
  },
  {
    title: '• Bộ lọc Regex biển số Việt Nam:',
    desc: 'Thuật toán Regular Expression chuẩn hóa định dạng biển 1 dòng và 2 dòng (VD: 30G-567.89, 51K-123.45).'
  },
  {
    title: '• Tiết kiệm 90% thời gian nhập liệu:',
    desc: 'Truy xuất ngay hồ sơ phương tiện trong CSDL chỉ sau 1 click, loại bỏ hoàn toàn sai sót chính tả do gõ tay.'
  },
  {
    title: '• Khung kết quả Editable:',
    desc: 'Cho phép nhân viên tiếp tân rà soát và hiệu chỉnh nhanh nếu ảnh chụp bị mờ hoặc góc chụp bị khuất sáng.'
  }
];

let oY = 1.8;
ocrHighlights.forEach(oh => {
  slide10.addText(oh.title, {
    x: 8.2, y: oY, w: 4.3, h: 0.28,
    fontSize: 10.5, bold: true, color: PALETTE.textGold, fontFace: 'Segoe UI'
  });
  slide10.addText(oh.desc, {
    x: 8.2, y: oY + 0.28, w: 4.3, h: 0.72,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  oY += 1.05;
});


// =========================================================================
// SLIDE 11: MODULE 7, 8 - TRỢ LÝ AI CHATBOT & DASHBOARD ANALYTICS
// =========================================================================
const slide11 = pptx.addSlide();
renderSlideHeader(slide11, '10. AI CHATBOT & DASHBOARD', 'TRỢ LÝ ẢO AUTOCARE AI & THỐNG KÊ DASHBOARD TRỰC QUAN', 'Tích hợp LLM tư vấn kỹ thuật xe và hệ thống biểu đồ Recharts phân tích tài chính phương tiện', 11);

const imgChatbot = path.join(__dirname, '..', 'hinh_4_6_ai_chatbot_analytics.png');
drawFramedImage(slide11, imgChatbot, 0.6, 1.15, 7.2, 5.75, 'TRỢ LÝ ẢO AUTOCARE AI & BIỂU ĐỒ RECHARTS THỐNG KÊ CHI TIÊU');

drawTechCard(slide11, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide11.addText('TÍNH NĂNG NỔI BẬT KHÁC', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const extFeatures = [
  {
    title: '🤖 Trợ lý ảo AutoCare AI Assistant:',
    desc: 'Tích hợp mô hình ngôn ngữ lớn LLM, giải đáp tức thì ý nghĩa đèn báo lỗi nguy hiểm trên taplo xe (Check Engine, Áp suất lốp, ABS...), tư vấn cách chăm sóc xe an toàn.'
  },
  {
    title: '📊 Dashboard Recharts trực quan:',
    desc: 'Biểu đồ tròn phân tích cơ cấu chi phí (nhớt, phụ tùng, bảo hiểm, đăng kiểm), biểu đồ cột theo dõi chi tiêu theo tháng và biểu đồ đường biến động kilomet.'
  },
  {
    title: '📑 Xuất báo cáo CSV & Hóa đơn PDF:',
    desc: 'Xuất file CSV thống kê chi tiêu chuẩn UTF-8 BOM hiển thị tiếng Việt chuẩn trên Excel; xuất Hóa đơn sửa chữa chi tiết.'
  },
  {
    title: '⭐ Đánh giá & Phản hồi Gara:',
    desc: 'Chấm điểm 1 - 5 sao kèm nhận xét sau mỗi lần bảo dưỡng, giúp minh bạch hóa uy tín các gara trong mạng lưới.'
  }
];

let extY = 1.8;
extFeatures.forEach(ef => {
  slide11.addText(ef.title, {
    x: 8.2, y: extY, w: 4.3, h: 0.28,
    fontSize: 10.5, bold: true, color: PALETTE.textGold, fontFace: 'Segoe UI'
  });
  slide11.addText(ef.desc, {
    x: 8.2, y: extY + 0.28, w: 4.3, h: 0.72,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  extY += 1.05;
});


// =========================================================================
// SLIDE 12: MÔ HÌNH TRIỂN KHAI HỆ THỐNG (DEPLOYMENT ARCHITECTURE)
// =========================================================================
const slide12 = pptx.addSlide();
renderSlideHeader(slide12, '11. TRIỂN KHAI HỆ THỐNG', 'MÔ HÌNH TRIỂN KHAI VẬN HÀNH TOÀN DIỆN (DEPLOYMENT)', 'Kiến trúc triển khai Production trên môi trường Cloud bảo mật và cân bằng tải hiệu quả', 12);

const imgDeploy = path.join(__dirname, '..', 'hinh_2_2_deployment_architecture.png');
drawFramedImage(slide12, imgDeploy, 0.6, 1.15, 7.2, 5.75, 'SƠ ĐỒ TRIỂN KHAI MẠNG & CÂN BẰNG TẢI HỆ THỐNG');

drawTechCard(slide12, 8.0, 1.15, 4.73, 5.75, PALETTE.borderCyan, PALETTE.cardBg);

slide12.addText('HẠ TẦNG VẬN HÀNH HỆ THỐNG', {
  x: 8.2, y: 1.35, w: 4.3, h: 0.35,
  fontSize: 13, bold: true, color: PALETTE.textCyan, fontFace: 'Segoe UI'
});

const deployItems = [
  {
    title: '• Nginx Reverse Proxy / Load Balancer:',
    desc: 'Điều hướng lưu lượng truy cập, cấu hình chứng chỉ bảo mật SSL/TLS (HTTPS) và tối ưu hóa nén Gzip.'
  },
  {
    title: '• Node.js PM2 Cluster Mode:',
    desc: 'Quản lý tiến trình Back-end NestJS chạy ngầm, tự động khởi động lại (Zero-downtime) khi có lỗi.'
  },
  {
    title: '• WebSocket Gateway (Port 3000):',
    desc: 'Duy trì kết nối hai chiều liên tục (Full-duplex) giữa hàng nghìn Client và Server phục vụ thông báo đẩy.'
  },
  {
    title: '• Database High Availability:',
    desc: 'SQL Server cấu hình tự động sao lưu định kỳ hàng ngày (Automated Nightly Backup) bảo toàn dữ liệu.'
  }
];

let dpY = 1.85;
deployItems.forEach(dp => {
  slide12.addText(dp.title, {
    x: 8.2, y: dpY, w: 4.3, h: 0.28,
    fontSize: 10.5, bold: true, color: PALETTE.textGold, fontFace: 'Segoe UI'
  });
  slide12.addText(dp.desc, {
    x: 8.2, y: dpY + 0.28, w: 4.3, h: 0.72,
    fontSize: 9.5, color: PALETTE.textBody, fontFace: 'Segoe UI', lineSpacing: 14
  });
  dpY += 1.05;
});


// =========================================================================
// SLIDE 13: KIỂM THỬ HỆ THỐNG & ĐẢM BẢO CHẤT LƯỢNG (TESTING)
// =========================================================================
const slide13 = pptx.addSlide();
renderSlideHeader(slide13, '12. KIỂM THỬ HỆ THỐNG', 'KIỂM THỬ CHỨC NĂNG, KIỂM THỬ API & ĐÁNH GIÁ KẾT QUẢ', 'Kiểm thử toàn diện kịch bản Black-box, xác thực API Postman và kịch bản dị thường', 13);

const testCategories = [
  {
    title: 'KIỂM THỬ CHỨC NĂNG (BLACK-BOX)',
    color: PALETTE.accentSky,
    badge: '100% TEST PASS',
    items: [
      'Xác thực đăng ký, đăng nhập JWT và luồng OTP Email khôi phục mật khẩu.',
      'Phân quyền 3 Role: Chặn User truy cập /admin/dashboard, chuyển hướng an toàn.',
      'Thêm xe, cập nhật Odometer: Chặn nhập số km mới nhỏ hơn số km cũ.',
      'Đặt lịch hẹn Gara: Chuyển đổi trạng thái 4 bước khép kín không nhảy cóc.'
    ]
  },
  {
    title: 'KIỂM THỬ API & RÀNG BUỘC CSDL',
    color: PALETTE.accentEmerald,
    badge: '30+ API ENDPOINTS',
    items: [
      'Kiểm thử toàn bộ Endpoints với dữ liệu hợp lệ và biên dữ liệu rỗng/sai định dạng.',
      'Kiểm tra ràng buộc Unique Biển số xe: Trả về HTTP 400 khi nhập trùng biển.',
      'Kiểm tra Transaction khi Gara bấm Hoàn tất: Ghi sổ và cập nhật xe nguyên tử (ACID).'
    ]
  },
  {
    title: 'KIỂM THỬ REAL-TIME & NGOẠI LỆ',
    color: PALETTE.accentPurple,
    badge: '< 200MS LATENCY',
    items: [
      'Độ trễ thông báo WebSockets Socket.IO duy trì dưới 200ms trên môi trường thử nghiệm.',
      'Xử lý ảnh OCR bị mờ: Khung nhập liệu Editable cho phép chỉnh sửa bù trừ trực tiếp.',
      'Kiểm thử gián đoạn mạng: Hệ thống tự động Re-connect khi khôi phục đường truyền.'
    ]
  }
];

testCategories.forEach((tc, idx) => {
  const tcX = 0.6 + idx * 4.05;
  drawTechCard(slide13, tcX, 1.15, 3.85, 5.75, tc.color, PALETTE.cardBg);

  slide13.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: tcX + 0.2, y: 1.35, w: 3.45, h: 0.32,
    fill: '0F172A', line: { color: tc.color, width: 1 }
  });
  slide13.addText(tc.badge, {
    x: tcX + 0.2, y: 1.35, w: 3.45, h: 0.32,
    fontSize: 9, bold: true, color: tc.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  slide13.addText(tc.title, {
    x: tcX + 0.2, y: 1.75, w: 3.45, h: 0.65,
    fontSize: 12.5, bold: true, color: PALETTE.textWhite,
    fontFace: 'Segoe UI', valign: 'middle'
  });

  slide13.addShape(pptx.shapes.LINE, {
    x: tcX + 0.2, y: 2.45, w: 3.45, h: 0,
    line: { color: PALETTE.borderSlate, width: 1 }
  });

  let itTxt = '';
  tc.items.forEach(it => { itTxt += `• ${it}\n\n`; });

  slide13.addText(itTxt, {
    x: tcX + 0.2, y: 2.6, w: 3.45, h: 4.1,
    fontSize: 10.5, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 14: KẾT QUẢ ĐẠT ĐƯỢC & ĐÓNG GÓP CỦA ĐỀ TÀI
// =========================================================================
const slide14 = pptx.addSlide();
renderSlideHeader(slide14, '13. KẾT QUẢ ĐẠT ĐƯỢC', 'KẾT QUẢ ĐẠT ĐƯỢC & ĐÓNG GÓP THỰC TIỄN CỦA ĐỀ TÀI', 'Tổng kết những giá trị kỹ thuật và tính ứng dụng thực tiễn nổi bật của hệ thống ACOH', 14);

const results = [
  {
    category: 'VỀ MẶT KỸ THUẬT & CÔNG NGHỆ',
    color: PALETTE.accentSky,
    points: [
      'Xây dựng thành công ứng dụng Web Responsive chuẩn Mobile-First (hỗ trợ Light / Dark Mode mượt mà).',
      'Làm chủ kiến trúc NestJS Clean Architecture 3 lớp có tính mở rộng cao, cấu trúc module hóa rõ ràng.',
      'Thiết kế CSDL SQL Server 2014+ chuẩn hóa 3NF, đánh chỉ mục (Index) tối ưu hóa truy vấn dữ liệu lớn.',
      'Tích hợp thành công AI OCR Tesseract nhận diện biển số thực tế và WebSockets Real-time thông suốt.'
    ]
  },
  {
    category: 'VỀ MẶT NGHIỆP VỤ & THỰC TIỄN',
    color: PALETTE.accentEmerald,
    points: [
      'Giải quyết triệt để vấn đề quên hạn đăng kiểm, bảo hiểm bắt buộc và mốc thay dầu cho chủ phương tiện.',
      'Chuẩn hóa quy trình vận hành dịch vụ gara 4 bước minh bạch, số hóa phiếu kiểm tra và hóa đơn điện tử.',
      'Cung cấp công cụ quản lý đội xe dịch vụ (Grab, Taxi, Hợp tác xã) phù hợp với quy định pháp luật Việt Nam.',
      'Tạo dựng cầu nối tương tác kỹ thuật số trực tiếp, minh bạch và tin cậy giữa chủ xe và hệ thống xưởng.'
    ]
  }
];

results.forEach((res, idx) => {
  const rY = 1.15 + idx * 2.85;
  drawTechCard(slide14, 0.6, rY, 12.13, 2.65, res.color, PALETTE.cardBg);

  slide14.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: rY, w: 0.1, h: 2.65,
    fill: { color: res.color }, line: { color: res.color, width: 0 }
  });

  slide14.addText(res.category, {
    x: 0.9, y: rY + 0.18, w: 11.5, h: 0.35,
    fontSize: 13.5, bold: true, color: res.color, fontFace: 'Segoe UI'
  });

  let pTxt = '';
  res.points.forEach(p => { pTxt += `✔ ${p}\n`; });

  slide14.addText(pTxt, {
    x: 0.9, y: rY + 0.6, w: 11.5, h: 1.9,
    fontSize: 11, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// =========================================================================
// SLIDE 15: ĐỊNH HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI (ROADMAP)
// =========================================================================
const slide15 = pptx.addSlide();
renderSlideHeader(slide15, '14. ĐỊNH HƯỚNG TƯƠNG LAI', 'ĐỊNH HƯỚNG PHÁT TRIỂN & MỞ RỘNG TRONG TƯƠNG LAI', 'Kế hoạch mở rộng các kênh thông báo tự động và kết nối phần cứng IoT Telematics', 15);

const futureRoadmaps = [
  {
    num: '01',
    title: 'CỔNG TIN NHẮN ZALO ZNS & SMS BRANDNAME',
    color: PALETTE.accentSky,
    desc: 'Tích hợp Zalo Notification Service (ZNS) và SMS thương hiệu gửi thông báo trực tiếp đến số điện thoại chủ xe, đảm bảo không bỏ lỡ cảnh báo ngay cả khi không mở ứng dụng.'
  },
  {
    num: '02',
    title: 'AI OCR BÓC TÁCH SỔ ĐĂNG KIỂM TỰ ĐỘNG',
    color: PALETTE.accentPurple,
    desc: 'Ứng dụng AI Vision bóc tách toàn bộ thông số kỹ thuật (Số quản lý, Biển số, Số khung VIN, Số máy, Ngày hết hạn kiểm định) trực tiếp từ ảnh chụp Sổ đăng kiểm/Giấy chứng nhận.'
  },
  {
    num: '03',
    title: 'KẾT NỐI PHẦN CỨNG IOT OBD-II / TELEMATICS',
    color: PALETTE.accentGold,
    desc: 'Cắm thiết bị OBD2 hoặc GPS trên xe để tự động truyền số Odometer thực tế và đọc mã lỗi phần cứng động cơ (DTC Codes) về máy chủ theo thời gian thực qua giao thức MQTT.'
  },
  {
    num: '04',
    title: 'ỨNG DỤNG DI ĐỘNG NATIVE APP (IOS & ANDROID)',
    color: PALETTE.accentEmerald,
    desc: 'Đóng gói ứng dụng Native trên nền tảng React Native / Flutter phát hành trên App Store & Google Play Store kèm hệ thống thông báo đẩy nền Firebase Cloud Messaging (FCM).'
  }
];

futureRoadmaps.forEach((fm, idx) => {
  const fX = 0.6 + (idx % 2) * 6.2;
  const fY = 1.15 + Math.floor(idx / 2) * 2.85;
  drawTechCard(slide15, fX, fY, 5.93, 2.65, fm.color, PALETTE.cardBg);

  slide15.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: fX + 0.25, y: fY + 0.2, w: 0.6, h: 0.35,
    fill: '0F172A', line: { color: fm.color, width: 1 }
  });
  slide15.addText(fm.num, {
    x: fX + 0.25, y: fY + 0.2, w: 0.6, h: 0.35,
    fontSize: 11, bold: true, color: fm.color,
    align: 'center', valign: 'middle', fontFace: 'Segoe UI'
  });

  slide15.addText(fm.title, {
    x: fX + 0.95, y: fY + 0.2, w: 4.7, h: 0.35,
    fontSize: 11.5, bold: true, color: PALETTE.textWhite,
    fontFace: 'Segoe UI', valign: 'middle'
  });

  slide15.addShape(pptx.shapes.LINE, {
    x: fX + 0.25, y: fY + 0.65, w: 5.4, h: 0,
    line: { color: PALETTE.borderSlate, width: 1 }
  });

  slide15.addText(fm.desc, {
    x: fX + 0.25, y: fY + 0.8, w: 5.4, h: 1.65,
    fontSize: 10.5, color: PALETTE.textBody,
    fontFace: 'Segoe UI', lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 16: LỜI CẢM ƠN & PHIÊN HỎI ĐÁP (Q&A SLIDE)
// =========================================================================
const slide16 = pptx.addSlide();
slide16.background = { fill: PALETTE.bgDeep };

// Top Glowing Gradient Accent
slide16.addShape(pptx.shapes.RECTANGLE, {
  x: 0, y: 0, w: 13.33, h: 0.08,
  fill: { color: PALETTE.accentGold }, line: { color: PALETTE.accentGold, width: 0 }
});

slide16.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 4.66, y: 0.9, w: 4.0, h: 0.4,
  fill: { color: '172554' }, line: { color: PALETTE.borderCyan, width: 1.5 }
});
slide16.addText('✦ KẾT THÚC PHẦN TRÌNH BÀY ✦', {
  x: 4.66, y: 0.9, w: 4.0, h: 0.4,
  fontSize: 11, bold: true, color: PALETTE.textCyan,
  align: 'center', valign: 'middle', fontFace: 'Segoe UI', characterSpacing: 1
});

slide16.addText('CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ', {
  x: 0.5, y: 1.55, w: 12.33, h: 0.8,
  fontSize: 30, bold: true, color: PALETTE.textWhite,
  align: 'center', fontFace: 'Segoe UI'
});

slide16.addText('Trong Hội đồng chấm bảo vệ Đồ án Tốt nghiệp đã chú ý theo dõi!', {
  x: 1.0, y: 2.35, w: 11.33, h: 0.45,
  fontSize: 14, italic: true, color: PALETTE.textMuted,
  align: 'center', fontFace: 'Segoe UI'
});

// Q&A Hero Box
drawTechCard(slide16, 2.66, 3.2, 8.0, 3.4, PALETTE.accentGold, PALETTE.cardBg);

slide16.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 3.66, y: 3.5, w: 6.0, h: 0.45,
  fill: '172554', line: { color: PALETTE.accentGold, width: 1.5 }
});
slide16.addText('PHIÊN HỎI ĐÁP & ĐÓNG GÓP Ý KIẾN (Q&A)', {
  x: 3.66, y: 3.5, w: 6.0, h: 0.45,
  fontSize: 13, bold: true, color: PALETTE.textGold,
  align: 'center', valign: 'middle', fontFace: 'Segoe UI'
});

slide16.addText('Em xin trân trọng lắng nghe và tiếp thu những nhận xét, đánh giá quý báu\ncũng như các câu hỏi phản biện từ Quý Thầy/Cô để hoàn thiện đề tài.\n\nSẴN SÀNG TIẾN HÀNH DEMO TRỰC TIẾP HỆ THỐNG THEO YÊU CẦU!', {
  x: 3.0, y: 4.2, w: 7.33, h: 2.1,
  fontSize: 12.5, color: PALETTE.textBody,
  align: 'center', fontFace: 'Segoe UI', lineSpacing: 22
});


// =========================================================================
// XUẤT FILE POWERPOINT ĐẲNG CẤP
// =========================================================================
const mainOutput = path.join(__dirname, '..', 'AutoCare_Office_Helper_SUPER_PREMIUM_DEFENSE.pptx');
const fixedOutput = path.join(__dirname, '..', 'AutoCare_Office_Helper_Presentation_Fixed.pptx');

pptx.writeFile({ fileName: mainOutput })
  .then(() => {
    try {
      fs.copyFileSync(mainOutput, fixedOutput);
    } catch (e) {
      console.log('File Fixed is open/locked, but main super premium file generated successfully.');
    }
    console.log(`\n======================================================`);
    console.log(`✅ SIÊU PHẨM SLIDE BẢO VỆ ĐỒ ÁN ĐÃ TẠO THÀNH CÔNG RỰC RỠ!`);
    console.log(`📁 File chính: ${mainOutput}`);
    console.log(`======================================================\n`);
  })
  .catch(err => {
    console.error('Lỗi khi xuất slide:', err);
  });
