import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateHistoryGarageDto } from './dto/create-history-garage.dto';

@Injectable()
export class MaintenancesService {
  constructor(private dbService: DatabaseService) {}

  // Kiểm tra quyền truy cập của người dùng đối với xe
  private async checkVehicleAccess(vehicleId: number, userId: number, role: string) {
    const result = await this.dbService.query(
      'SELECT * FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    if (result.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này');
    }

    const vehicle = result.recordset[0];

    if (role === 'Admin') {
      return vehicle;
    }

    if (role === 'User') {
      if (vehicle.UserID !== userId) {
        throw new ForbiddenException('Bạn không có quyền truy cập phương tiện này');
      }
      return vehicle;
    }

    if (role === 'Garage') {
      // Tìm GarageID liên kết với tài khoản
      const garageResult = await this.dbService.query(
        'SELECT GarageID FROM Garages WHERE UserID = @userId',
        [{ name: 'userId', type: sql.Int, value: userId }]
      );

      if (garageResult.recordset.length === 0) {
        throw new ForbiddenException('Tài khoản này chưa được liên kết với Garage nào');
      }

      const garageId = garageResult.recordset[0].GarageID;

      // Kiểm tra xem Gara có từng làm dịch vụ hoặc có hẹn lịch với xe này không
      const apptResult = await this.dbService.query(
        `SELECT TOP 1 1 FROM Appointments WHERE VehicleID = @vehicleId AND GarageID = @garageId
         UNION
         SELECT TOP 1 1 FROM MaintenanceHistory WHERE VehicleID = @vehicleId AND GarageID = @garageId`,
        [
          { name: 'vehicleId', type: sql.Int, value: vehicleId },
          { name: 'garageId', type: sql.Int, value: garageId }
        ]
      );

      if (apptResult.recordset.length === 0) {
        throw new ForbiddenException('Bạn không có quyền truy cập xe này (chưa có lịch sử giao dịch)');
      }

      return vehicle;
    }

    throw new ForbiddenException('Vai trò người dùng không hợp lệ');
  }

  // Lấy lịch nhắc bảo dưỡng
  async getSchedules(vehicleId: number, userId: number, role: string) {
    await this.checkVehicleAccess(vehicleId, userId, role);

    const result = await this.dbService.query(
      `SELECT * FROM MaintenanceSchedules 
       WHERE VehicleID = @vehicleId 
       ORDER BY Status DESC, TargetOdometer ASC, TargetDate ASC`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    return result.recordset;
  }

  // Tạo lịch nhắc bảo dưỡng mới
  async createSchedule(userId: number, role: string, dto: CreateScheduleDto) {
    // Chỉ chủ xe (User) hoặc Admin mới được phép tạo
    const vehicle = await this.dbService.query(
      'SELECT UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: dto.vehicleId }]
    );

    if (vehicle.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện');
    }

    if (role !== 'Admin' && vehicle.recordset[0].UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền tạo lịch nhắc cho xe của người khác');
    }

    const alertThresholdKM = dto.alertThresholdKM !== undefined ? dto.alertThresholdKM : 500;

    const result = await this.dbService.query(
      `INSERT INTO MaintenanceSchedules (VehicleID, CategoryName, TargetOdometer, TargetDate, AlertThresholdKM, Status, Notes)
       OUTPUT INSERTED.ScheduleID
       VALUES (@vehicleId, @categoryName, @targetOdometer, @targetDate, @alertThresholdKM, N'Chưa thực hiện', @notes)`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'categoryName', type: sql.NVarChar, value: dto.categoryName },
        { name: 'targetOdometer', type: sql.Int, value: dto.targetOdometer || null },
        { name: 'targetDate', type: sql.Date, value: dto.targetDate || null },
        { name: 'alertThresholdKM', type: sql.Int, value: alertThresholdKM },
        { name: 'notes', type: sql.NVarChar, value: dto.notes || null },
      ]
    );

    return {
      message: 'Tạo lịch nhắc bảo dưỡng thành công!',
      scheduleId: result.recordset[0].ScheduleID,
    };
  }

  // Cập nhật lịch nhắc bảo dưỡng
  async updateSchedule(id: number, userId: number, role: string, dto: UpdateScheduleDto) {
    const scheduleResult = await this.dbService.query(
      'SELECT * FROM MaintenanceSchedules WHERE ScheduleID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (scheduleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy lịch nhắc bảo dưỡng');
    }

    const schedule = scheduleResult.recordset[0];
    
    // Check quyền sở hữu xe
    const vehicle = await this.dbService.query(
      'SELECT UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: schedule.VehicleID }]
    );

    if (role !== 'Admin' && vehicle.recordset[0].UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa lịch nhắc này');
    }

    const merged = {
      CategoryName: dto.categoryName !== undefined ? dto.categoryName : schedule.CategoryName,
      TargetOdometer: dto.targetOdometer !== undefined ? dto.targetOdometer : schedule.TargetOdometer,
      TargetDate: dto.targetDate !== undefined ? dto.targetDate : schedule.TargetDate,
      AlertThresholdKM: dto.alertThresholdKM !== undefined ? dto.alertThresholdKM : schedule.AlertThresholdKM,
      Status: dto.status !== undefined ? dto.status : schedule.Status,
      Notes: dto.notes !== undefined ? dto.notes : schedule.Notes,
    };

    await this.dbService.query(
      `UPDATE MaintenanceSchedules
       SET CategoryName = @categoryName,
           TargetOdometer = @targetOdometer,
           TargetDate = @targetDate,
           AlertThresholdKM = @alertThresholdKM,
           Status = @status,
           Notes = @notes
       WHERE ScheduleID = @id`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'categoryName', type: sql.NVarChar, value: merged.CategoryName },
        { name: 'targetOdometer', type: sql.Int, value: merged.TargetOdometer },
        { name: 'targetDate', type: sql.Date, value: merged.TargetDate },
        { name: 'alertThresholdKM', type: sql.Int, value: merged.AlertThresholdKM },
        { name: 'status', type: sql.NVarChar, value: merged.Status },
        { name: 'notes', type: sql.NVarChar, value: merged.Notes },
      ]
    );

    return { message: 'Cập nhật lịch nhắc bảo dưỡng thành công!' };
  }

  // Xóa lịch nhắc bảo dưỡng
  async deleteSchedule(id: number, userId: number, role: string) {
    const scheduleResult = await this.dbService.query(
      'SELECT * FROM MaintenanceSchedules WHERE ScheduleID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (scheduleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy lịch nhắc bảo dưỡng');
    }

    const schedule = scheduleResult.recordset[0];
    
    // Check quyền sở hữu xe
    const vehicle = await this.dbService.query(
      'SELECT UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: schedule.VehicleID }]
    );

    if (role !== 'Admin' && vehicle.recordset[0].UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa lịch nhắc này');
    }

    await this.dbService.query(
      'DELETE FROM MaintenanceSchedules WHERE ScheduleID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    return { message: 'Xóa lịch nhắc bảo dưỡng thành công!' };
  }

  // Lấy lịch sử sửa chữa/bảo dưỡng
  async getHistory(vehicleId: number, userId: number, role: string) {
    await this.checkVehicleAccess(vehicleId, userId, role);

    const result = await this.dbService.query(
      `SELECT h.*, g.GarageName, g.Address AS GarageAddress, g.Phone AS GaragePhone
       FROM MaintenanceHistory h
       LEFT JOIN Garages g ON h.GarageID = g.GarageID
       WHERE h.VehicleID = @vehicleId
       ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    return result.recordset;
  }

  // Gara ghi sổ sửa chữa
  async createHistoryGarage(userId: number, role: string, dto: CreateHistoryGarageDto) {
    let garageId: number | null = null;

    if (role === 'Garage') {
      const garageResult = await this.dbService.query(
        'SELECT GarageID FROM Garages WHERE UserID = @userId',
        [{ name: 'userId', type: sql.Int, value: userId }]
      );

      if (garageResult.recordset.length === 0) {
        throw new ForbiddenException('Tài khoản này chưa được liên kết với Garage nào');
      }
      garageId = garageResult.recordset[0].GarageID;
    } else if (role !== 'Admin') {
      throw new ForbiddenException('Chỉ tài khoản Gara hoặc Admin mới có quyền thực hiện chức năng này');
    }

    // Kiểm tra xe có tồn tại không
    const vehicleResult = await this.dbService.query(
      'SELECT CurrentOdometer, UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: dto.vehicleId }]
    );

    if (vehicleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện');
    }

    const vehicle = vehicleResult.recordset[0];

    // Cập nhật Odometer của xe nếu số km thực tế sửa chữa lớn hơn Odometer hiện tại
    if (dto.executionOdometer > vehicle.CurrentOdometer) {
      await this.dbService.query(
        'UPDATE Vehicles SET CurrentOdometer = @odometer, UpdatedAt = GETDATE() WHERE VehicleID = @vehicleId',
        [
          { name: 'odometer', type: sql.Int, value: dto.executionOdometer },
          { name: 'vehicleId', type: sql.Int, value: dto.vehicleId }
        ]
      );
    }

    // Thêm lịch sử bảo dưỡng
    await this.dbService.query(
      `INSERT INTO MaintenanceHistory (VehicleID, GarageID, AppointmentID, ExecutionDate, ExecutionOdometer, TotalCost, Details)
       VALUES (@vehicleId, @garageId, @appointmentId, @executionDate, @executionOdometer, @totalCost, @details)`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'appointmentId', type: sql.Int, value: dto.appointmentId || null },
        { name: 'executionDate', type: sql.Date, value: dto.executionDate },
        { name: 'executionOdometer', type: sql.Int, value: dto.executionOdometer },
        { name: 'totalCost', type: sql.Decimal(18, 2), value: dto.totalCost },
        { name: 'details', type: sql.NVarChar, value: dto.details },
      ]
    );

    // Nếu có lịch hẹn (appointmentId), chuyển trạng thái lịch hẹn thành 'Hoàn thành'
    if (dto.appointmentId) {
      await this.dbService.query(
        "UPDATE Appointments SET Status = N'Hoàn thành' WHERE AppointmentID = @appointmentId",
        [{ name: 'appointmentId', type: sql.Int, value: dto.appointmentId }]
      );
    }

    // Tự động chuyển các lịch nhắc trùng khớp danh mục hoặc tìm thấy từ khoá trong details thành 'Đã hoàn thành'
    await this.dbService.query(
      `UPDATE MaintenanceSchedules
       SET Status = N'Đã hoàn thành'
       WHERE VehicleID = @vehicleId 
         AND Status = N'Chưa thực hiện'
         AND (CategoryName LIKE '%' + @details + '%' OR @details LIKE '%' + CategoryName + '%')`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'details', type: sql.NVarChar, value: dto.details }
      ]
    );

    return { message: 'Ghi sổ lịch sử bảo dưỡng thành công!' };
  }

  // Tìm xe theo biển số dành cho Gara ghi sổ
  async searchVehicleByLicensePlate(licensePlate: string) {
    const result = await this.dbService.query(
      'SELECT VehicleID, Brand, Model, LicensePlate, VehicleType, CurrentOdometer FROM Vehicles WHERE LicensePlate = @licensePlate',
      [{ name: 'licensePlate', type: sql.VarChar, value: licensePlate }]
    );
    if (result.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện nào có biển số xe này.');
    }
    return result.recordset[0];
  }
}
