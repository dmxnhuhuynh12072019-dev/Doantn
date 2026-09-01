import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber, Min, Max, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGarageDto {
  @ApiProperty({
    description: 'Họ và tên của chủ/đại diện Gara',
    example: 'Nguyễn Văn Huấn',
  })
  @IsNotEmpty({ message: 'Họ tên chủ Gara không được để trống' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName: string;

  @ApiProperty({
    description: 'Email đăng nhập hệ thống của Gara',
    example: 'gara.autocare@acoh.vn',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
    example: 'gara123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại cá nhân của chủ Gara',
    example: '0912345678',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Tên trung tâm / xưởng Gara đối tác',
    example: 'Gara AutoCare Hưng Yên',
  })
  @IsNotEmpty({ message: 'Tên Gara không được để trống' })
  @IsString({ message: 'Tên Gara phải là chuỗi ký tự' })
  garageName: string;

  @ApiProperty({
    description: 'Địa chỉ hoạt động của Gara',
    example: '123 Đường Nguyễn Trãi, TP. Hưng Yên',
  })
  @IsNotEmpty({ message: 'Địa chỉ Gara không được để trống' })
  @IsString({ message: 'Địa chỉ Gara phải là chuỗi ký tự' })
  address: string;

  @ApiPropertyOptional({
    description: 'Hotline xưởng dịch vụ Gara',
    example: '02213888999',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsString({ message: 'Hotline Gara phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email liên hệ công việc của Gara',
    example: 'contact@autocare.vn',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => o.garageEmail !== undefined && o.garageEmail !== null && String(o.garageEmail).trim() !== '')
  @IsEmail({}, { message: 'Email Gara không đúng định dạng' })
  garageEmail?: string;

  @ApiPropertyOptional({
    description: 'Đánh giá ban đầu (0 - 5 sao)',
    example: 5.0,
    default: 5.0,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : 5.0))
  @IsNumber({}, { message: 'Đánh giá phải là số' })
  @Min(0, { message: 'Đánh giá tối thiểu là 0' })
  @Max(5, { message: 'Đánh giá tối đa là 5' })
  rating?: number;
}
