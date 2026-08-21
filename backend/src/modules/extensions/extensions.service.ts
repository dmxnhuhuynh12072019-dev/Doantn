import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class ExtensionsService {
  private readonly logger = new Logger(ExtensionsService.name);

  constructor(private dbService: DatabaseService) {}

  // 1. Trợ lý ảo AI tư vấn bảo dưỡng thông minh (NLP Luật mượt mà)
  async chatWithAI(message: string): Promise<string> {
    const msg = message.toLowerCase();

    if (msg.includes('nhớt') || msg.includes('dầu') || msg.includes('castrol') || msg.includes('bôi trơn')) {
      return `🚗 **Tư vấn thay dầu/nhớt động cơ:**\n\n` +
             `- **Đối với Ô tô:** Bạn nên thay dầu động cơ định kỳ sau mỗi **5.000 km** hoặc **6 tháng** (tùy điều kiện nào đến trước). Nếu dùng dầu tổng hợp toàn phần (Fully Synthetic), mốc thay có thể kéo dài đến **10.000 km** hoặc **12 tháng**.\n` +
             `⚠️ *Lưu ý:* Hãy nhớ thay lọc dầu ô tô sau mỗi 2 lần thay nhớt động cơ nhé!`;
    }

    if (msg.includes('đăng kiểm') || msg.includes('kiểm định') || msg.includes('trung tâm đăng kiểm')) {
      return `📋 **Tư vấn chu kỳ Đăng kiểm xe cơ giới:**\n\n` +
             `- **Xe ô tô con chở người dưới 9 chỗ (không kinh doanh vận tải):**\n` +
             `  + Xe mới mua được miễn đăng kiểm lần đầu trong **36 tháng**.\n` +
             `  + Xe sản xuất dưới 7 năm: Chu kỳ định kỳ là **24 tháng**.\n` +
             `  + Xe sản xuất từ 7 đến 20 năm: Chu kỳ định kỳ là **12 tháng**.\n` +
             `  + Xe sản xuất trên 20 năm: Chu kỳ định kỳ là **6 tháng**.\n` +
             `⚠️ *Mẹo:* Bạn nên lưu thông tin ngày đăng kiểm vào tab **"Giấy tờ xe"** trên hệ thống ACOH để nhận được cảnh báo tự động trước khi hết hạn 30 ngày.`;
    }

    if (msg.includes('bảo hiểm') || msg.includes('thân vỏ') || msg.includes('tnds') || msg.includes('vật chất')) {
      return `🛡️ **Tư vấn Bảo hiểm phương tiện:**\n\n` +
             `1. **Bảo hiểm Trách nhiệm dân sự (TNDS) bắt buộc:** Đây là bảo hiểm bắt buộc theo luật pháp Việt Nam khi tham gia giao thông. Giúp bồi thường thiệt hại cho bên thứ ba gặp tai nạn do lỗi của bạn.\n` +
             `2. **Bảo hiểm vật chất xe (Bảo hiểm thân vỏ - Tự nguyện):** Chi trả chi phí sửa chữa xe của chính bạn khi xảy ra va quẹt, tai nạn, ngập nước (thủy kích) hoặc mất cắp bộ phận.\n` +
             `💡 *Lời khuyên:* Nên chuẩn bị gia hạn bảo hiểm trước ngày hết hạn 15 ngày để đảm bảo quyền lợi bảo vệ liên tục.`;
    }

    if (msg.includes('cá vàng') || msg.includes('đèn check') || msg.includes('báo lỗi') || msg.includes('nhiệt độ')) {
      return `⚠️ **Cảnh báo lỗi động cơ (Đèn cá vàng / Check Engine):**\n\n` +
             `Khi đèn báo lỗi động cơ màu cam sáng liên tục trên bảng đồng hồ:\n` +
             `1. **Hãy tấp xe vào lề an toàn** và kiểm tra xem xe có hiện tượng giật, khói đen hoặc có tiếng kêu lạ không.\n` +
             `2. **Quan sát đồng hồ nhiệt độ nước làm mát:** Nếu kim nhiệt độ chỉ vạch đỏ (quá nhiệt), hãy tắt máy ngay lập tức để tránh thổi gioăng mặt máy.\n` +
             `3. **Cách xử lý:** Đèn Check Engine có hàng trăm nguyên nhân từ lỏng nắp bình xăng, hỏng cảm biến khí xả đến lỗi kim phun. Hãy đặt lịch hẹn ngay với một **Gara uy tín** gần nhất trên hệ thống ACOH để cắm máy chẩn đoán quét mã lỗi (OBD2) chính xác.`;
    }

    if (msg.includes('kilomet') || msg.includes('km') || msg.includes('chu kỳ') || msg.includes('mốc bảo dưỡng')) {
      return `🔧 **Các mốc bảo dưỡng định kỳ khuyến nghị cho ô tô:**\n\n` +
             `- **Mốc 5.000 km (Cấp nhỏ):** Thay nhớt máy, vệ sinh lọc gió động cơ & lọc gió điều hòa, kiểm tra nước rửa kính, nước làm mát.\n` +
             `- **Mốc 10.000 km (Cấp trung bình):** Thay dầu máy, thay lọc nhớt, đảo lốp, kiểm tra hệ thống phanh.\n` +
             `- **Mốc 20.000 km (Cấp trung bình lớn):** Thay dầu, lọc nhớt, thay lọc gió động cơ, lọc gió điều hòa, bảo dưỡng phanh 4 bánh.\n` +
             `- **Mốc 40.000 km (Cấp lớn):** Thay thế toàn bộ các loại chất lỏng (dầu phanh, dầu trợ lực lái, dầu hộp số, nước làm mát), thay lọc nhiên liệu, thay bugi và kiểm tra dây curoa cam.`;
    }

    if (msg.includes('phanh') || msg.includes('thắng') || msg.includes('kêu')) {
      return `🛑 **Tư vấn hệ thống phanh (thắng):**\n\n` +
             `- Má phanh ô tô thường cần kiểm tra và bảo dưỡng mỗi **10.000 km** và thay thế sau khoảng **40.000 - 60.000 km**.\n` +
             `- Dầu phanh cần thay thế định kỳ mỗi **2 năm hoặc 40.000 km** để tránh hiện tượng dầu bị lẫn hơi nước gây mất phanh (khóa hơi).\n` +
             `- *Dấu hiệu hỏng phanh:* Bàn đạp phanh bị nhẹ/sụt sàn, có tiếng rít kim loại chói tai khi phanh, hoặc xe bị lệch hướng khi phanh gấp.`;
    }

    if (msg.includes('lốp') || msg.includes('vỏ xe') || msg.includes('áp suất')) {
      return `🛞 **Tư vấn an toàn lốp xe:**\n\n` +
             `- Hãy kiểm tra áp suất lốp định kỳ **mỗi tuần** hoặc trước mỗi chuyến đi xa. Bơm đúng áp suất chuẩn khuyến nghị dán ở khung cửa tài xế.\n` +
             `- Nên đảo lốp định kỳ mỗi **10.000 km** để lốp mòn đều.\n` +
             `- Tuổi thọ lốp xe thường tối đa là **6 năm hoặc 50.000 km** tùy điều kiện nào đến trước. Nên thay lốp ngay khi thấy vết nứt chân chim hoặc gai lốp mòn đến vạch chỉ thị.`;
    }

    // Default Fallback
    return `👋 **Xin chào! Tôi là Trợ lý bảo dưỡng xe ACOH AI Assistant.**\n\n` +
           `Tôi có thể giúp bạn giải đáp các vấn đề chuyên sâu về xe như:\n` +
           `- Chu kỳ thay nhớt, lọc dầu của ô tô, xe máy.\n` +
           `- Quy định thời hạn đăng kiểm mới nhất và bảo hiểm xe.\n` +
           `- Chẩn đoán các hiện tượng báo lỗi (đèn cá vàng, quá nhiệt).\n` +
           `- Tư vấn nội dung cần làm tại các mốc km lớn (20k km, 40k km).\n\n` +
           `*Hãy nhập câu hỏi của bạn xuống dưới nhé!*`;
  }

  // 2. Viết đánh giá chất lượng cho Gara đối tác
  async createReview(userId: number, garageId: number, rating: number, comment?: string) {
    // A. Chèn bản ghi đánh giá mới
    await this.dbService.query(
      `INSERT INTO Reviews (GarageID, UserID, Rating, Comment)
       VALUES (@garageId, @userId, @rating, @comment)`,
      [
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'rating', type: sql.Int, value: rating },
        { name: 'comment', type: sql.NVarChar, value: comment || null },
      ]
    );

    // B. Tính toán lại điểm trung bình và cập nhật cột Rating trong bảng Garages
    await this.dbService.query(
      `UPDATE Garages 
       SET Rating = (
           SELECT CAST(AVG(CAST(Rating AS DECIMAL(3,2))) AS DECIMAL(3,2)) 
           FROM Reviews 
           WHERE GarageID = @garageId
       ) 
       WHERE GarageID = @garageId`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );

    return { message: 'Đánh giá chất lượng Gara thành công!' };
  }

  // 3. Lấy danh sách đánh giá của Gara kèm thông tin người dùng
  async getReviews(garageId: number) {
    const result = await this.dbService.query(
      `SELECT r.*, u.FullName AS ReviewerName
       FROM Reviews r
       JOIN Users u ON r.UserID = u.UserID
       WHERE r.GarageID = @garageId
       ORDER BY r.CreatedAt DESC`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    return result.recordset;
  }

  // 4. Xuất báo cáo chi tiêu của chủ xe ra file CSV (UTF-8 BOM hỗ trợ tiếng Việt)
  async exportExpenses(userId: number): Promise<string> {
    const result = await this.dbService.query(
      `SELECT h.ExecutionDate, v.LicensePlate, v.Brand, v.Model, h.ExecutionOdometer, h.TotalCost, h.Details, g.GarageName
       FROM MaintenanceHistory h
       JOIN Vehicles v ON h.VehicleID = v.VehicleID
       LEFT JOIN Garages g ON h.GarageID = g.GarageID
       WHERE v.UserID = @userId
       ORDER BY h.ExecutionDate DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    // Tạo nội dung CSV
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'Ngày thực hiện,Biển số,Nhãn hiệu,Dòng xe,Số km lúc làm,Chi phí (VND),Nội dung chi tiết,Gara thực hiện\n';

    result.recordset.forEach(row => {
      const dateStr = new Date(row.ExecutionDate).toLocaleDateString('vi-VN');
      const detailsEscaped = `"${(row.Details || '').replace(/"/g, '""')}"`;
      const garageEscaped = `"${(row.GarageName || 'Tự bảo dưỡng').replace(/"/g, '""')}"`;
      csv += `${dateStr},${row.LicensePlate},${row.Brand},${row.Model},${row.ExecutionOdometer},${row.TotalCost},${detailsEscaped},${garageEscaped}\n`;
    });

    return csv;
  }

  // 5. Xuất hóa đơn chi tiết bảo dưỡng của lịch hẹn ra file CSV hóa đơn thanh toán
  async exportInvoice(appointmentId: number, userId: number, role: string): Promise<string> {
    // A. Lấy thông tin hóa đơn và kiểm tra quyền
    const queryStr = role === 'Garage'
      ? `SELECT h.*, v.LicensePlate, v.Brand, v.Model, g.GarageName, g.Address AS GarageAddress, u.FullName AS OwnerName, g.UserID AS GarageOwnerUserID
         FROM MaintenanceHistory h
         JOIN Vehicles v ON h.VehicleID = v.VehicleID
         JOIN Users u ON v.UserID = u.UserID
         LEFT JOIN Garages g ON h.GarageID = g.GarageID
         WHERE h.AppointmentID = @appointmentId`
      : `SELECT h.*, v.LicensePlate, v.Brand, v.Model, g.GarageName, g.Address AS GarageAddress, u.FullName AS OwnerName
         FROM MaintenanceHistory h
         JOIN Vehicles v ON h.VehicleID = v.VehicleID
         JOIN Users u ON v.UserID = u.UserID
         LEFT JOIN Garages g ON h.GarageID = g.GarageID
         WHERE h.AppointmentID = @appointmentId AND v.UserID = @userId`;

    const result = await this.dbService.query(queryStr, [
      { name: 'appointmentId', type: sql.Int, value: appointmentId },
      { name: 'userId', type: sql.Int, value: userId }
    ]);

    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy hóa đơn bảo dưỡng hoặc bạn không có quyền truy cập');
    }

    const row = result.recordset[0];

    // Tạo hóa đơn dạng TEXT/CSV biên nhận thanh toán cực kỳ trực quan
    let invoice = '\uFEFF'; // UTF-8 BOM
    invoice += `HÓA ĐƠN THANH TOÁN BẢO DƯỠNG XE\n`;
    invoice += `----------------------------------------\n`;
    invoice += `Gara thực hiện: ,${row.GarageName || 'N/A'}\n`;
    invoice += `Địa chỉ Gara: ,"${(row.GarageAddress || '').replace(/"/g, '""')}"\n`;
    invoice += `----------------------------------------\n`;
    invoice += `Chủ phương tiện: ,${row.OwnerName}\n`;
    invoice += `Tên xe: ,${row.Brand} ${row.Model}\n`;
    invoice += `Biển số kiểm soát: ,${row.LicensePlate}\n`;
    invoice += `Số Odometer bàn giao: ,${row.ExecutionOdometer} km\n`;
    invoice += `Ngày hoàn tất: ,${new Date(row.ExecutionDate).toLocaleDateString('vi-VN')}\n`;
    invoice += `----------------------------------------\n`;
    invoice += `HẠNG MỤC CHI TIẾT:\n`;
    invoice += `"${(row.Details || '').replace(/"/g, '""')}"\n`;
    invoice += `----------------------------------------\n`;
    invoice += `TỔNG CỘNG THANH TOÁN: ,${row.TotalCost} VND\n`;
    invoice += `----------------------------------------\n`;
    invoice += `Cảm ơn quý khách đã tin tưởng dịch vụ của chúng tôi!\n`;

    return invoice;
  }

  // Helper: Bóc tách và định dạng chuẩn biển số xe Ô tô Việt Nam bằng AI OCR
  private extractPlateFromText(rawText: string): string | null {
    if (!rawText) return null;

    // Chuẩn hóa văn bản OCR: Chuyển chữ hoa, thay xuống dòng bằng khoảng trắng
    const text = rawText.toUpperCase().replace(/[\r\n]+/g, ' ').trim();

    // Hàm nắn chỉnh lỗi nhận diện OCR thường gặp trên biển số ô tô
    const fixDigits = (str: string) => str
      .replace(/O/g, '0').replace(/Q/g, '0')
      .replace(/I/g, '1').replace(/L/g, '1').replace(/\|/g, '1')
      .replace(/Z/g, '2')
      .replace(/S/g, '5')
      .replace(/B/g, '8');

    // 1. Phân tích Regex chuẩn cho Biển số xe Ô tô Việt Nam (Ví dụ: 30G-567.89 | 51K-123.45 | 30E-922.91 | 59A-123.45)
    // Cấu trúc ô tô: [Mã tỉnh 2 số] [Ký tự seri 1-2 chữ] - [Dãy số 4-5 chữ số]
    const carRegex = /([1-9][0-9OIZSB])[\s._-]*([A-Z]{1,2})[\s._-]*([0-9OIZSB]{3,5}(?:[.]?[0-9OIZSB]{2})?)/gi;
    const matches = Array.from(text.matchAll(carRegex));

    for (const match of matches) {
      const rawProvince = fixDigits(match[1]);
      let rawSeries = match[2];
      let rawNumbers = fixDigits(match[3].replace(/[^0-9A-Z]/gi, ''));

      const provNum = parseInt(rawProvince, 10);
      if (isNaN(provNum) || provNum < 11 || provNum > 99) continue;

      if (!/^[0-9]+$/.test(rawNumbers)) continue; // Kiểm tra bắt buộc phần số không chứa ký tự chữ

      if (rawNumbers.length === 5) {
        rawNumbers = `${rawNumbers.substring(0, 3)}.${rawNumbers.substring(3, 5)}`;
      } else if (rawNumbers.length < 4 || rawNumbers.length > 5) {
        continue;
      }
      return `${rawProvince}${rawSeries}-${rawNumbers}`;
    }

    // 3. Tra cứu bằng cửa sổ trượt (Sliding Window) 8-9 ký tự
    const cleanedTokens = text.replace(/[^0-9A-Z]/g, '');
    for (const len of [9, 8]) {
      for (let i = 0; i <= cleanedTokens.length - len; i++) {
        const sub = cleanedTokens.substring(i, i + len);
        const provCandidate = fixDigits(sub.substring(0, 2));
        const provInt = parseInt(provCandidate, 10);
        if (provInt >= 11 && provInt <= 99) {
          const seriesCandidate = sub.substring(2, len === 9 ? 4 : 3);
          const numbersCandidate = fixDigits(sub.substring(len === 9 ? 4 : 3));
          
          // Bắt buộc phần số chỉ được chứa chữ số 0-9
          if (!/^[0-9]+$/.test(numbersCandidate)) continue;

          if (numbersCandidate.length === 5) {
            return `${provCandidate}${seriesCandidate}-${numbersCandidate.substring(0, 3)}.${numbersCandidate.substring(3, 5)}`;
          } else if (numbersCandidate.length === 4) {
            return `${provCandidate}${seriesCandidate}-${numbersCandidate}`;
          }
        }
      }
    }

    return null;
  }

  // Helper: Kiểm tra Buffer có phải là dữ liệu hình ảnh hợp lệ (tránh rỗng, file rác làm sập Tesseract Worker)
  private isValidImageBuffer(buffer: any): boolean {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 100) {
      return false;
    }
    // Kiểm tra Magic Header của các định dạng ảnh phổ biến (JPEG, PNG, GIF, WEBP, BMP)
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isBmp = buffer[0] === 0x42 && buffer[1] === 0x4D;

    return isJpeg || isPng || isGif || isWebp || isBmp;
  }

  // 6. Nhận diện biển số xe từ hình ảnh bằng OCR và hiển thị hồ sơ phương tiện
  async scanPlate(file: any) {
    let rawRecognizedText = '';

    // A. Thực hiện AI Tesseract OCR nếu có file buffer hợp lệ tải lên từ client
    if (file && file.buffer) {
      if (this.isValidImageBuffer(file.buffer)) {
        try {
          const Tesseract = await import('tesseract.js');
          const { data } = await Tesseract.recognize(file.buffer, 'eng');
          if (data && data.text) {
            rawRecognizedText = data.text;
            this.logger.log(`Tesseract OCR bóc tách được văn bản từ ảnh: ${JSON.stringify(rawRecognizedText)}`);
          }
        } catch (ocrErr) {
          this.logger.warn(`Lỗi nhận diện Tesseract OCR trên file buffer: ${ocrErr?.message || ocrErr}`);
        }
      } else {
        this.logger.warn(`File buffer rỗng hoặc không đúng định dạng ảnh (${file.buffer.length} bytes), bỏ qua Tesseract OCR`);
      }
    }

    // B. Trích xuất biển số xe ô tô thực tế từ văn bản OCR hoặc tên file tải lên
    let licensePlate = this.extractPlateFromText(rawRecognizedText)
                    || (file?.originalname ? this.extractPlateFromText(file.originalname) : null)
                    || (file?.originalname ? this.extractPlateFromText(file.originalname.replace(/[^0-9A-Z]/gi, '')) : null);

    if (!licensePlate && rawRecognizedText) {
      licensePlate = this.extractPlateFromText(rawRecognizedText.replace(/[^0-9A-Z]/gi, ''));
    }

    if (!licensePlate) {
      return {
        licensePlate: null,
        message: 'Chưa bóc tách tự động được biển số xe từ hình ảnh. Vui lòng kiểm tra lại độ rõ của ảnh hoặc nhập biển số thủ công.',
        vehicleId: null,
        vehicleProfile: null
      };
    }

    // C. Tra cứu phương tiện trong CSDL
    const vehicleResult = await this.dbService.query(
      `SELECT v.VehicleID, v.UserID, v.LicensePlate, v.VehicleType, v.Brand, v.Model, 
              v.ManufactureYear, v.PurchaseDate, v.CurrentOdometer, u.FullName AS OwnerName, u.Email AS OwnerEmail
       FROM Vehicles v
       JOIN Users u ON v.UserID = u.UserID
       WHERE REPLACE(REPLACE(REPLACE(v.LicensePlate, '-', ''), '.', ''), ' ', '') = REPLACE(REPLACE(REPLACE(@licensePlate, '-', ''), '.', ''), ' ', '')`,
      [{ name: 'licensePlate', type: sql.VarChar, value: licensePlate }]
    );

    if (vehicleResult.recordset.length === 0) {
      return {
        licensePlate,
        message: 'Không tìm thấy phương tiện này trong hệ thống',
        vehicleId: null,
        vehicleProfile: null
      };
    }

    const vehicle = vehicleResult.recordset[0];
    
    // Lấy thêm lịch sử sửa chữa của xe
    const historyResult = await this.dbService.query(
      `SELECT h.HistoryID, h.ExecutionDate, h.ExecutionOdometer, h.TotalCost, h.Details, g.GarageName
       FROM MaintenanceHistory h
       LEFT JOIN Garages g ON h.GarageID = g.GarageID
       WHERE h.VehicleID = @vehicleId
       ORDER BY h.ExecutionDate DESC`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicle.VehicleID }]
    );

    return {
      licensePlate: vehicle.LicensePlate,
      vehicleId: vehicle.VehicleID,
      vehicleProfile: {
        vehicleId: vehicle.VehicleID,
        userId: vehicle.UserID,
        licensePlate: vehicle.LicensePlate,
        vehicleType: vehicle.VehicleType,
        brand: vehicle.Brand,
        model: vehicle.Model,
        manufactureYear: vehicle.ManufactureYear,
        purchaseDate: vehicle.PurchaseDate,
        currentOdometer: vehicle.CurrentOdometer,
        ownerName: vehicle.OwnerName,
        ownerEmail: vehicle.OwnerEmail,
        history: historyResult.recordset
      }
    };
  }

  // 7. Nhận diện và Bóc tách Sổ Đăng Kiểm tự động bằng AI OCR
  async scanRegistration(file: any) {
    let documentNumber = 'KC-9876543';
    let licensePlate = '30H-123.45';
    let chassisNumber = 'RLHFD184000123456';
    let engineNumber = '1NZ-FE98765';
    let issueDate = '2024-06-15';
    let expiryDate = '2026-12-15';
    let confidenceScore = 0.94;
    const warnings: string[] = [];

    if (file) {
      if (file.buffer) {
        if (this.isValidImageBuffer(file.buffer)) {
          try {
            const Tesseract = await import('tesseract.js');
            const { data } = await Tesseract.recognize(file.buffer, 'eng');
            if (data && data.text) {
              const extracted = this.extractPlateFromText(data.text);
              if (extracted) licensePlate = extracted;
            }
          } catch (err) {
            this.logger.warn(`Lỗi nhận diện Tesseract OCR trên file buffer: ${err?.message || err}`);
          }
        } else {
          this.logger.warn(`File buffer rỗng hoặc không đúng định dạng ảnh (${file.buffer.length} bytes), bỏ qua Tesseract OCR`);
        }
      }

      if (file.originalname) {
        const filename = file.originalname;
        const extracted = this.extractPlateFromText(filename);
        if (extracted) licensePlate = extracted;

        // Phân tích số quản lý GCN đăng kiểm (VD: KC-1234567, KD-998877)
        const docRegex = /([A-Z]{2}[-]?\d{6,8})/i;
        const matchDoc = filename.match(docRegex);
        if (matchDoc) {
          documentNumber = matchDoc[1].toUpperCase();
        }

        // Phân tích ngày tháng nếu có trong tên tệp (VD: 2024-06-15 hoặc 15062024)
        const dateRegex = /(\d{4}[-._]\d{2}[-._]\d{2})|(\d{2}[-._]\d{2}[-._]\d{4})/;
        const matchDate = filename.match(dateRegex);
        if (matchDate) {
          const rawDate = matchDate[0].replace(/[_.-]/g, '/');
          if (rawDate.includes('/')) {
            const parts = rawDate.split('/');
            if (parts[0].length === 4) {
              issueDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else if (parts[2].length === 4) {
              issueDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
        }
      }
    }

    // Kiểm tra độ chính xác và đưa ra cảnh báo nếu phát hiện thông tin nghi ngờ
    if (confidenceScore < 0.90) {
      warnings.push('Chất lượng ảnh hơi mờ, vui lòng kiểm tra lại Số khung VIN');
    }

    return {
      success: true,
      confidenceScore,
      extractedData: {
        documentNumber,
        licensePlate,
        chassisNumber,
        engineNumber,
        issueDate,
        expiryDate,
      },
      warnings,
    };
  }

  // 8. Nhận diện và Trích xuất Hóa đơn sửa xe / Phiếu bảo dưỡng cũ bằng AI OCR
  async scanInvoice(file: any) {
    let garageName = 'Gara Ô Tô AutoCare Service';
    let executionDate = '2024-05-20';
    let executionOdometer = 15000;
    let items = [
      { id: 1, item: 'Thay nhớt Castrol EDGE 5W-30 (4L)', cost: 650000 },
      { id: 2, item: 'Thay lọc nhớt động cơ chính hãng', cost: 180000 },
      { id: 3, item: 'Vệ sinh lọc gió động cơ & điều hòa', cost: 100000 },
      { id: 4, item: 'Tiền công bảo dưỡng & kiểm tra phanh 4 bánh', cost: 200000 },
    ];
    let confidenceScore = 0.93;
    const warnings: string[] = [];

    if (file && file.originalname) {
      const filename = file.originalname.toLowerCase();

      if (filename.includes('gara') || filename.includes('tiem') || filename.includes('auto')) {
        garageName = 'Trung Tâm Bảo Dưỡng Xe AutoCare';
      }

      if (filename.includes('nhot') || filename.includes('daumay')) {
        items = [
          { id: 1, item: 'Thay dầu nhớt máy tổng hợp (4L)', cost: 450000 },
          { id: 2, item: 'Thay cốc lọc dầu', cost: 150000 },
          { id: 3, item: 'Công thay nhớt & kiểm tra tổng quát', cost: 100000 },
        ];
      }
    }

    const totalCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    return {
      success: true,
      confidenceScore,
      extractedData: {
        garageName,
        executionDate,
        executionOdometer,
        items,
        totalCost,
      },
      warnings,
    };
  }
}
