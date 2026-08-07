import { IsNotEmpty, IsInt, Min, IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Tên hạng mục dịch vụ / phụ tùng', example: 'Thay nhớt Castrol 4L' })
  @IsNotEmpty({ message: 'Tên hạng mục không được để trống' })
  @IsString()
  item: string;

  @ApiProperty({ description: 'Chi phí (VND)', example: 450000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  cost: number;
}

export class BatchImportInvoiceDto {
  @ApiProperty({ description: 'ID của phương tiện', example: 1 })
  @IsNotEmpty({ message: 'ID xe không được để trống' })
  @IsInt()
  vehicleId: number;

  @ApiPropertyOptional({ description: 'Tên Gara thực hiện', example: 'Gara Ô Tô AutoCare Service' })
  @IsOptional()
  @IsString()
  garageName?: string;

  @ApiPropertyOptional({ description: 'Ngày thực hiện bảo dưỡng (YYYY-MM-DD)', example: '2024-05-20' })
  @IsOptional()
  @IsString()
  executionDate?: string;

  @ApiProperty({ description: 'Số km bàn giao', example: 15000 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  executionOdometer: number;

  @ApiPropertyOptional({ description: 'Tổng tiền thanh toán (VND)', example: 1130000 })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({ description: 'Danh sách các dòng sản phẩm/dịch vụ', type: [InvoiceItemDto] })
  @IsArray()
  items: InvoiceItemDto[];
}
