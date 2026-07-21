import { IsNotEmpty, IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID của Gara muốn đặt lịch',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID Gara không được để trống' })
  @IsInt({ message: 'ID Gara phải là số nguyên' })
  garageId: number;

  @ApiProperty({
    description: 'ID của phương tiện muốn đặt lịch',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID phương tiện không được để trống' })
  @IsInt({ message: 'ID phương tiện phải là số nguyên' })
  vehicleId: number;

  @ApiProperty({
    description: 'Thời gian đặt hẹn',
    example: '2026-07-25T09:00:00',
  })
  @IsNotEmpty({ message: 'Thời gian hẹn không được để trống' })
  @IsDateString({}, { message: 'Thời gian hẹn phải đúng định dạng ngày giờ' })
  appointmentDate: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm của người dùng',
    example: 'Tôi muốn kiểm tra thắng và thay nhớt định kỳ.',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;
}
