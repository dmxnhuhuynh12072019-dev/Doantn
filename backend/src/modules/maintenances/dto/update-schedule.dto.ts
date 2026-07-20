import { IsString, IsInt, Min, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    description: 'Hạng mục bảo dưỡng (VD: Thay nhớt, Thay lốp...)',
    example: 'Thay nhớt định kỳ mốc 40k km',
  })
  @IsOptional()
  @IsString({ message: 'Hạng mục bảo dưỡng phải là chuỗi ký tự' })
  categoryName?: string;

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
    description: 'Trạng thái lịch nhắc',
    enum: ['Chưa thực hiện', 'Đã hoàn thành', 'Quá hạn'],
    example: 'Đã hoàn thành',
  })
  @IsOptional()
  @IsIn(['Chưa thực hiện', 'Đã hoàn thành', 'Quá hạn'], {
    message: 'Trạng thái phải là "Chưa thực hiện", "Đã hoàn thành" hoặc "Quá hạn"',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú cho lịch nhắc',
    example: 'Đã thực hiện thay nhớt Mobil 1.',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
