import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'ID của phương tiện',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID xe không được để trống' })
  @IsInt({ message: 'ID xe phải là số nguyên' })
  vehicleId: number;

  @ApiProperty({
    description: 'Hạng mục bảo dưỡng (VD: Thay nhớt, Thay lốp...)',
    example: 'Thay nhớt định kỳ mốc 40k km',
  })
  @IsNotEmpty({ message: 'Hạng mục bảo dưỡng không được để trống' })
  @IsString({ message: 'Hạng mục bảo dưỡng phải là chuỗi ký tự' })
  categoryName: string;

  @ApiPropertyOptional({
    description: 'Số kilomet đích cần bảo dưỡng',
    example: 40000,
  })
  @IsOptional()
  @IsInt({ message: 'Số kilomet đích phải là số nguyên' })
  @Min(0, { message: 'Số kilomet đích không được âm' })
  targetOdometer?: number;

  @ApiPropertyOptional({
    description: 'Ngày đích cần bảo dưỡng',
    example: '2026-09-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày đích phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  targetDate?: string;

  @ApiPropertyOptional({
    description: 'Số km ngưỡng cảnh báo sớm',
    example: 500,
  })
  @IsOptional()
  @IsInt({ message: 'Ngưỡng cảnh báo phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng cảnh báo không được âm' })
  alertThresholdKM?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú cho lịch nhắc',
    example: 'Khuyên dùng nhớt tổng hợp toàn phần.',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
