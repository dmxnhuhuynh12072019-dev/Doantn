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
      `SELECT TOP 1 g.GarageID 
       FROM Garages g 
       JOIN Users u ON (g.Email = u.Email OR g.Phone = u.PhoneNumber OR g.GarageName LIKE '%' + u.FullName + '%')
       WHERE u.UserID = @userId`,
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
      `SELECT TOP 1 GarageID FROM Garages WHERE UserID IS NULL OR UserID NOT IN (SELECT UserID FROM Users WHERE Role = 'Garage') ORDER BY GarageID ASC`
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
      'SELECT TOP 1 GarageID FROM Garages ORDER BY GarageID ASC'
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
       OUTPUT INSERTED.GarageID
       VALUES (@userId, @garageName, N'Tứ Dân, Khoái Châu, Hưng Yên', @phone, @email, 5.0, 1)`,
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'garageName', type: sql.NVarChar, value: garageName },
        { name: 'phone', type: sql.VarChar, value: uInfo.PhoneNumber || '0901112222' },
        { name: 'email', type: sql.VarChar, value: uInfo.Email || 'garage@autocare.vn' },
      ]
    );

    return createRes.recordset[0].GarageID;
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
