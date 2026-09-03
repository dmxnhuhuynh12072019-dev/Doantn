import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as sql from 'mssql';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { CreateGarageDto } from './dto/create-garage.dto';

@Injectable()
export class AdminService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

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
      SELECT a.AppointmentID, a.AppointmentDate, a.Status, a.Notes,
             u.FullName AS CustomerName, g.GarageName, v.LicensePlate
      FROM Appointments a
      JOIN Users u ON a.UserID = u.UserID
      JOIN Garages g ON a.GarageID = g.GarageID
      JOIN Vehicles v ON a.VehicleID = v.VehicleID
      ORDER BY a.CreatedAt DESC, a.AppointmentID DESC
      LIMIT 5
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
      query += ` AND (FullName ILIKE '%' || @search || '%' OR Email ILIKE '%' || @search || '%')`;
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
      SELECT g.GarageID, g.GarageName, g.Address, g.Phone, g.Email, g.Rating, g.IsActive, g.UserID,
             u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
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
        { name: 'isActive', type: sql.Bit, value: isActive }
      ]
    );

    return { message: 'Cập nhật trạng thái Gara thành công!' };
  }

  // Liên kết tài khoản người dùng cho Gara (hoặc tạo mới tài khoản và liên kết ngay)
  async linkGarageUser(garageId: number, dto: {
    userId?: number;
    createNewUser?: boolean;
    fullName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
  }) {
    // 1. Kiểm tra Gara tồn tại
    const gCheck = await this.dbService.query(
      'SELECT GarageID, GarageName FROM Garages WHERE GarageID = @garageId',
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    if (gCheck.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy Gara.');
    }
    const garage = gCheck.recordset[0];

    let targetUserId = dto.userId;

    // 2. Nếu chọn tạo tài khoản mới
    if (dto.createNewUser) {
      if (!dto.email || !dto.password || !dto.fullName) {
        throw new BadRequestException('Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu cho tài khoản Gara.');
      }
      const email = dto.email.trim().toLowerCase();

      // Kiểm tra trùng Email
      const existUser = await this.dbService.query(
        'SELECT UserID FROM Users WHERE LOWER(Email) = @email',
        [{ name: 'email', type: sql.VarChar, value: email }]
      );
      if (existUser.recordset.length > 0) {
        throw new ConflictException(`Email "${email}" đã tồn tại trong hệ thống. Vui lòng sử dụng email khác hoặc chọn liên kết tài khoản có sẵn.`);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const insertRes = await this.dbService.query(
        `INSERT INTO Users (FullName, Email, PhoneNumber, PasswordHash, Role, Status, CreatedAt)
         VALUES (@fullName, @email, @phone, @hash, 'Garage', N'Hoạt động', GETDATE())
         RETURNING UserID`,
        [
          { name: 'fullName', type: sql.NVarChar, value: dto.fullName.trim() },
          { name: 'email', type: sql.VarChar, value: email },
          { name: 'phone', type: sql.VarChar, value: dto.phoneNumber?.trim() || null },
          { name: 'hash', type: sql.VarChar, value: passwordHash },
        ]
      );
      targetUserId = insertRes.recordset[0].UserID;
    } else {
      // 3. Liên kết với tài khoản có sẵn
      if (!targetUserId) {
        throw new BadRequestException('Vui lòng chọn một tài khoản người dùng.');
      }
      const userCheck = await this.dbService.query(
        'SELECT UserID, Role FROM Users WHERE UserID = @userId',
        [{ name: 'userId', type: sql.Int, value: targetUserId }]
      );
      if (userCheck.recordset.length === 0) {
        throw new NotFoundException('Không tìm thấy tài khoản người dùng đã chọn.');
      }
      if (userCheck.recordset[0].Role === 'Admin') {
        throw new BadRequestException('Tài khoản này là Quản trị viên cấp cao (Admin). Không thể gán làm tài khoản đại diện Gara.');
      }
      // Nâng quyền lên 'Garage' nếu chưa phải
      if (userCheck.recordset[0].Role !== 'Garage') {
        await this.dbService.query(
          "UPDATE Users SET Role = 'Garage' WHERE UserID = @userId",
          [{ name: 'userId', type: sql.Int, value: targetUserId }]
        );
      }
    }

    // 4. Gán UserID vào bảng Garages
    await this.dbService.query(
      'UPDATE Garages SET UserID = @userId WHERE GarageID = @garageId',
      [
        { name: 'userId', type: sql.Int, value: targetUserId },
        { name: 'garageId', type: sql.Int, value: garageId },
      ]
    );

    // 5. Lấy thông tin user vừa liên kết để trả về
    const userInfo = await this.dbService.query(
      'SELECT UserID, FullName, Email, PhoneNumber FROM Users WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: targetUserId }]
    );

    return {
      message: `Đã liên kết tài khoản cho Gara "${garage.GarageName}" thành công!`,
      garageId,
      user: userInfo.recordset[0],
    };
  }

  // Đăng nhập nhanh với tư cách tài khoản Gara (Impersonation dành cho Admin)
  async impersonateGarage(garageId: number) {
    const garageRes = await this.dbService.query(
      `SELECT g.GarageID, g.GarageName, g.UserID, u.Email, u.Role, u.FullName, u.PhoneNumber, u.Status
       FROM Garages g
       JOIN Users u ON g.UserID = u.UserID
       WHERE g.GarageID = @garageId`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );

    if (garageRes.recordset.length === 0 || !garageRes.recordset[0].UserID) {
      throw new BadRequestException('Gara này chưa được liên kết với bất kỳ tài khoản người dùng nào. Vui lòng bấm "Liên kết tài khoản" trước.');
    }

    const u = garageRes.recordset[0];
    if (u.Status === 'Bị khóa') {
      throw new BadRequestException('Tài khoản đại diện của Gara này đang bị khóa trong hệ thống.');
    }

    const payload = { userId: u.UserID, email: u.Email, role: u.Role ? u.Role.trim() : 'Garage' };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: `Đăng nhập thành công vào Gara "${u.GarageName}"!`,
      token,
      user: {
        userId: u.UserID,
        fullName: u.FullName,
        email: u.Email,
        phoneNumber: u.PhoneNumber,
        role: u.Role,
        status: u.Status,
      },
    };
  }

  // Đặt lại mật khẩu tài khoản Gara
  async resetGaragePassword(garageId: number, newPassword: string) {
    const garageRes = await this.dbService.query(
      'SELECT UserID, GarageName FROM Garages WHERE GarageID = @garageId',
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    if (garageRes.recordset.length === 0 || !garageRes.recordset[0].UserID) {
      throw new BadRequestException('Gara chưa có tài khoản liên kết để đổi mật khẩu.');
    }
    const userId = garageRes.recordset[0].UserID;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.dbService.query(
      'UPDATE Users SET PasswordHash = @hash WHERE UserID = @userId',
      [
        { name: 'hash', type: sql.VarChar, value: passwordHash },
        { name: 'userId', type: sql.Int, value: userId },
      ]
    );

    return {
      message: `Đã cập nhật mật khẩu mới cho tài khoản đại diện Gara "${garageRes.recordset[0].GarageName}"!`,
    };
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
       VALUES (@fullName, @email, @phoneNumber, @passwordHash, 'Garage', N'Hoạt động', GETDATE())
       RETURNING UserID`,
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
       VALUES (@userId, @garageName, @address, @phone, @email, @rating, true)
       RETURNING GarageID`,
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
