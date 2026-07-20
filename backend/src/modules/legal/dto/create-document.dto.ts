import { IsNotEmpty, IsString, IsIn, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'ID của phương tiện',
    example: 1,
  })
  @IsNotEmpty({ message: 'VehicleID không được để trống' })
  @IsInt({ message: 'VehicleID phải là số nguyên' })
  vehicleId: number;

  @ApiProperty({
    description: 'Loại giấy tờ',
    enum: ['Đăng kiểm', 'Bảo hiểm dân sự', 'Bảo hiểm vật chất'],
    example: 'Bảo hiểm dân sự',
  })
  @IsNotEmpty({ message: 'Loại giấy tờ không được để trống' })
  @IsIn(['Đăng kiểm', 'Bảo hiểm dân sự', 'Bảo hiểm vật chất'], {
    message: 'Loại giấy tờ phải là "Đăng kiểm", "Bảo hiểm dân sự" hoặc "Bảo hiểm vật chất"',
  })
  documentType: string;

  @ApiPropertyOptional({
    description: 'Ngày cấp',
    example: '2025-09-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày cấp phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  issueDate?: string;

  @ApiProperty({
    description: 'Ngày hết hạn',
    example: '2026-09-15',
  })
  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống' })
  @IsDateString({}, { message: 'Ngày hết hạn phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  expiryDate: string;

  @ApiPropertyOptional({
    description: 'Ngưỡng cảnh báo trước khi hết hạn (số ngày)',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt({ message: 'Ngưỡng ngày cảnh báo phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng ngày cảnh báo không được nhỏ hơn 0' })
  alertThresholdDays?: number;
}
