import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GaragesService {
  constructor(private dbService: DatabaseService) {}

  // Lấy danh sách tất cả các Gara đang hoạt động (dành cho User lựa chọn khi đặt lịch)
  async findAll() {
    const result = await this.dbService.query(
      'SELECT GarageID, GarageName, Address, Phone, Email, Rating FROM Garages WHERE IsActive = 1'
    );
    return result.recordset;
  }

  // Tiện ích: Lấy GarageID từ UserID của tài khoản Gara
  private async getGarageIdByUserId(userId: number): Promise<number> {
    const result = await this.dbService.query(
      'SELECT GarageID FROM Garages WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length === 0) {
      throw new ForbiddenException('Tài khoản này chưa được liên kết với Garage nào.');
    }

    return result.recordset[0].GarageID;
  }

  // Lấy danh sách xe đã bảo dưỡng tại Gara (dành cho Gara quản lý)
  async getServicedVehicles(userId: number, role: string, search: string = '') {
    let garageId: number;
    if (role === 'Admin') {
      // Admin xem tất cả xe, nhưng tạm thời lấy theo một Gara bất kỳ hoặc bỏ qua lọc.
      // Tuy nhiên theo đặc tả, chủ yếu phục vụ cho Gara xem xe của chính họ.
      // Nếu Admin gọi, ta sẽ cố tìm Gara đầu tiên hoặc ném lỗi nếu muốn xem cụ thể.
      // Để tiện lợi, nếu Admin gọi, ta lấy danh sách tất cả xe trong hệ thống.
      const query = `
        SELECT DISTINCT v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType, v.CurrentOdometer,
                        u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
        FROM Vehicles v
        JOIN Users u ON v.UserID = u.UserID
        WHERE (@search = '' OR v.LicensePlate LIKE '%' + @search + '%')
      `;
      const result = await this.dbService.query(query, [
        { name: 'search', type: sql.VarChar, value: search.trim() }
      ]);
      return result.recordset;
    }

    // Role: Garage
    garageId = await this.getGarageIdByUserId(userId);

    const query = `
      SELECT DISTINCT v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType, v.CurrentOdometer,
                      u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
      FROM Vehicles v
      JOIN Users u ON v.UserID = u.UserID
      LEFT JOIN MaintenanceHistory h ON v.VehicleID = h.VehicleID
      LEFT JOIN Appointments a ON v.VehicleID = a.VehicleID
      WHERE (h.GarageID = @garageId OR a.GarageID = @garageId)
        AND (@search = '' OR v.LicensePlate LIKE '%' + @search + '%')
    `;

    const result = await this.dbService.query(query, [
      { name: 'garageId', type: sql.Int, value: garageId },
      { name: 'search', type: sql.VarChar, value: search.trim() }
    ]);

    return result.recordset;
  }

  // Xem hồ sơ xe chi tiết và toàn bộ lịch sử sửa chữa của chiếc xe đó tại Gara
  async getVehicleProfile(userId: number, role: string, vehicleId: number) {
    let garageId: number | null = null;
    
    if (role !== 'Admin') {
      garageId = await this.getGarageIdByUserId(userId);

      // Kiểm tra quyền: Gara chỉ xem được khi xe đã từng tạo lịch hẹn hoặc làm dịch vụ tại Gara đó
      const accessCheck = await this.dbService.query(
        `SELECT TOP 1 1 FROM Appointments WHERE VehicleID = @vehicleId AND GarageID = @garageId
         UNION
         SELECT TOP 1 1 FROM MaintenanceHistory WHERE VehicleID = @vehicleId AND GarageID = @garageId`,
        [
          { name: 'vehicleId', type: sql.Int, value: vehicleId },
          { name: 'garageId', type: sql.Int, value: garageId }
        ]
      );

      if (accessCheck.recordset.length === 0) {
        throw new ForbiddenException('Bạn không có quyền truy cập thông tin xe này (chưa từng thực hiện dịch vụ hoặc lịch hẹn tại tiệm của bạn).');
      }
    }

    // Lấy thông tin xe và thông tin chủ xe
    const vehicleResult = await this.dbService.query(
      `SELECT v.*, u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
       FROM Vehicles v
       JOIN Users u ON v.UserID = u.UserID
       WHERE v.VehicleID = @vehicleId`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    if (vehicleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này.');
    }

    // Lấy toàn bộ lịch sử sửa chữa của xe tại gara này (nếu là Admin thì lấy của tất cả gara)
    const historyQuery = garageId 
      ? `SELECT h.*, g.GarageName 
         FROM MaintenanceHistory h 
         LEFT JOIN Garages g ON h.GarageID = g.GarageID 
         WHERE h.VehicleID = @vehicleId AND h.GarageID = @garageId 
         ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`
      : `SELECT h.*, g.GarageName 
         FROM MaintenanceHistory h 
         LEFT JOIN Garages g ON h.GarageID = g.GarageID 
         WHERE h.VehicleID = @vehicleId 
         ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`;

    const historyParams = [{ name: 'vehicleId', type: sql.Int, value: vehicleId }];
    if (garageId) {
      historyParams.push({ name: 'garageId', type: sql.Int, value: garageId });
    }

    const historyResult = await this.dbService.query(historyQuery, historyParams);

    return {
      vehicle: vehicleResult.recordset[0],
      history: historyResult.recordset
    };
  }
}
