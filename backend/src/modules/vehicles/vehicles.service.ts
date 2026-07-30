import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateOdometerDto } from './dto/update-odometer.dto';
import { UpdateCommercialInfoDto } from './dto/update-commercial-info.dto';

@Injectable()
export class VehiclesService {
  constructor(private dbService: DatabaseService) {}

  async findAll(userId: number, role: string) {
    // Nếu là Admin, cho phép xem toàn bộ xe.
    // Nếu không, chỉ xem xe của chính mình.
    if (role === 'Admin') {
      const result = await this.dbService.query('SELECT * FROM Vehicles ORDER BY UpdatedAt DESC');
      return result.recordset;
    } else {
      const result = await this.dbService.query(
        'SELECT * FROM Vehicles WHERE UserID = @userId ORDER BY UpdatedAt DESC',
        [{ name: 'userId', type: sql.Int, value: userId }]
      );
      return result.recordset;
    }
  }

  async findOne(id: number, userId: number, role: string) {
    const result = await this.dbService.query(
      'SELECT * FROM Vehicles WHERE VehicleID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (result.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này');
    }

    const vehicle = result.recordset[0];

    // Ràng buộc bảo mật: Chỉ cho phép xem nếu là chủ xe, Gara, hoặc Admin
    if (role === 'User' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập phương tiện này');
    }

    return vehicle;
  }

  async create(userId: number, dto: CreateVehicleDto) {
    // 1. Kiểm tra biển số xe đã tồn tại hay chưa
    const checkResult = await this.dbService.query(
      'SELECT VehicleID FROM Vehicles WHERE LicensePlate = @licensePlate',
      [{ name: 'licensePlate', type: sql.VarChar, value: dto.licensePlate }]
    );

    if (checkResult.recordset.length > 0) {
      throw new ConflictException('Biển số xe này đã được đăng ký trên hệ thống');
    }

    // 2. Thêm xe mới vào database
    const insertResult = await this.dbService.query(
      `INSERT INTO Vehicles (UserID, LicensePlate, VehicleType, Brand, Model, ManufactureYear, PurchaseDate, CurrentOdometer, IsCommercial, HTXCode, BadgeNumber, UpdatedAt)
       OUTPUT INSERTED.VehicleID
       VALUES (@userId, @licensePlate, @vehicleType, @brand, @model, @manufactureYear, @purchaseDate, @currentOdometer, @isCommercial, @htxCode, @badgeNumber, GETDATE())`,
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'licensePlate', type: sql.VarChar, value: dto.licensePlate },
        { name: 'vehicleType', type: sql.NVarChar, value: dto.vehicleType },
        { name: 'brand', type: sql.NVarChar, value: dto.brand },
        { name: 'model', type: sql.NVarChar, value: dto.model },
        { name: 'manufactureYear', type: sql.Int, value: dto.manufactureYear || null },
        { name: 'purchaseDate', type: sql.Date, value: dto.purchaseDate || null },
        { name: 'currentOdometer', type: sql.Int, value: dto.currentOdometer },
        { name: 'isCommercial', type: sql.Bit, value: dto.isCommercial ? 1 : 0 },
        { name: 'htxCode', type: sql.NVarChar, value: dto.htxCode || null },
        { name: 'badgeNumber', type: sql.NVarChar, value: dto.badgeNumber || null },
      ]
    );

    const newVehicleId = insertResult.recordset[0].VehicleID;
    return {
      message: 'Thêm phương tiện mới thành công!',
      vehicleId: newVehicleId,
    };
  }

  async update(id: number, userId: number, role: string, dto: UpdateVehicleDto) {
    // 1. Kiểm tra sự tồn tại và quyền sở hữu
    const vehicle = await this.findOne(id, userId, role);

    if (role !== 'Admin' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa phương tiện này');
    }

    // 2. Thực hiện cập nhật
    await this.dbService.query(
      `UPDATE Vehicles
       SET Brand = @brand,
           Model = @model,
           ManufactureYear = @manufactureYear,
           PurchaseDate = @purchaseDate,
           IsCommercial = @isCommercial,
           HTXCode = @htxCode,
           BadgeNumber = @badgeNumber,
           UpdatedAt = GETDATE()
       WHERE VehicleID = @id`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'brand', type: sql.NVarChar, value: dto.brand },
        { name: 'model', type: sql.NVarChar, value: dto.model },
        { name: 'manufactureYear', type: sql.Int, value: dto.manufactureYear || null },
        { name: 'purchaseDate', type: sql.Date, value: dto.purchaseDate || null },
        { name: 'isCommercial', type: sql.Bit, value: dto.isCommercial ? 1 : 0 },
        { name: 'htxCode', type: sql.NVarChar, value: dto.htxCode || null },
        { name: 'badgeNumber', type: sql.NVarChar, value: dto.badgeNumber || null },
      ]
    );

    return { message: 'Cập nhật thông tin phương tiện thành công!' };
  }

  async updateCommercialInfo(id: number, userId: number, role: string, dto: UpdateCommercialInfoDto) {
    const vehicle = await this.findOne(id, userId, role);

    if (role !== 'Admin' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật xe này');
    }

    await this.dbService.query(
      `UPDATE Vehicles
       SET IsCommercial = @isCommercial,
           HTXCode = @htxCode,
           BadgeNumber = @badgeNumber,
           UpdatedAt = GETDATE()
       WHERE VehicleID = @id`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'isCommercial', type: sql.Bit, value: dto.isCommercial !== undefined ? (dto.isCommercial ? 1 : 0) : vehicle.IsCommercial },
        { name: 'htxCode', type: sql.NVarChar, value: dto.htxCode !== undefined ? dto.htxCode : vehicle.HTXCode },
        { name: 'badgeNumber', type: sql.NVarChar, value: dto.badgeNumber !== undefined ? dto.badgeNumber : vehicle.BadgeNumber },
      ]
    );

    return { message: 'Cập nhật thông tin xe dịch vụ thành công!' };
  }

  async updateOdometer(id: number, userId: number, role: string, dto: UpdateOdometerDto) {
    // 1. Kiểm tra sự tồn tại và quyền sở hữu
    const vehicle = await this.findOne(id, userId, role);

    if (role !== 'Admin' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật số km của phương tiện này');
    }

    // 2. Kiểm tra số km mới không được nhỏ hơn số km hiện tại
    if (dto.currentOdometer < vehicle.CurrentOdometer) {
      throw new ConflictException(`Số km mới (${dto.currentOdometer} km) không được nhỏ hơn số km hiện tại (${vehicle.CurrentOdometer} km)`);
    }

    // 3. Cập nhật số km
    await this.dbService.query(
      `UPDATE Vehicles
       SET CurrentOdometer = @currentOdometer,
           UpdatedAt = GETDATE()
       WHERE VehicleID = @id`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'currentOdometer', type: sql.Int, value: dto.currentOdometer },
      ]
    );

    return { message: 'Cập nhật số km (Odometer) thành công!' };
  }

  async delete(id: number, userId: number, role: string) {
    // 1. Kiểm tra sự tồn tại và quyền sở hữu
    const vehicle = await this.findOne(id, userId, role);

    if (role !== 'Admin' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa phương tiện này');
    }

    // 2. Xử lý các khóa ngoại có liên kết
    // Xóa LegalDocuments và MaintenanceSchedules đã có cascade ở CSDL.
    // Để tránh lỗi khóa ngoại không cascade, ta cần xóa lịch sử và lịch hẹn trước:
    await this.dbService.query('DELETE FROM MaintenanceHistory WHERE VehicleID = @id', [{ name: 'id', type: sql.Int, value: id }]);
    await this.dbService.query('DELETE FROM Appointments WHERE VehicleID = @id', [{ name: 'id', type: sql.Int, value: id }]);

    // 3. Xóa phương tiện
    await this.dbService.query(
      'DELETE FROM Vehicles WHERE VehicleID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    return { message: 'Xóa phương tiện thành công!' };
  }
}
