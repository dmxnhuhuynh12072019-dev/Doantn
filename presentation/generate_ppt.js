const pptxgen = require('pptxgenjs');
const path = require('path');

// Initialize presentation
const pptx = new pptxgen();

// Set presentation metadata
pptx.title = 'Báo cáo Đồ án Tốt nghiệp AutoCare Office Helper (ACOH)';
pptx.subject = 'Tài liệu thuyết trình đồ án tốt nghiệp';
pptx.author = 'Nhóm thực hiện Đồ án ACOH';
pptx.company = 'ACOH Project';

// Set layout 16:9 widescreen
pptx.layout = 'LAYOUT_16x9';

// Define Color Scheme (Slate & Blue theme with Gold accent)
const COLORS = {
  darkBg: '0F172A',      // Slate 900 (Deep Slate)
  darkCardBg: '1E293B',  // Slate 800 (Card Bg for dark slides)
  lightBg: 'F8FAFC',     // Slate 50 (Page background for light slides)
  white: 'FFFFFF',       // Card background
  primaryBlue: '2563EB', // Blue 600 (Main theme blue)
  lightBlue: '38BDF8',   // Sky 400 (Border accent)
  accentGold: 'F59E0B',  // Amber 500 (Attention/Highlight gold)
  textDark: '0F172A',    // Slate 900 (Main text)
  textMuted: '475569',   // Slate 600 (Secondary text)
  textLight: 'E2E8F0',   // Slate 200 (Text on dark slides)
  borderGrey: 'E2E8F0',  // Slate 200 (Card border)
  dangerRed: 'DC2626',   // Red 600 (Alert/Issue)
  successGreen: '059669',// Green 600 (Resolution/Role)
};

// Helper function to create slide header on slides
function addSlideHeader(slide, titleStr, subtitleStr, isDark = false) {
  // Left vertical accent bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 0.45, w: 0.08, h: 0.75,
    fill: { color: isDark ? COLORS.accentGold : COLORS.primaryBlue },
    line: { color: isDark ? COLORS.accentGold : COLORS.primaryBlue, width: 0 }
  });
  // Slide Title (The large bold text)
  slide.addText(titleStr, {
    x: 0.8, y: 0.4, w: 11.8, h: 0.45,
    fontSize: 20, bold: true, color: isDark ? COLORS.accentGold : COLORS.primaryBlue,
    fontFace: 'Segoe UI'
  });
  // Slide Subtitle/Description (Smaller text below)
  slide.addText(subtitleStr, {
    x: 0.8, y: 0.85, w: 11.8, h: 0.35,
    fontSize: 13, bold: false, color: isDark ? COLORS.textLight : COLORS.textMuted,
    fontFace: 'Segoe UI',
    valign: 'middle'
  });
}

// Helper function to add slide background
function setSlideBg(slide, isDark = false) {
  slide.background = { fill: isDark ? COLORS.darkBg : COLORS.lightBg };
}


// ==========================================
// SLIDE 1: COVER PAGE (Dark Theme)
// ==========================================
const slide1 = pptx.addSlide();
setSlideBg(slide1, true);

// Add top decorative small line
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 5.66, y: 1.0, w: 2.0, h: 0.08,
  fill: { color: COLORS.accentGold },
  line: { color: COLORS.accentGold, width: 0 }
});

// Category header
slide1.addText('BÁO CÁO ĐỒ ÁN TỐT NGHIỆP', {
  x: 0.5, y: 1.3, w: 12.33, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.accentGold,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 2
});

// Main Title
slide1.addText('AUTOCARE OFFICE HELPER (ACOH)', {
  x: 0.5, y: 1.9, w: 12.33, h: 1.0,
  fontSize: 32, bold: true, color: COLORS.white,
  align: 'center', fontFace: 'Segoe UI', characterSpacing: 1
});

// Subtitle
slide1.addText('Hệ thống số hóa & quản lý lịch đăng kiểm, bảo dưỡng, bảo hiểm phương tiện tối ưu cho người bận rộn', {
  x: 1.0, y: 3.0, w: 11.33, h: 0.6,
  fontSize: 15, italic: true, color: COLORS.textLight,
  align: 'center', fontFace: 'Segoe UI'
});

// Presentation details box (using rounded card on dark background)
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 2.5, y: 4.0, w: 8.33, h: 2.3,
  fill: { color: COLORS.darkCardBg },
  line: { color: COLORS.borderDark, width: 1.5 }
});

// Left Column: Giảng viên hướng dẫn
slide1.addText([
  { text: 'GIẢNG VIÊN HƯỚNG DẪN\n', options: { bold: true, color: COLORS.accentGold, fontSize: 11 } },
  { text: 'ThS. Nguyễn Văn A\n(Giáo viên hướng dẫn)', options: { fontSize: 13, color: COLORS.white } }
], {
  x: 2.8, y: 4.3, w: 3.5, h: 1.7,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 22
});

// Right Column: Nhóm thực hiện
slide1.addText([
  { text: 'NHÓM THỰC HIỆN\n', options: { bold: true, color: COLORS.accentGold, fontSize: 11 } },
  { text: '1. Nguyễn Văn Khách Hàng (MSSV: 20201234)\n', options: { fontSize: 13, color: COLORS.white } },
  { text: '2. Trần Thị Học Viên (MSSV: 20205678)\n', options: { fontSize: 13, color: COLORS.white } },
  { text: 'Lớp/Khóa: Công nghệ Thông tin - K65', options: { fontSize: 12, color: COLORS.textLight } }
], {
  x: 6.8, y: 4.3, w: 3.8, h: 1.7,
  fontFace: 'Segoe UI', align: 'left', lineSpacing: 22
});


// ==========================================
// SLIDE 2: BÀI TOÁN THỰC TẾ & USERS (Light Theme)
// ==========================================
const slide2 = pptx.addSlide();
setSlideBg(slide2, false);
addSlideHeader(slide2, '01. BÀI TOÁN THỰC TẾ & ĐỐI TƯỢNG NGƯỜI DÙNG', 'Thực trạng cần giải quyết và các đối tượng sử dụng hệ thống');

// Left Card: Thực trạng & Khó khăn
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.6, w: 5.8, h: 5.2,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderGrey, width: 1.5 }
});

slide2.addText('THỰC TRẠNG & KHÓ KHĂN THỰC TẾ', {
  x: 0.9, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.dangerRed,
  fontFace: 'Segoe UI'
});

slide2.addText([
  { text: '• Quên các mốc thời hạn quan trọng: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Người bận rộn (như nhân viên văn phòng) thường xuyên quên lịch đăng kiểm, bảo dưỡng định kỳ, mua bảo hiểm. Gây mất an toàn và bị phạt nặng.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• Quản lý chi phí thủ công, phân tán: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Chưa có ứng dụng tập trung theo dõi số kilomet (odometer) thực tế cùng lúc cho nhiều xe (ô tô, xe máy) và thống kê chi tiêu hàng tháng.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• Khó kết nối với các dịch vụ sửa chữa: ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Đặt lịch hẹn Gara mất nhiều thời gian, quy trình chưa tối ưu và không lưu trữ được nhật ký sửa chữa điện tử của xe.', options: { color: COLORS.textMuted } }
], {
  x: 0.9, y: 2.4, w: 5.2, h: 4.1,
  fontSize: 13, fontFace: 'Segoe UI', lineSpacing: 20
});

// Right Card: Đối tượng người dùng
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.9, y: 1.6, w: 5.8, h: 5.2,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderGrey, width: 1.5 }
});

slide2.addText('ĐỐI TƯỢNG NGƯỜI DÙNG HƯỚNG TỚI', {
  x: 7.2, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.successGreen,
  fontFace: 'Segoe UI'
});

slide2.addText([
  { text: '• USER (Chủ phương tiện): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Theo dõi chỉ số xe, cập nhật Kilomet hiện tại, nhận thông báo nhắc nhở tự động, đặt lịch hẹn sửa chữa và hỏi đáp với trợ lý AI.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• GARAGE (Đối tác liên kết): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Quản lý lịch hẹn trực tuyến, định danh phương tiện của khách hàng dựa trên biển số xe, trực tiếp ghi sổ bảo dưỡng điện tử và quản lý doanh thu.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• ADMIN (Quản trị viên): ', options: { bold: true, color: COLORS.textDark } },
  { text: 'Quản lý tài khoản, kiểm duyệt các Gara đăng ký liên kết, quản lý các danh mục cấu hình và giám sát hoạt động hệ thống qua Dashboard tổng.', options: { color: COLORS.textMuted } }
], {
  x: 7.2, y: 2.4, w: 5.2, h: 4.1,
  fontSize: 13, fontFace: 'Segoe UI', lineSpacing: 20
});


// ==========================================
// SLIDE 3: KIẾN TRÚC & MÔ HÌNH DỮ LIỆU ERD (Light Theme)
// ==========================================
const slide3 = pptx.addSlide();
setSlideBg(slide3, false);
addSlideHeader(slide3, '02. KIẾN TRÚC CÔNG NGHỆ & MÔ HÌNH DỮ LIỆU (ERD)', 'Nền tảng công nghệ và thiết kế cơ sở dữ liệu quan hệ của hệ thống');

// Left Column: Tech Stack
slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.6, w: 5.0, h: 5.2,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderGrey, width: 1.5 }
});

slide3.addText('CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG', {
  x: 0.8, y: 1.9, w: 4.6, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.primaryBlue,
  fontFace: 'Segoe UI'
});

slide3.addText([
  { text: '• Front-End (FE):\n', options: { bold: true, color: COLORS.textDark } },
  { text: 'React.js framework, styling bằng Tailwind CSS + Shadcn/ui giúp AI sinh giao diện nhanh và hỗ trợ Responsive/Mobile-first tốt.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• Back-End (BE):\n', options: { bold: true, color: COLORS.textDark } },
  { text: 'Nest.js (Node.js runtime), cấu trúc Module hóa rõ ràng. Bảo mật JWT & BCrypt. Gửi mail tự động bằng Nodemailer.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• Database:\n', options: { bold: true, color: COLORS.textDark } },
  { text: 'Hệ quản trị CSDL quan hệ Microsoft SQL Server 2014, cài đặt các Non-clustered Indexes tăng tốc độ truy vấn liên kết.\n\n', options: { color: COLORS.textMuted } },
  
  { text: '• Mô hình kiến trúc:\n', options: { bold: true, color: COLORS.textDark } },
  { text: 'Clean Architecture (Controller - Service - Repository) đảm bảo tính mở rộng và dễ bảo trì.', options: { color: COLORS.textMuted } }
], {
  x: 0.8, y: 2.3, w: 4.6, h: 4.3,
  fontSize: 12.5, fontFace: 'Segoe UI', lineSpacing: 18
});

// Right Column: ERD Diagram Title & Background Card
slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.0, y: 1.6, w: 6.7, h: 5.2,
  fill: { color: COLORS.white },
  line: { color: COLORS.borderGrey, width: 1.5 }
});

slide3.addText('SƠ ĐỒ THỰC THỂ LIÊN KẾT (CSDL)', {
  x: 6.2, y: 1.9, w: 6.3, h: 0.4,
  fontSize: 16, bold: true, color: COLORS.primaryBlue,
  fontFace: 'Segoe UI'
});

// Draw ERD Boxes (Visual layout)
const entities = [
  { name: 'Users\n(Người dùng)', x: 6.3, y: 2.4, w: 1.4, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'Vehicles\n(Phương tiện)', x: 8.5, y: 2.4, w: 1.4, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'LegalDocuments\n(Giấy tờ xe)', x: 10.7, y: 2.4, w: 1.7, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'Notifications\n(Thông báo)', x: 6.3, y: 3.5, w: 1.4, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'Schedules\n(Mốc nhắc bảo dưỡng)', x: 8.3, y: 3.5, w: 1.8, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'Garages\n(Trạm dịch vụ)', x: 6.3, y: 4.6, w: 1.4, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'Appointments\n(Lịch đặt hẹn)', x: 8.5, y: 4.6, w: 1.4, h: 0.6, color: '1E293B', border: '38BDF8' },
  { name: 'History\n(Nhật ký bảo dưỡng)', x: 10.7, y: 4.6, w: 1.7, h: 0.6, color: '1E293B', border: '38BDF8' }
];

entities.forEach(ent => {
  // Rounded Box representing table
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: ent.x, y: ent.y, w: ent.w, h: ent.h,
    fill: { color: ent.color },
    line: { color: ent.border, width: 1.5 }
  });
  // Table Name Text
  slide3.addText(ent.name, {
    x: ent.x, y: ent.y, w: ent.w, h: ent.h,
    fontSize: 9.5, bold: true, color: COLORS.white,
    fontFace: 'Segoe UI', align: 'center', valign: 'middle'
  });
});

// Draw ERD Lines
const connLines = [
  { x: 7.7, y: 2.7, w: 0.8, h: 0 },   // Users -> Vehicles
  { x: 9.9, y: 2.7, w: 0.8, h: 0 },   // Vehicles -> LegalDocuments
  { x: 7.0, y: 3.0, w: 0, h: 0.5 },   // Users -> Notifications
  { x: 9.2, y: 3.0, w: 0, h: 0.5 },   // Vehicles -> Schedules
  { x: 7.0, y: 4.1, w: 0, h: 0.5 },   // Users -> Garages (owner link)
  { x: 7.7, y: 4.9, w: 0.8, h: 0 },   // Garages -> Appointments
  { x: 9.9, y: 4.9, w: 0.8, h: 0 },   // Appointments -> History
  { x: 9.2, y: 3.0, w: 0, h: 1.6 }    // Vehicles -> Appointments (Vertical connection)
];

connLines.forEach(line => {
  slide3.addShape(pptx.shapes.LINE, {
    x: line.x, y: line.y, w: line.w, h: line.h,
    line: { color: '94A3B8', width: 1.5 }
  });
});

// Legend / explanation box inside card
slide3.addText('Sơ đồ mô tả cấu trúc quan hệ: Users lưu thông tin tài khoản; Vehicles lưu trữ phương tiện của User; LegalDocuments theo dõi Đăng kiểm/Bảo hiểm; Schedules quản lý mốc bảo dưỡng định kỳ; Appointments & History quản lý đặt lịch và dịch vụ sửa chữa của Gara.', {
  x: 6.2, y: 5.5, w: 6.3, h: 1.0,
  fontSize: 10.5, italic: true, color: COLORS.textMuted,
  fontFace: 'Segoe UI', lineSpacing: 15
});


// ==========================================
// SLIDE 4: PHƯƠNG PHÁP VIBE CODING (Light Theme)
// ==========================================
const slide4 = pptx.addSlide();
setSlideBg(slide4, false);
addSlideHeader(slide4, '03. QUY TRÌNH ỨNG DỤNG PHƯƠNG PHÁP VIBE CODING', 'Phương thức phát triển hệ thống nhanh chóng bằng việc tương tác với AI Agent/Copilot');

slide4.addText('Vibe Coding chuyển đổi vai trò lập trình viên thành người định hướng thiết kế và kiểm soát nghiệp vụ cấp cao, để AI Agent thực hiện tự động các khâu sinh mã chi tiết (code generation) và sửa lỗi (debugging).', {
  x: 0.6, y: 1.4, w: 12.13, h: 0.6,
  fontSize: 14, italic: true, color: COLORS.textMuted,
  fontFace: 'Segoe UI'
});

// Steps layout (4 cards side-by-side)
const steps = [
  {
    num: 'BƯỚC 01',
    title: 'ĐẶC TẢ NGHIỆP VỤ',
    color: '2563EB',
    desc: 'Biên soạn tài liệu đặc tả `module.md` chi tiết từ cấu trúc Database, các API Endpoints đến quy trình logic. Đây là nguồn định hướng bối cảnh chuẩn (Single Source of Truth) để AI Agent hiểu rõ yêu cầu hệ thống.'
  },
  {
    num: 'BƯỚC 02',
    title: 'SINH MÃ NGUỒN',
    color: '0D9488',
    desc: 'Sử dụng AI để tự động phát sinh khung mã nguồn Back-end (Nest.js modules, controllers, DTOs) và giao diện Front-end (React + Tailwind CSS). Người dùng chỉ cần copy-paste các component chuẩn hóa.'
  },
  {
    num: 'BƯỚC 03',
    title: 'GỠ LỖI TƯƠNG TÁC',
    color: 'D97706',
    desc: 'Trong quá trình tích hợp, gửi trực tiếp thông báo lỗi SQL Server, log kiểm thử API, hoặc các file mã lỗi cho AI Agent. AI nhanh chóng phân tích nguyên nhân và đưa ra giải pháp sửa đổi tức thời.'
  },
  {
    num: 'BƯỚC 04',
    title: 'TEST & TỐI ƯU HÓA',
    color: 'DC2626',
    desc: 'Nhờ AI xây dựng các kịch bản kiểm thử chi tiết (`test_scenarios.md`) cho từng module và chạy thử nghiệm. AI cũng hỗ trợ viết các câu truy vấn SQL tối ưu chỉ mục (index) và dọn dẹp code dư thừa.'
  }
];

const startX = 0.6;
const cardW = 2.8;
const gap = 0.31;

steps.forEach((step, index) => {
  const currentX = startX + index * (cardW + gap);
  
  // Card base
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: currentX, y: 2.1, w: cardW, h: 4.8,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderGrey, width: 1.5 }
  });
  
  // Card top header indicator
  slide4.addShape(pptx.shapes.RECTANGLE, {
    x: currentX, y: 2.1, w: cardW, h: 0.12,
    fill: { color: step.color },
    line: { color: step.color, width: 0 }
  });
  
  // Step number
  slide4.addText(step.num, {
    x: currentX + 0.2, y: 2.4, w: cardW - 0.4, h: 0.3,
    fontSize: 11, bold: true, color: step.color,
    fontFace: 'Segoe UI'
  });
  
  // Step title
  slide4.addText(step.title, {
    x: currentX + 0.2, y: 2.7, w: cardW - 0.4, h: 0.5,
    fontSize: 14, bold: true, color: COLORS.textDark,
    fontFace: 'Segoe UI', valign: 'middle'
  });
  
  // Step description
  slide4.addText(step.desc, {
    x: currentX + 0.2, y: 3.3, w: cardW - 0.4, h: 3.4,
    fontSize: 11.5, color: COLORS.textMuted,
    fontFace: 'Segoe UI', lineSpacing: 18
  });
});


// ==========================================
// SLIDE 5: DEMO & TÍNH NĂNG CỐT LÕI (Light Theme)
// ==========================================
const slide5 = pptx.addSlide();
setSlideBg(slide5, false);
addSlideHeader(slide5, '04. DEMO & CÁC TÍNH NĂNG CỐT LÕI ẤN TƯỢNG', 'Những tính năng nổi bật tạo nên giá trị ứng dụng thực tiễn cao của ACOH');

// Grid of 4 features (2x2 layout)
const features = [
  {
    title: '1. Cảnh báo thông minh & Đăng kiểm',
    color: '2563EB',
    desc: 'Hệ thống tự động tính toán số ngày hoặc số kilomet còn lại để gửi thông báo kịp thời. Sử dụng thuật toán quét tự động định kỳ (Cron Job lúc 00:00) gửi thông tin qua Email và In-app cho chủ xe. Giao diện trực quan hiển thị màu sắc cảnh báo động (Xanh/Cam/Đỏ) theo hạn mức an toàn.'
  },
  {
    title: '2. Quy trình Đặt lịch - Ghi nhật ký khép kín',
    color: '059669',
    desc: 'Xây dựng mối liên kết hai chiều chặt chẽ: Chủ xe đặt lịch Gara trực tuyến → Gara tiếp nhận, sửa chữa xe → Gara trực tiếp cập nhật Nhật ký sửa chữa điện tử (tự động lưu số km thực tế, vật tư, đơn giá) → Hệ thống tự động bắn thông báo tức thời đẩy qua app báo khách nhận xe.'
  },
  {
    title: '3. Trợ lý ảo AutoCare AI Assistant',
    color: 'D97706',
    desc: 'Tích hợp mô hình ngôn ngữ lớn (Gemini API) thông qua Chatbox nổi tại Front-end. Người dùng có thể trò chuyện trực tiếp để hỏi đáp các lỗi kỹ thuật xe thường gặp, tra cứu chu kỳ bảo dưỡng lý thuyết của hãng, tư vấn cách tự chăm sóc xe tại nhà hiệu quả.'
  },
  {
    title: '4. Thống kê Dashboard & Kết xuất dữ liệu',
    color: '7C3AED',
    desc: 'Giao diện Dashboard riêng biệt theo vai trò: Chủ xe xem biểu đồ phân tích chi phí vận hành; Gara xem biểu đồ cột số lượng xe bảo dưỡng và biểu đồ đường theo dõi doanh thu. Hỗ trợ kết xuất hóa đơn sửa chữa chi tiết ra file PDF (Gara) và xuất Excel tổng hợp chi tiêu (Chủ xe).'
  }
];

const fX = [0.6, 6.9];
const fY = [1.7, 4.4];
const fW = 5.8;
const fH = 2.4;

features.forEach((feat, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  const currentX = fX[col];
  const currentY = fY[row];
  
  // Card base
  slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: currentX, y: currentY, w: fW, h: fH,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderGrey, width: 1.5 }
  });
  
  // Left color indicator bar inside card
  slide5.addShape(pptx.shapes.RECTANGLE, {
    x: currentX + 0.02, y: currentY + 0.1, w: 0.08, h: fH - 0.2,
    fill: { color: feat.color },
    line: { color: feat.color, width: 0 }
  });
  
  // Feature title
  slide5.addText(feat.title, {
    x: currentX + 0.3, y: currentY + 0.2, w: fW - 0.5, h: 0.4,
    fontSize: 14.5, bold: true, color: COLORS.textDark,
    fontFace: 'Segoe UI'
  });
  
  // Feature description
  slide5.addText(feat.desc, {
    x: currentX + 0.3, y: currentY + 0.6, w: fW - 0.5, h: fH - 0.8,
    fontSize: 11, color: COLORS.textMuted,
    fontFace: 'Segoe UI', lineSpacing: 16
  });
});


// ==========================================
// SLIDE 6: ĐÓNG GÓP & KẾT LUẬN (Dark Theme)
// ==========================================
const slide6 = pptx.addSlide();
setSlideBg(slide6, true);

// Header for slide 6 (using light text)
addSlideHeader(slide6, '05. BIỂU ĐỒ ĐÓNG GÓP & KẾT LUẬN', 'Đánh giá đóng góp thành viên, kết luận đề tài và định hướng phát triển tương lai', true);

// Left Column: Work Contribution Chart Card
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.6, w: 5.8, h: 5.2,
  fill: { color: COLORS.darkCardBg },
  line: { color: COLORS.borderDark, width: 1.5 }
});

slide6.addText('TỶ LỆ ĐÓNG GÓP CÔNG VIỆC NHÓM', {
  x: 0.9, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 15, bold: true, color: COLORS.accentGold,
  fontFace: 'Segoe UI'
});

// Define Pie Chart data
const chartData = [
  {
    name: 'Đóng góp công việc',
    labels: ['Nguyễn Văn Khách Hàng (Backend & DB & AI)', 'Trần Thị Học Viên (Frontend & UX & Test)'],
    values: [50, 50]
  }
];

// Add Native Pie Chart to Left Column
slide6.addChart(pptx.ChartType.pie, chartData, {
  x: 0.8, y: 2.4, w: 5.4, h: 4.1,
  showLegend: true,
  legendPos: 'b',
  legendColor: COLORS.white,
  chartColors: ['3B82F6', '10B981'], // Blue, Green
  showPercent: true,
  dataLabelColor: COLORS.white,
  dataLabelFontSize: 12
});

// Right Column: Conclusion & Future Development Card
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.9, y: 1.6, w: 5.8, h: 5.2,
  fill: { color: COLORS.darkCardBg },
  line: { color: COLORS.borderDark, width: 1.5 }
});

slide6.addText('KẾT LUẬN & HƯỚNG PHÁT TRIỂN', {
  x: 7.2, y: 1.9, w: 5.2, h: 0.4,
  fontSize: 15, bold: true, color: COLORS.accentGold,
  fontFace: 'Segoe UI'
});

slide6.addText([
  { text: '• Hoàn thành hệ thống: ', options: { bold: true, color: COLORS.white } },
  { text: 'Xây dựng thành công ứng dụng Web Responsive (mobile-first) hỗ trợ quản lý tập trung lịch đăng kiểm, bảo dưỡng và bảo hiểm phương tiện đúng theo mô tả đặc tả kỹ thuật.\n\n', options: { color: COLORS.textLight } },
  
  { text: '• Tích hợp Công nghệ & Kiến trúc: ', options: { bold: true, color: COLORS.white } },
  { text: 'Hệ thống triển khai trên nền React + Tailwind CSS + Shadcn/ui (Frontend) và Nest.js + SQL Server 2014 (Backend) theo mô hình Clean Architecture bảo mật, ổn định.\n\n', options: { color: COLORS.textLight } },
  
  { text: '• Tối ưu hóa quy trình Vibe Coding: ', options: { bold: true, color: COLORS.white } },
  { text: 'Cộng tác hiệu quả với AI Agent (Vibe Coding) giúp sinh mã nguồn nhanh chóng từ tài liệu module.md và gỡ lỗi hệ thống tức thì.\n\n', options: { color: COLORS.textLight } },
  
  { text: '• Định hướng phát triển: ', options: { bold: true, color: COLORS.white } },
  { text: 'Tiếp tục tối ưu hóa các chỉ mục cơ sở dữ liệu nâng cao, mở rộng kết nối với hệ thống gara liên kết đối tác và phát triển thêm các tiện ích thông minh cho chủ xe.', options: { color: COLORS.textLight } }
], {
  x: 7.2, y: 2.4, w: 5.2, h: 4.2,
  fontSize: 12.5, fontFace: 'Segoe UI', lineSpacing: 19
});


// ==========================================
// SAVE PRESENTATION FILE
// ==========================================
const filename = 'AutoCare_Office_Helper_Presentation_Fixed.pptx';
const outputPath = path.join(__dirname, '..', filename);

pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`Presentation generated successfully and saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('An error occurred while generating presentation:', err);
  });
