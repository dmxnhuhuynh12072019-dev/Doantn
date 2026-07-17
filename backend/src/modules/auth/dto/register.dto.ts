import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Họ và tên của người dùng',
    example: 'Lê Văn User',
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName: string;

  @ApiProperty({
    description: 'Địa chỉ email dùng làm tài khoản đăng nhập',
    example: 'user@acoh.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    example: 'user123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại liên hệ',
    example: '0905556666',
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Vai trò trong hệ thống',
    enum: ['User', 'Garage', 'Admin'],
    example: 'User',
    default: 'User',
  })
  @IsOptional()
  @IsIn(['User', 'Garage', 'Admin'], { message: 'Vai trò không hợp lệ' })
  role?: string;
}
