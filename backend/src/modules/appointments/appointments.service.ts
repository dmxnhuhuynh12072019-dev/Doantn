import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private dbService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  // Tiện ích: Lấy GarageID từ UserID của tài khoản Gara
  private async getGarageIdByUserId(userId: number): Promise<number> {
    const result = await this.dbService.query(
      'SELECT GarageID FROM Garages WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length === 0) {
      throw new ForbiddenException('Tài khoản này chưa được liên kết với Gara đối tác nào.');
    }

    return result.recordset[0].GarageID;
  }

  // Đặt lịch hẹn mới (Dành cho User)
  async create(userId: number, dto: CreateAppointmentDto) {
    // 1. Kiểm tra xe có thuộc sở hữu của User không
    const vehicleCheck = await this.dbService.query(
      'SELECT UserID, LicensePlate FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: dto.vehicleId }]
    );

    if (vehicleCheck.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này.');
    }

    if (vehicleCheck.recordset[0].UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền đặt lịch cho xe của người khác.');
    }

    const { LicensePlate } = vehicleCheck.recordset[0];

    // 2. Kiểm tra Gara có tồn tại không
    const garageCheck = await this.dbService.query(
      'SELECT GarageName, UserID FROM Garages WHERE GarageID = @garageId AND IsActive = 1',
      [{ name: 'garageId', type: sql.Int, value: dto.garageId }]
    );

    if (garageCheck.recordset.length === 0) {
      throw new NotFoundException('Gara này không tồn tại hoặc đã ngừng hoạt động.');
    }

    const { GarageName, UserID: garageOwnerUserId } = garageCheck.recordset[0];

    // 3. Tiến hành thêm lịch đặt hẹn
    const result = await this.dbService.query(
      `INSERT INTO Appointments (UserID, GarageID, VehicleID, AppointmentDate, Status, Notes, CreatedAt)
       OUTPUT INSERTED.AppointmentID
       VALUES (@userId, @garageId, @vehicleId, @appointmentDate, N'Chờ xác nhận', @notes, GETDATE())`,
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'garageId', type: sql.Int, value: dto.garageId },
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'appointmentDate', type: sql.DateTime, value: dto.appointmentDate },
        { name: 'notes', type: sql.NVarChar, value: dto.notes || null },
      ]
    );

    const appointmentId = result.recordset[0].AppointmentID;

    // 4. Gửi thông báo đến chủ Gara (in-app & email)
    if (garageOwnerUserId) {
      try {
        const title = `[ACOH] Lịch hẹn đặt xe mới từ khách hàng`;
        const message = `Xe biển số ${LicensePlate} vừa đặt lịch hẹn tại tiệm của bạn vào ngày ${new Date(dto.appointmentDate).toLocaleString('vi-VN')}.\nGhi chú khách hàng: ${dto.notes || 'Không có.'}`;
        await this.notificationsService.create(garageOwnerUserId, title, message, 'All');
      } catch (err) {
        this.logger.warn(`Không thể gửi thông báo đặt lịch đến chủ Gara: ${err.message}`);
      }
    }

    return {
      message: 'Đặt lịch hẹn bảo dưỡng thành công!',
      appointmentId
    };
  }

  // Lấy lịch hẹn của User
  async findAllForUser(userId: number) {
    const result = await this.dbService.query(
      `SELECT a.*, v.LicensePlate, v.Brand, v.Model, v.VehicleType, g.GarageName, g.Address AS GarageAddress, g.Phone AS GaragePhone
       FROM Appointments a
       JOIN Vehicles v ON a.VehicleID = v.VehicleID
       JOIN Garages g ON a.GarageID = g.GarageID
       WHERE a.UserID = @userId
       ORDER BY a.AppointmentDate DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    return result.recordset;
  }

  // Lấy lịch hẹn của Gara (Dành cho Gara)
  async findAllForGarage(userId: number) {
    const garageId = await this.getGarageIdByUserId(userId);

    const result = await this.dbService.query(
      `SELECT a.*, v.LicensePlate, v.Brand, v.Model, v.VehicleType, u.FullName AS OwnerName, u.PhoneNumber AS OwnerPhone
       FROM Appointments a
       JOIN Vehicles v ON a.VehicleID = v.VehicleID
       JOIN Users u ON a.UserID = u.UserID
       WHERE a.GarageID = @garageId
       ORDER BY a.AppointmentDate DESC`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    return result.recordset;
  }

  // Cập nhật trạng thái lịch hẹn (Xác nhận, Đang sửa chữa, Hủy lịch)
  async updateStatus(id: number, userId: number, role: string, dto: UpdateStatusDto) {
    const appointmentResult = await this.dbService.query(
      'SELECT * FROM Appointments WHERE AppointmentID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (appointmentResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin lịch hẹn này.');
    }

    const appt = appointmentResult.recordset[0];

    // Quyền kiểm soát:
    // - User chỉ được phép HỦY LỊCH của chính họ khi lịch hẹn đang ở trạng thái 'Chờ xác nhận' hoặc 'Đã xác nhận'.
    // - Gara chỉ được phép thay đổi lịch hẹn thuộc về Gara đó.
    if (role === 'User') {
      if (appt.UserID !== userId) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa lịch hẹn này.');
      }
      if (dto.status !== 'Hủy lịch') {
        throw new BadRequestException('Khách hàng chỉ được phép hủy lịch hẹn.');
      }
      if (appt.Status === 'Hoàn thành' || appt.Status === 'Đang sửa chữa') {
        throw new BadRequestException('Không thể hủy lịch khi xe đang sửa chữa hoặc đã hoàn thành.');
      }
    } else if (role === 'Garage') {
      const garageId = await this.getGarageIdByUserId(userId);
      if (appt.GarageID !== garageId) {
        throw new ForbiddenException('Lịch hẹn này không thuộc về Gara của bạn.');
      }
      if (appt.Status === 'Hoàn thành' && dto.status !== 'Hoàn thành') {
        throw new BadRequestException('Lịch hẹn đã hoàn tất, không thể thay đổi trạng thái khác.');
      }
    }

    // Tiến hành cập nhật trạng thái
    await this.dbService.query(
      'UPDATE Appointments SET Status = @status WHERE AppointmentID = @id',
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'status', type: sql.NVarChar, value: dto.status }
      ]
    );

    // Gửi thông báo nếu người thay đổi trạng thái là Gara
    if (role === 'Garage') {
      try {
        const garageInfo = await this.dbService.query(
          'SELECT GarageName FROM Garages WHERE GarageID = @garageId',
          [{ name: 'garageId', type: sql.Int, value: appt.GarageID }]
        );
        const garageName = garageInfo.recordset[0]?.GarageName || 'Gara đối tác';

        const vehicleInfo = await this.dbService.query(
          'SELECT LicensePlate FROM Vehicles WHERE VehicleID = @vehicleId',
          [{ name: 'vehicleId', type: sql.Int, value: appt.VehicleID }]
        );
        const licensePlate = vehicleInfo.recordset[0]?.LicensePlate || '';

        const title = `[ACOH] Lịch hẹn xe ${licensePlate} đã thay đổi trạng thái`;
        const message = `Lịch hẹn bảo dưỡng xe ${licensePlate} của bạn tại ${garageName} đã chuyển sang trạng thái: "${dto.status}".`;
        
        await this.notificationsService.create(appt.UserID, title, message, 'All');
      } catch (err) {
        this.logger.warn(`Không thể gửi thông báo cập nhật trạng thái đến User: ${err.message}`);
      }
    }

    return { message: `Cập nhật trạng thái lịch hẹn thành công!` };
  }

  // Hoàn tất sửa chữa & ghi nhận bảo dưỡng (Gara xác nhận hoàn thành sửa chữa)
  async completeAndNotify(id: number, userId: number, role: string, dto: CompleteAppointmentDto) {
    const appointmentResult = await this.dbService.query(
      'SELECT * FROM Appointments WHERE AppointmentID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (appointmentResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin lịch hẹn này.');
    }

    const appt = appointmentResult.recordset[0];

    // Chỉ Gara sở hữu lịch hẹn này hoặc Admin được quyền hoàn tất
    let garageId: number;
    if (role === 'Admin') {
      garageId = appt.GarageID;
    } else if (role === 'Garage') {
      garageId = await this.getGarageIdByUserId(userId);
      if (appt.GarageID !== garageId) {
        throw new ForbiddenException('Lịch hẹn này không thuộc về Gara của bạn.');
      }
    } else {
      throw new ForbiddenException('Vai trò của bạn không được phép hoàn tất lịch hẹn.');
    }

    if (appt.Status === 'Hoàn thành') {
      throw new BadRequestException('Lịch hẹn này đã hoàn tất trước đó.');
    }

    // Tiến hành các bước nghiệp vụ:
    // 1. Cập nhật trạng thái lịch hẹn thành 'Hoàn thành'
    await this.dbService.query(
      "UPDATE Appointments SET Status = N'Hoàn thành' WHERE AppointmentID = @id",
      [{ name: 'id', type: sql.Int, value: id }]
    );

    // 2. Thêm một bản ghi vào MaintenanceHistory
    await this.dbService.query(
      `INSERT INTO MaintenanceHistory (VehicleID, GarageID, AppointmentID, ExecutionDate, ExecutionOdometer, TotalCost, Details)
       VALUES (@vehicleId, @garageId, @appointmentId, GETDATE(), @odometer, @totalCost, @details)`,
      [
        { name: 'vehicleId', type: sql.Int, value: appt.VehicleID },
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'appointmentId', type: sql.Int, value: id },
        { name: 'odometer', type: sql.Int, value: dto.odometer },
        { name: 'totalCost', type: sql.Decimal(18, 2), value: dto.totalCost },
        { name: 'details', type: sql.NVarChar, value: dto.details }
      ]
    );

    // 3. Cập nhật số Odo hiện tại của xe nếu Odo mới lớn hơn Odo cũ
    const vehicleResult = await this.dbService.query(
      'SELECT CurrentOdometer, LicensePlate, UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: appt.VehicleID }]
    );

    if (vehicleResult.recordset.length > 0) {
      const vehicle = vehicleResult.recordset[0];
      if (dto.odometer > vehicle.CurrentOdometer) {
        await this.dbService.query(
          'UPDATE Vehicles SET CurrentOdometer = @odometer, UpdatedAt = GETDATE() WHERE VehicleID = @vehicleId',
          [
            { name: 'odometer', type: sql.Int, value: dto.odometer },
            { name: 'vehicleId', type: sql.Int, value: appt.VehicleID }
          ]
        );
      }

      // 4. Tự động đánh dấu lịch nhắc bảo dưỡng (MaintenanceSchedules) trùng khớp thành 'Đã hoàn thành'
      await this.dbService.query(
        `UPDATE MaintenanceSchedules
         SET Status = N'Đã hoàn thành'
         WHERE VehicleID = @vehicleId 
           AND Status = N'Chưa thực hiện'
           AND (CategoryName LIKE '%' + @details + '%' OR @details LIKE '%' + CategoryName + '%')`,
        [
          { name: 'vehicleId', type: sql.Int, value: appt.VehicleID },
          { name: 'details', type: sql.NVarChar, value: dto.details }
        ]
      );

      // 5. Gửi thông báo cho Chủ xe báo hoàn tất
      try {
        const garageResult = await this.dbService.query(
          'SELECT GarageName FROM Garages WHERE GarageID = @garageId',
          [{ name: 'garageId', type: sql.Int, value: garageId }]
        );
        const garageName = garageResult.recordset[0]?.GarageName || 'Gara đối tác';

        const title = `[ACOH] Thông báo hoàn tất bảo dưỡng xe ${vehicle.LicensePlate}`;
        const message = `Xe ${vehicle.LicensePlate} của bạn đã hoàn tất bảo dưỡng và sửa chữa tại ${garageName}. Mời bạn đến nhận xe.\nChi tiết dịch vụ: ${dto.details}\nTổng chi phí: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dto.totalCost)}`;
        
        await this.notificationsService.create(vehicle.UserID, title, message, 'All');
      } catch (err) {
        this.logger.warn(`Không thể gửi thông báo hoàn tất lịch hẹn bảo dưỡng: ${err.message}`);
      }
    }

    return { message: 'Xác nhận hoàn tất bảo dưỡng lịch hẹn thành công!' };
  }
}
