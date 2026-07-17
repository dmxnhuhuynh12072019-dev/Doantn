import { Controller, Post, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký tài khoản thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về JWT Token.' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ cá nhân của người dùng đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin hồ sơ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Thiếu token).' })
  async getProfile(@User() user: any) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật hồ sơ thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async updateProfile(@User() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Put('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu trực tiếp' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công.' })
  @ApiResponse({ status: 400, description: 'Mật khẩu cũ không chính xác.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async changePassword(@User() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.userId, dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu khôi phục mật khẩu (Gửi mã OTP qua email)' })
  @ApiResponse({ status: 200, description: 'OTP đã được gửi thành công.' })
  @ApiResponse({ status: 404, description: 'Email không tồn tại.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng mã OTP' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công.' })
  @ApiResponse({ status: 400, description: 'Mã OTP không hợp lệ hoặc đã hết hạn.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }
}
