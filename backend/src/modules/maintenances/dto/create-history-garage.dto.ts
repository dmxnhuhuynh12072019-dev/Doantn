import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistoryGarageDto {
  @ApiProperty({
    description: 'ID của phương tiện',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID xe không được để trống' })
  @IsInt({ message: 'ID xe phải là số nguyên' })
  vehicleId: number;

  @ApiPropertyOptional({
    description: 'ID của đơn đặt lịch hẹn liên quan (nếu có)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'ID lịch hẹn phải là số nguyên' })
  appointmentId?: number;

  @ApiProperty({
    description: 'Ngày thực hiện bảo dưỡng',
    example: '2026-07-20',
  })
  @IsNotEmpty({ message: 'Ngày thực hiện không được để trống' })
  @IsDateString({}, { message: 'Ngày thực hiện phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  executionDate: string;

  @ApiProperty({
    description: 'Số kilomet tại thời điểm bảo dưỡng',
    example: 36000,
  })
  @IsNotEmpty({ message: 'Số kilomet thực hiện không được để trống' })
  @IsInt({ message: 'Số kilomet thực hiện phải là số nguyên' })
  @Min(0, { message: 'Số kilomet thực hiện không được âm' })
  executionOdometer: number;

  @ApiProperty({
    description: 'Tổng chi phí bảo dưỡng (VND)',
    example: 1500000,
  })
  @IsNotEmpty({ message: 'Tổng chi phí không được để trống' })
  @IsNumber({}, { message: 'Tổng chi phí phải là số' })
  @Min(0, { message: 'Tổng chi phí không được âm' })
  totalCost: number;

  @ApiProperty({
    description: 'Nội dung chi tiết dịch vụ',
    example: 'Thay nhớt Castrol Magnatec, Thay lọc nhớt động cơ.',
  })
  @IsNotEmpty({ message: 'Chi tiết dịch vụ không được để trống' })
  @IsString({ message: 'Chi tiết dịch vụ phải là chuỗi ký tự' })
  details: string;
}
