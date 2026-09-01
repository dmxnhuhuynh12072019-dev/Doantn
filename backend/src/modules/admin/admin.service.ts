import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { CreateGarageDto } from './dto/create-garage.dto';

@Injectable()
export class AdminService {
  constructor(private dbService: DatabaseService) {}

  async getStats() {
    // 1. Total users
    const usersCountRes = await this.dbService.query('SELECT COUNT(*) AS count FROM Users');
    const totalUsers = usersCountRes.recordset[0].count;

    // 2. Total vehicles
    const vehiclesCountRes = await this.dbService.query('SELECT COUNT(*) AS count FROM Vehicles');
    const totalVehicles = vehiclesCountRes.recordset[0].count;

    // 3. Total garages
    const garagesCountRes = await this.dbService.query('SELECT COUNT(*) AS count FROM Garages');
    const totalGarages = garagesCountRes.recordset[0].count;

    // 4. Total appointments
    const appointmentsCountRes = await this.dbService.query('SELECT COUNT(*) AS count FROM Appointments');
    const totalAppointments = appointmentsCountRes.recordset[0].count;

    // 5. Total revenue
    const revenueRes = await this.dbService.query('SELECT ISNULL(SUM(TotalCost), 0) AS total FROM MaintenanceHistory');
    const totalRevenue = revenueRes.recordset[0].total;

    // 6. Recent appointments (top 5)
    const recentApptsRes = await this.dbService.query(`
      SELECT TOP 5 a.AppointmentID, a.AppointmentDate, a.Status, a.Notes,
             u.FullName AS CustomerName, g.GarageName, v.LicensePlate
      FROM Appointments a
      JOIN Users u ON a.UserID = u.UserID
      JOIN Garages g ON a.GarageID = g.GarageID
      JOIN Vehicles v ON a.VehicleID = v.VehicleID
      ORDER BY a.CreatedAt DESC, a.AppointmentID DESC
    `);
    const recentAppointments = recentApptsRes.recordset;

    return {
      totalUsers,
      totalVehicles,
      totalGarages,
      totalAppointments,
      totalRevenue,
      recentAppointments,
    };
  }

  async getUsers(search: string = '', roleFilter: string = '') {
    let query = `
      SELECT UserID, FullName, Email, PhoneNumber, Role, Status, CreatedAt
      FROM Users
      WHERE 1=1
    `;
    const params: { name: string; type: any; value: any }[] = [];

    if (search.trim()) {
      query += ` AND (FullName LIKE '%' + @search + '%' OR Email LIKE '%' + @search + '%')`;
      params.push({ name: 'search', type: sql.NVarChar, value: search.trim() });
    }

    if (roleFilter.trim()) {
      query += ` AND Role = @roleFilter`;
      params.push({ name: 'roleFilter', type: sql.VarChar, value: roleFilter.trim() });
    }

    query += ` ORDER BY CreatedAt DESC`;

    const result = await this.dbService.query(query, params);
    return result.recordset;
  }

  async updateUserStatus(targetUserId: number, status: string) {
    const checkRes = await this.dbService.query('SELECT UserID FROM Users WHERE UserID = @userId', [
      { name: 'userId', type: sql.Int, value: targetUserId }
    ]);
    if (checkRes.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.dbService.query(
      'UPDATE Users SET Status = @status WHERE UserID = @userId',
      [
        { name: 'userId', type: sql.Int, value: targetUserId },
        { name: 'status', type: sql.NVarChar, value: status }
      ]
    );

    return { message: 'Cập nhật trạng thái người dùng thành công!' };
  }

  async updateUserRole(targetUserId: number, role: string) {
    const checkRes = await this.dbService.query('SELECT UserID FROM Users WHERE UserID = @userId', [
      { name: 'userId', type: sql.Int, value: targetUserId }
    ]);
    if (checkRes.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.dbService.query(
      'UPDATE Users SET Role = @role WHERE UserID = @userId',
      [
        { name: 'userId', type: sql.Int, value: targetUserId },
        { name: 'role', type: sql.VarChar, value: role }
      ]
    );

    return { message: 'Cập nhật vai trò người dùng thành công!' };
  }

  async getGarages() {
    const query = `
      SELECT g.GarageID, g.GarageName, g.Address, g.Phone, g.Email, g.Rating, g.IsActive,
             u.FullName AS OwnerName, u.Email AS OwnerEmail
      FROM Garages g
      LEFT JOIN Users u ON g.UserID = u.UserID
      ORDER BY g.GarageID DESC
    `;
    const result = await this.dbService.query(query);
    return result.recordset;
  }

  async updateGarageStatus(garageId: number, isActive: boolean) {
    const checkRes = await this.dbService.query('SELECT GarageID FROM Garages WHERE GarageID = @garageId', [
      { name: 'garageId', type: sql.Int, value: garageId }
    ]);
    if (checkRes.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy Gara');
    }

    await this.dbService.query(
      'UPDATE Garages SET IsActive = @isActive WHERE GarageID = @garageId',
      [
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'isActive', type: sql.Bit, value: isActive ? 1 : 0 }
      ]
    );

    return { message: 'Cập nhật trạng thái Gara thành công!' };
  }

  async createGarage(dto: CreateGarageDto) {
    // 1. Kiểm tra xem email đã tồn tại trong Users chưa
    const checkEmail = await this.dbService.query(
      'SELECT UserID FROM Users WHERE Email = @email',
      [{ name: 'email', type: sql.VarChar, value: dto.email.trim() }]
    );

    if (checkEmail.recordset.length > 0) {
      throw new ConflictException('Email này đã được sử dụng bởi một tài khoản khác trong hệ thống.');
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 3. Tạo tài khoản User với vai trò 'Garage'
    const insertUserRes = await this.dbService.query(
      `INSERT INTO Users (FullName, Email, PhoneNumber, PasswordHash, Role, Status, CreatedAt)
       OUTPUT INSERTED.UserID
       VALUES (@fullName, @email, @phoneNumber, @passwordHash, 'Garage', N'Hoạt động', GETDATE())`,
      [
        { name: 'fullName', type: sql.NVarChar, value: dto.fullName.trim() },
        { name: 'email', type: sql.VarChar, value: dto.email.trim() },
        { name: 'phoneNumber', type: sql.VarChar, value: dto.phoneNumber?.trim() || null },
        { name: 'passwordHash', type: sql.VarChar, value: passwordHash },
      ]
    );

    const newUserId = insertUserRes.recordset[0]?.UserID;
    if (!newUserId) {
      throw new BadRequestException('Không thể tạo tài khoản người dùng cho Gara.');
    }

    // 4. Tạo bản ghi Gara trong bảng Garages
    const garagePhone = dto.phone?.trim() || dto.phoneNumber?.trim() || '0900000000';
    const garageEmail = dto.garageEmail?.trim() || dto.email.trim();
    const rating = dto.rating !== undefined ? dto.rating : 5.0;

    const insertGarageRes = await this.dbService.query(
      `INSERT INTO Garages (UserID, GarageName, Address, Phone, Email, Rating, IsActive)
       OUTPUT INSERTED.GarageID
       VALUES (@userId, @garageName, @address, @phone, @email, @rating, 1)`,
      [
        { name: 'userId', type: sql.Int, value: newUserId },
        { name: 'garageName', type: sql.NVarChar, value: dto.garageName.trim() },
        { name: 'address', type: sql.NVarChar, value: dto.address.trim() },
        { name: 'phone', type: sql.VarChar, value: garagePhone },
        { name: 'email', type: sql.VarChar, value: garageEmail },
        { name: 'rating', type: sql.Decimal, value: rating },
      ]
    );

    const newGarageId = insertGarageRes.recordset[0]?.GarageID;

    return {
      message: 'Khởi tạo tài khoản và hồ sơ Gara thành công!',
      data: {
        garageId: newGarageId,
        userId: newUserId,
        garageName: dto.garageName,
        email: dto.email,
        fullName: dto.fullName,
      },
    };
  }
}
