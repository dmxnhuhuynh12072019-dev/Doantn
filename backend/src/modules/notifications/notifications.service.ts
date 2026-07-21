import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron } from '@nestjs/schedule';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { SendCompletionDto } from './dto/send-completion.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private dbService: DatabaseService,
    private mailerService: MailerService,
  ) {}

  // 1. Tạo thông báo mới (In-app và/hoặc Email)
  async create(userId: number, title: string, message: string, type: 'Email' | 'InApp' | 'All') {
    // Lưu vào cơ sở dữ liệu nếu loại thông báo là InApp hoặc All
    if (type === 'InApp' || type === 'All') {
      await this.dbService.query(
        `INSERT INTO Notifications (UserID, Title, Message, NotificationType, IsRead, CreatedAt)
         VALUES (@userId, @title, @message, @type, 0, GETDATE())`,
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'title', type: sql.NVarChar, value: title },
          { name: 'message', type: sql.NVarChar, value: message },
          { name: 'type', type: sql.VarChar, value: type },
        ]
      );
    }

    // Gửi email nếu loại thông báo là Email hoặc All
    if (type === 'Email' || type === 'All') {
      const userResult = await this.dbService.query(
        'SELECT Email, FullName FROM Users WHERE UserID = @userId',
        [{ name: 'userId', type: sql.Int, value: userId }]
      );

      if (userResult.recordset.length > 0) {
        const { Email, FullName } = userResult.recordset[0];
        try {
          await this.mailerService.sendMail({
            to: Email,
            subject: title,
            text: `Chào ${FullName},\n\n${message}\n\nTrân trọng,\nĐội ngũ AutoCare Office Helper (ACOH).`,
          });
          this.logger.log(`Đã gửi email thông báo thành công đến: ${Email}`);
        } catch (err) {
          this.logger.warn(`Không thể gửi email qua SMTP đến ${Email}. Lỗi: ${err.message}`);
        }
      }
    }

    return { message: 'Tạo thông báo thành công!' };
  }

  // 2. Lấy danh sách thông báo của người dùng (Chưa đọc lên trước)
  async findAllByUser(userId: number) {
    const result = await this.dbService.query(
      `SELECT * FROM Notifications 
       WHERE UserID = @userId 
       ORDER BY IsRead ASC, CreatedAt DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    return result.recordset;
  }

  // 3. Đánh dấu một thông báo là đã đọc
  async markAsRead(id: number, userId: number) {
    const checkResult = await this.dbService.query(
      'SELECT UserID FROM Notifications WHERE NotificationID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (checkResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông báo này');
    }

    if (checkResult.recordset[0].UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên thông báo này');
    }

    await this.dbService.query(
      'UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    return { message: 'Đã đánh dấu đọc thông báo!' };
  }

  // 4. Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(userId: number) {
    await this.dbService.query(
      'UPDATE Notifications SET IsRead = 1 WHERE UserID = @userId AND IsRead = 0',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    return { message: 'Đã đánh dấu đọc tất cả thông báo!' };
  }

  // 5. API Gara gửi thông báo khi xe hoàn tất bảo dưỡng
  async sendCompletionNotification(userId: number, role: string, dto: SendCompletionDto) {
    if (role !== 'Admin' && role !== 'Garage') {
      throw new ForbiddenException('Chỉ tài khoản Gara hoặc Admin mới có quyền gửi thông báo hoàn tất bảo dưỡng');
    }

    // 1. Kiểm tra xe và lấy thông tin chủ xe
    const vehicleResult = await this.dbService.query(
      'SELECT UserID, LicensePlate FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: dto.vehicleId }]
    );

    if (vehicleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này');
    }

    const { UserID: ownerId, LicensePlate } = vehicleResult.recordset[0];

    // 2. Lấy tên gara
    let garageName = 'Gara đối tác';
    if (dto.garageId) {
      const garaResult = await this.dbService.query(
        'SELECT GarageName FROM Garages WHERE GarageID = @garageId',
        [{ name: 'garageId', type: sql.Int, value: dto.garageId }]
      );
      if (garaResult.recordset.length > 0) {
        garageName = garaResult.recordset[0].GarageName;
      }
    }

    const title = `[ACOH] Thông báo hoàn tất bảo dưỡng xe ${LicensePlate}`;
    const message = `Xe ${LicensePlate} của bạn đã hoàn tất quá trình bảo dưỡng và sửa chữa tại ${garageName}. Mời bạn đến nhận xe.\nChi tiết dịch vụ: ${dto.details}`;

    return this.create(ownerId, title, message, 'All');
  }

  // 6. Cron Job chạy ngầm quét hệ thống hàng ngày lúc 00:00
  @Cron('0 0 * * *')
  async handleCron() {
    this.logger.log('Bắt đầu chạy quét hệ thống hàng ngày (Cron Job)...');
    await this.runSystemScan();
    this.logger.log('Hoàn thành quét hệ thống hàng ngày.');
  }

  // 7. Hàm quét hệ thống chính (Expose cho cả controller test gọi thủ công)
  async runSystemScan() {
    let notificationsCount = 0;

    // --- QUÉT 1: GIẤY TỜ PHÁP LÝ & BẢO HIỂM SẮP HẾT HẠN ---
    const expiredDocs = await this.dbService.query(
      `SELECT ld.DocumentID, ld.DocumentType, ld.ExpiryDate, ld.AlertThresholdDays, 
              v.LicensePlate, v.UserID, u.Email, u.FullName,
              DATEDIFF(day, GETDATE(), ld.ExpiryDate) AS DaysRemaining
       FROM LegalDocuments ld
       JOIN Vehicles v ON ld.VehicleID = v.VehicleID
       JOIN Users u ON v.UserID = u.UserID
       WHERE ld.Status != N'Quá hạn'
         AND DATEDIFF(day, GETDATE(), ld.ExpiryDate) >= 0
         AND DATEDIFF(day, GETDATE(), ld.ExpiryDate) <= ld.AlertThresholdDays`
    );

    for (const doc of expiredDocs.recordset) {
      const title = `[ACOH] Cảnh báo giấy tờ xe ${doc.LicensePlate} sắp hết hạn`;
      const message = `Chào ${doc.FullName},\n\nGiấy tờ loại "${doc.DocumentType}" của xe ${doc.LicensePlate} sắp hết hạn vào ngày ${new Date(doc.ExpiryDate).toLocaleDateString('vi-VN')} (còn ${doc.DaysRemaining} ngày).\n\nVui lòng kiểm tra và gia hạn sớm trên hệ thống để đảm bảo lưu thông hợp pháp.`;
      
      // Chống gửi trùng lặp nếu người dùng chưa đọc thông báo cảnh báo trước đó
      const checkDup = await this.dbService.query(
        'SELECT TOP 1 1 FROM Notifications WHERE UserID = @userId AND Title = @title AND IsRead = 0',
        [
          { name: 'userId', type: sql.Int, value: doc.UserID },
          { name: 'title', type: sql.NVarChar, value: title }
        ]
      );

      if (checkDup.recordset.length === 0) {
        await this.create(doc.UserID, title, message, 'All');
        notificationsCount++;
      }
    }

    // --- QUÉT 2: LỊCH NHẮC BẢO DƯỠNG SẮP TỚI THEO NGÀY ---
    const dateSchedules = await this.dbService.query(
      `SELECT ms.ScheduleID, ms.CategoryName, ms.TargetDate, 
              v.LicensePlate, v.UserID, u.FullName,
              DATEDIFF(day, GETDATE(), ms.TargetDate) AS DaysRemaining
       FROM MaintenanceSchedules ms
       JOIN Vehicles v ON ms.VehicleID = v.VehicleID
       JOIN Users u ON v.UserID = u.UserID
       WHERE ms.Status = N'Chưa thực hiện'
         AND ms.TargetDate IS NOT NULL
         AND DATEDIFF(day, GETDATE(), ms.TargetDate) >= 0
         AND DATEDIFF(day, GETDATE(), ms.TargetDate) <= 7`
    );

    for (const sched of dateSchedules.recordset) {
      const title = `[ACOH] Nhắc nhở: Lịch bảo dưỡng xe ${sched.LicensePlate} sắp tới`;
      const message = `Chào ${sched.FullName},\n\nLịch nhắc bảo dưỡng định kỳ hạng mục "${sched.CategoryName}" của xe ${sched.LicensePlate} sắp đến ngày thực hiện: ${new Date(sched.TargetDate).toLocaleDateString('vi-VN')} (còn ${sched.DaysRemaining} ngày).\n\nVui lòng sắp xếp thời gian đưa xe đến gara đối tác để kiểm tra.`;

      const checkDup = await this.dbService.query(
        'SELECT TOP 1 1 FROM Notifications WHERE UserID = @userId AND Title = @title AND IsRead = 0',
        [
          { name: 'userId', type: sql.Int, value: sched.UserID },
          { name: 'title', type: sql.NVarChar, value: title }
        ]
      );

      if (checkDup.recordset.length === 0) {
        await this.create(sched.UserID, title, message, 'All');
        notificationsCount++;
      }
    }

    // --- QUÉT 3: LỊCH NHẮC BẢO DƯỠNG SẮP TỚI THEO KILOMET (ODOMETER) ---
    const odoSchedules = await this.dbService.query(
      `SELECT ms.ScheduleID, ms.CategoryName, ms.TargetOdometer, ms.AlertThresholdKM,
              v.LicensePlate, v.CurrentOdometer, v.UserID, u.FullName
       FROM MaintenanceSchedules ms
       JOIN Vehicles v ON ms.VehicleID = v.VehicleID
       JOIN Users u ON v.UserID = u.UserID
       WHERE ms.Status = N'Chưa thực hiện'
         AND ms.TargetOdometer IS NOT NULL
         AND (ms.TargetOdometer - v.CurrentOdometer) >= 0
         AND (ms.TargetOdometer - v.CurrentOdometer) <= ms.AlertThresholdKM`
    );

    for (const sched of odoSchedules.recordset) {
      const kmRemaining = sched.TargetOdometer - sched.CurrentOdometer;
      const title = `[ACOH] Nhắc nhở: Bảo dưỡng xe ${sched.LicensePlate} theo số km`;
      const message = `Chào ${sched.FullName},\n\nPhương tiện ${sched.LicensePlate} sắp đạt mốc kilomet bảo dưỡng ${sched.TargetOdometer.toLocaleString()} km (chỉ còn ${kmRemaining.toLocaleString()} km nữa, số km hiện tại: ${sched.CurrentOdometer.toLocaleString()} km).\n\nHạng mục cần thực hiện: "${sched.CategoryName}". Vui lòng theo dõi và đặt lịch bảo dưỡng.`;

      const checkDup = await this.dbService.query(
        'SELECT TOP 1 1 FROM Notifications WHERE UserID = @userId AND Title = @title AND IsRead = 0',
        [
          { name: 'userId', type: sql.Int, value: sched.UserID },
          { name: 'title', type: sql.NVarChar, value: title }
        ]
      );

      if (checkDup.recordset.length === 0) {
        await this.create(sched.UserID, title, message, 'All');
        notificationsCount++;
      }
    }

    this.logger.log(`Đã hoàn thành quét hệ thống. Số thông báo mới được tạo: ${notificationsCount}`);
    return {
      message: 'Đã chạy quét hệ thống thành công!',
      newNotificationsCount: notificationsCount,
    };
  }
}
