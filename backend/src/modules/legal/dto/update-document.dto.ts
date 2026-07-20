import { IsString, IsIn, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Loại giấy tờ',
    enum: ['Đăng kiểm', 'Bảo hiểm dân sự', 'Bảo hiểm vật chất'],
    example: 'Bảo hiểm dân sự',
  })
  @IsOptional()
  @IsIn(['Đăng kiểm', 'Bảo hiểm dân sự', 'Bảo hiểm vật chất'], {
    message: 'Loại giấy tờ phải là "Đăng kiểm", "Bảo hiểm dân sự" hoặc "Bảo hiểm vật chất"',
  })
  documentType?: string;

  @ApiPropertyOptional({
    description: 'Ngày cấp',
    example: '2025-09-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày cấp phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày hết hạn',
    example: '2026-09-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày hết hạn phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Ngưỡng cảnh báo trước khi hết hạn (số ngày)',
    example: 30,
  })
  @IsOptional()
  @IsInt({ message: 'Ngưỡng ngày cảnh báo phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng ngày cảnh báo không được nhỏ hơn 0' })
  alertThresholdDays?: number;
}
