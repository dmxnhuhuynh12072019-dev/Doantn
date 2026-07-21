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
             `- **Đối với Xe máy:** Thay nhớt sau mỗi **1.500 km - 2.000 km**. Cứ mỗi 2 lần thay nhớt máy thì nên thay 1 lần nhớt hộp số (nhớt láp đối với xe tay ga).\n` +
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
}
