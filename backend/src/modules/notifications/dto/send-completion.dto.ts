import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendCompletionDto {
  @ApiProperty({
    description: 'ID của phương tiện',
    example: 1,
  })
  @IsNotEmpty({ message: 'VehicleID không được để trống' })
  @IsInt({ message: 'VehicleID phải là số nguyên' })
  vehicleId: number;

  @ApiProperty({
    description: 'Chi tiết dịch vụ hoàn tất',
    example: 'Thay nhớt máy, đảo lốp xe và cân mâm',
  })
  @IsNotEmpty({ message: 'Chi tiết dịch vụ không được để trống' })
  @IsString({ message: 'Chi tiết dịch vụ phải là chuỗi ký tự' })
  details: string;

  @ApiPropertyOptional({
    description: 'ID của lịch hẹn (nếu có)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'AppointmentID phải là số nguyên' })
  appointmentId?: number;

  @ApiPropertyOptional({
    description: 'ID của Gara thực hiện',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'GarageID phải là số nguyên' })
  garageId?: number;
}
