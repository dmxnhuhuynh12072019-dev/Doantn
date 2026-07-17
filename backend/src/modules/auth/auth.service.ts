import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Bộ nhớ đệm lưu mã OTP khôi phục mật khẩu (in-memory)
  private otpMap = new Map<string, { otp: string; expiresAt: Date }>();

  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Kiểm tra email tồn tại
    const userExistResult = await this.dbService.query(
      'SELECT UserID FROM Users WHERE Email = @email',
      [{ name: 'email', type: sql.VarChar, value: dto.email }]
    );

    if (userExistResult.recordset.length > 0) {
      throw new ConflictException('Email đã được đăng ký bởi người dùng khác');
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 3. Thiết lập các giá trị mặc định nếu thiếu
    const role = dto.role || 'User';
    const status = 'Hoạt động';

    // 4. Thêm vào database
    await this.dbService.query(
      `INSERT INTO Users (FullName, Email, PhoneNumber, PasswordHash, Role, Status, CreatedAt)
       VALUES (@fullName, @email, @phoneNumber, @passwordHash, @role, @status, GETDATE())`,
      [
        { name: 'fullName', type: sql.NVarChar, value: dto.fullName },
        { name: 'email', type: sql.VarChar, value: dto.email },
        { name: 'phoneNumber', type: sql.VarChar, value: dto.phoneNumber || null },
        { name: 'passwordHash', type: sql.VarChar, value: passwordHash },
        { name: 'role', type: sql.VarChar, value: role },
        { name: 'status', type: sql.NVarChar, value: status },
      ]
    );

    return { message: 'Đăng ký tài khoản thành công!' };
  }

  async login(dto: LoginDto) {
    // 1. Lấy thông tin user
    const result = await this.dbService.query(
      'SELECT * FROM Users WHERE Email = @email',
      [{ name: 'email', type: sql.VarChar, value: dto.email }]
    );

    if (result.recordset.length === 0) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const user = result.recordset[0];

    // 2. Kiểm tra trạng thái hoạt động
    if (user.Status === 'Bị khóa') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    // 3. Đối sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(dto.password, user.PasswordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 4. Sinh JWT Token
    const payload = { userId: user.UserID, email: user.Email, role: user.Role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Đăng nhập thành công!',
      token,
      user: {
        userId: user.UserID,
        fullName: user.FullName,
        email: user.Email,
        phoneNumber: user.PhoneNumber,
        role: user.Role,
        status: user.Status,
      },
    };
  }

  async getProfile(userId: number) {
    const result = await this.dbService.query(
      'SELECT UserID, FullName, Email, PhoneNumber, Role, Status, CreatedAt FROM Users WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length === 0) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    const user = result.recordset[0];
    return {
      userId: user.UserID,
      fullName: user.FullName,
      email: user.Email,
      phoneNumber: user.PhoneNumber,
      role: user.Role,
      status: user.Status,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.dbService.query(
      'UPDATE Users SET FullName = @fullName, PhoneNumber = @phoneNumber WHERE UserID = @userId',
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'fullName', type: sql.NVarChar, value: dto.fullName },
        { name: 'phoneNumber', type: sql.VarChar, value: dto.phoneNumber || null },
      ]
    );

    return { message: 'Cập nhật hồ sơ thành công!' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    // 1. Lấy mật khẩu hiện tại
    const result = await this.dbService.query(
      'SELECT PasswordHash FROM Users WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length === 0) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const currentHash = result.recordset[0].PasswordHash;

    // 2. Đối sánh mật khẩu cũ
    const isOldValid = await bcrypt.compare(dto.oldPassword, currentHash);
    if (!isOldValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // 3. Mã hóa và cập nhật mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(dto.newPassword, salt);

    await this.dbService.query(
      'UPDATE Users SET PasswordHash = @passwordHash WHERE UserID = @userId',
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'passwordHash', type: sql.VarChar, value: newHash },
      ]
    );

    return { message: 'Đổi mật khẩu thành công!' };
  }

  async forgotPassword(email: string) {
    // 1. Kiểm tra email có tồn tại không
    const result = await this.dbService.query(
      'SELECT UserID, FullName FROM Users WHERE Email = @email',
      [{ name: 'email', type: sql.VarChar, value: email }]
    );

    if (result.recordset.length === 0) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const user = result.recordset[0];

    // 2. Tạo mã OTP ngẫu nhiên gồm 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP có hiệu lực 10 phút

    this.otpMap.set(email, { otp, expiresAt });

    // 3. Gửi mail OTP qua Nodemailer
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[ACOH] Mã OTP khôi phục mật khẩu tài khoản của bạn',
        text: `Chào ${user.FullName},\n\nMã OTP khôi phục mật khẩu của bạn là: ${otp}\nMã này có hiệu lực trong 10 phút.\n\nTrân trọng,\nĐội ngũ AutoCare Office Helper (ACOH).`,
      });
      this.logger.log(`Gửi email OTP đến ${email} thành công.`);
    } catch (error) {
      // In ra console nếu cấu hình SMTP lỗi để không làm gián đoạn kiểm thử
      this.logger.warn(`Không thể gửi email qua SMTP. Mã OTP cho ${email} là: ${otp}`);
    }

    return { message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // 1. Kiểm tra OTP
    const otpData = this.otpMap.get(email);
    if (!otpData) {
      throw new BadRequestException('Không tìm thấy yêu cầu khôi phục mật khẩu hoặc OTP đã bị hủy');
    }

    if (otpData.otp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    if (new Date() > otpData.expiresAt) {
      this.otpMap.delete(email);
      throw new BadRequestException('Mã OTP đã hết hiệu lực, vui lòng yêu cầu mã mới');
    }

    // 2. Mã hóa mật khẩu mới và cập nhật trong CSDL
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.dbService.query(
      'UPDATE Users SET PasswordHash = @passwordHash WHERE Email = @email',
      [
        { name: 'email', type: sql.VarChar, value: email },
        { name: 'passwordHash', type: sql.VarChar, value: passwordHash },
      ]
    );

    // Xóa OTP sau khi sử dụng thành công
    this.otpMap.delete(email);

    return { message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' };
  }
}
