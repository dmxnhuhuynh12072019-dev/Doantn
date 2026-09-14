import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateHistoryGarageDto } from './dto/create-history-garage.dto';
import { BatchImportInvoiceDto } from './dto/batch-import-invoice.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MaintenancesService {
  private readonly logger = new Logger(MaintenancesService.name);

  constructor(
    private dbService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  // Tiện ích: Lấy GarageID từ UserID của tài khoản Gara (tự động liên kết thông minh)
  private async getGarageIdByUserId(userId: number): Promise<number> {
    // 1. Tìm Garage đã gán UserID chính xác
    const result = await this.dbService.query(
      'SELECT GarageID FROM Garages WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length > 0) {
      return result.recordset[0].GarageID;
    }

    // 2. Tìm Gara có Email hoặc Số điện thoại khớp với tài khoản User
    const matchUser = await this.dbService.query(
      `SELECT g.GarageID 
       FROM Garages g 
       JOIN Users u ON (g.Email = u.Email OR g.Phone = u.PhoneNumber OR g.GarageName LIKE '%' || u.FullName || '%')
       WHERE u.UserID = @userId
       LIMIT 1`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    if (matchUser.recordset.length > 0) {
      const gId = matchUser.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 3. Tìm Gara chưa gán UserID hoặc UserID không còn hợp lệ
    const unlinked = await this.dbService.query(
      `SELECT GarageID FROM Garages WHERE UserID IS NULL OR UserID NOT IN (SELECT UserID FROM Users WHERE Role = 'Garage') ORDER BY GarageID ASC LIMIT 1`
    );
    if (unlinked.recordset.length > 0) {
      const gId = unlinked.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 4. Lấy bất kỳ Gara nào hiện có trong hệ thống và tự động liên kết
    const anyGarage = await this.dbService.query(
      'SELECT GarageID FROM Garages ORDER BY GarageID ASC LIMIT 1'
    );
    if (anyGarage.recordset.length > 0) {
      const gId = anyGarage.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId AND (UserID IS NULL OR UserID = 0)',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 5. Nếu bảng Garages chưa có bản ghi nào, tự động khởi tạo 1 Gara mặc định
    const userRes = await this.dbService.query(
      'SELECT FullName, PhoneNumber, Email FROM Users WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    const uInfo = userRes.recordset[0] || {};
    const garageName = uInfo.FullName ? `Gara Dịch Vụ ${uInfo.FullName}` : 'ACOH Garage AutoCare';
    const createRes = await this.dbService.query(
      `INSERT INTO Garages (UserID, GarageName, Address, Phone, Email, Rating, IsActive)
       VALUES (@userId, @garageName, N'Tứ Dân, Khoái Châu, Hưng Yên', @phone, @email, 5.0, true)
       RETURNING GarageID`,
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'garageName', type: sql.NVarChar, value: garageName },
        { name: 'phone', type: sql.VarChar, value: uInfo.PhoneNumber || '0901112222' },
        { name: 'email', type: sql.VarChar, value: uInfo.Email || 'garage@autocare.vn' },
      ]
    );

    return createRes.recordset[0].GarageID;
  }

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
      const garageId = await this.getGarageIdByUserId(userId);

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
       VALUES (@vehicleId, @categoryName, @targetOdometer, @targetDate, @alertThresholdKM, N'Chưa thực hiện', @notes)
       RETURNING ScheduleID`,
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
      garageId = await this.getGarageIdByUserId(userId);
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
         AND (CategoryName LIKE '%' || @details || '%' OR @details LIKE '%' || CategoryName || '%')`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'details', type: sql.NVarChar, value: dto.details }
      ]
    );

    // Tự động gửi thông báo cho chủ xe báo xe đã hoàn tất bảo dưỡng tại Gara
    try {
      const vehicleInfo = await this.dbService.query(
        `SELECT v.LicensePlate, v.UserID, g.GarageName 
         FROM Vehicles v
         LEFT JOIN Garages g ON g.GarageID = @garageId
         WHERE v.VehicleID = @vehicleId`,
        [
          { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
          { name: 'garageId', type: sql.Int, value: garageId || 0 }
        ]
      );
      if (vehicleInfo.recordset.length > 0) {
        const { UserID: ownerId, LicensePlate, GarageName } = vehicleInfo.recordset[0];
        const gName = GarageName || 'Gara đối tác';
        const title = `[ACOH] Thông báo hoàn tất bảo dưỡng xe ${LicensePlate}`;
        const message = `Xe ${LicensePlate} của bạn đã hoàn tất bảo dưỡng và sửa chữa tại ${gName}. Mời bạn đến nhận xe.\nChi tiết dịch vụ: ${dto.details}`;
        await this.notificationsService.create(ownerId, title, message, 'All');
      }
    } catch (err) {
      this.logger.warn(`Không thể gửi thông báo hoàn tất bảo dưỡng: ${err.message}`);
    }

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

  // Lấy bộ khung các mốc bảo dưỡng và danh mục công việc kỹ thuật chuẩn
  async getMaintenanceCategories(vehicleType?: string) {
    let queryStr = `
      SELECT c.CategoryID, c.CategoryName, c.IntervalKm AS TargetOdometer, c.IntervalKm, c.IntervalMonths, c.VehicleType, c.Description AS CategoryDescription,
             i.ItemID, i.ItemName, i.ItemDescription, i.IsRequired, i.EstimatedCost
      FROM MaintenanceCategories c
      LEFT JOIN MaintenanceItems i ON c.CategoryID = i.CategoryID
    `;
    const params: { name: string; type: any; value: any }[] = [];

    if (vehicleType) {
      queryStr += ` WHERE c.VehicleType = @vehicleType`;
      params.push({ name: 'vehicleType', type: sql.NVarChar, value: vehicleType });
    }

    queryStr += ` ORDER BY c.IntervalKm ASC, c.CategoryID ASC, i.ItemID ASC`;

    const result = await this.dbService.query(queryStr, params);

    const categoriesMap = new Map<number, any>();
    for (const row of result.recordset) {
      if (!categoriesMap.has(row.CategoryID)) {
        categoriesMap.set(row.CategoryID, {
          categoryId: row.CategoryID,
          categoryName: row.CategoryName,
          targetOdometer: row.TargetOdometer || row.IntervalKm,
          intervalKm: row.IntervalKm,
          intervalMonths: row.IntervalMonths,
          vehicleType: row.VehicleType,
          description: row.CategoryDescription,
          items: [],
        });
      }

      if (row.ItemID) {
        categoriesMap.get(row.CategoryID).items.push({
          itemId: row.ItemID,
          itemName: row.ItemName,
          description: row.ItemDescription,
          isRequired: !!row.IsRequired,
          estimatedCost: row.EstimatedCost ? Number(row.EstimatedCost) : 0,
        });
      }
    }

    return Array.from(categoriesMap.values());
  }

  // Lưu bảo dưỡng theo mốc km chuẩn hóa (Matrix Checklist)
  async saveMatrixChecklist(userId: number, role: string, dto: any) {
    await this.checkVehicleAccess(dto.vehicleId, userId, role);

    if (!dto.selectedItemIds || dto.selectedItemIds.length === 0) {
      throw new NotFoundException('Phải chọn ít nhất một hạng mục bảo dưỡng');
    }

    const itemsResult = await this.dbService.query(
      `SELECT i.ItemName, c.CategoryName 
       FROM MaintenanceItems i 
       JOIN MaintenanceCategories c ON i.CategoryID = c.CategoryID
       WHERE i.ItemID IN (${dto.selectedItemIds.map((_: any, index: number) => `@id${index}`).join(',')})`,
      dto.selectedItemIds.map((id: number, index: number) => ({ name: `id${index}`, type: sql.Int, value: id }))
    );

    if (itemsResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy các hạng mục bảo dưỡng được chọn.');
    }

    const itemNames = itemsResult.recordset.map((r: any) => r.ItemName).join(', ');
    const details = `Bảo dưỡng mốc ${dto.odometer.toLocaleString()} km - Hạng mục: ${itemNames}.${dto.notes ? ' Ghi chú: ' + dto.notes : ''}`;

    let garageId: number | null = null;
    if (role === 'Garage') {
      const gRes = await this.dbService.query(
        'SELECT GarageID FROM Garages WHERE UserID = @userId',
        [{ name: 'userId', type: sql.Int, value: userId }]
      );
      if (gRes.recordset.length > 0) {
        garageId = gRes.recordset[0].GarageID;
      }
    }

    const finalCost = dto.totalCost && Number(dto.totalCost) > 0 
      ? Number(dto.totalCost) 
      : ((dto.selectedItemIds?.length || 1) * 250000);

    const insertResult = await this.dbService.query(
      `INSERT INTO MaintenanceHistory (VehicleID, GarageID, ExecutionDate, ExecutionOdometer, TotalCost, Details)
       VALUES (@vehicleId, @garageId, GETDATE(), @odometer, @totalCost, @details)
       RETURNING HistoryID`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'odometer', type: sql.Int, value: dto.odometer },
        { name: 'totalCost', type: sql.Decimal(18, 2), value: finalCost },
        { name: 'details', type: sql.NVarChar, value: details },
      ]
    );

    const historyId = insertResult.recordset[0]?.HistoryID;

    await this.dbService.query(
      `UPDATE Vehicles 
       SET CurrentOdometer = CASE WHEN @odometer > CurrentOdometer THEN @odometer ELSE CurrentOdometer END,
           UpdatedAt = GETDATE()
       WHERE VehicleID = @vehicleId`,
      [
        { name: 'odometer', type: sql.Int, value: dto.odometer },
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
      ]
    );

    await this.dbService.query(
      `UPDATE MaintenanceSchedules
       SET Status = N'Đã hoàn thành'
       WHERE VehicleID = @vehicleId 
         AND Status = N'Chưa thực hiện'
         AND TargetOdometer <= @odometer`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'odometer', type: sql.Int, value: dto.odometer },
      ]
    );

    return {
      message: 'Lưu bảo dưỡng theo mốc km thành công!',
      historyId,
      totalCost: finalCost,
      details,
    };
  }

  // Batch import lịch sử sửa chữa từ hóa đơn AI OCR
  async batchImportInvoiceHistory(userId: number, role: string, dto: BatchImportInvoiceDto) {
    await this.checkVehicleAccess(dto.vehicleId, userId, role);

    const garageHeader = dto.garageName ? `[Gara: ${dto.garageName}]` : '[Tự nhập hóa đơn OCR]';
    const itemsFormatted = (dto.items || [])
      .map((it) => `- ${it.item}: ${new Intl.NumberFormat('vi-VN').format(it.cost || 0)} đ`)
      .join('\n');

    const details = `${garageHeader}\n${itemsFormatted}`.trim();
    const totalCost = dto.totalCost !== undefined 
      ? dto.totalCost 
      : (dto.items || []).reduce((sum, i) => sum + (Number(i.cost) || 0), 0);

    const execDate = dto.executionDate ? new Date(dto.executionDate) : new Date();

    const insertRes = await this.dbService.query(
      `INSERT INTO MaintenanceHistory (VehicleID, GarageID, ExecutionDate, ExecutionOdometer, TotalCost, Details)
       OUTPUT INSERTED.HistoryID
       VALUES (@vehicleId, NULL, @execDate, @odometer, @totalCost, @details)`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'execDate', type: sql.Date, value: execDate },
        { name: 'odometer', type: sql.Int, value: dto.executionOdometer },
        { name: 'totalCost', type: sql.Decimal, value: totalCost },
        { name: 'details', type: sql.NVarChar, value: details },
      ]
    );

    // Đồng bộ số km của xe nếu cao hơn mốc hiện tại
    await this.dbService.query(
      `UPDATE Vehicles 
       SET CurrentOdometer = CASE WHEN @odometer > CurrentOdometer THEN @odometer ELSE CurrentOdometer END,
           UpdatedAt = GETDATE()
       WHERE VehicleID = @vehicleId`,
      [
        { name: 'odometer', type: sql.Int, value: dto.executionOdometer },
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
      ]
    );

    return {
      success: true,
      message: 'Đã lưu hóa đơn bảo dưỡng vào nhật ký thành công!',
      historyId: insertRes.recordset[0]?.HistoryID,
      details,
      totalCost,
    };
  }
}
