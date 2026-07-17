import { IsNotEmpty, IsString, IsIn, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Biển số xe của phương tiện (duy nhất)',
    example: '59A-123.45',
  })
  @IsNotEmpty({ message: 'Biển số xe không được để trống' })
  @IsString({ message: 'Biển số xe phải là chuỗi ký tự' })
  licensePlate: string;

  @ApiProperty({
    description: 'Loại phương tiện',
    enum: ['Ô tô', 'Xe máy'],
    example: 'Ô tô',
  })
  @IsNotEmpty({ message: 'Loại xe không được để trống' })
  @IsIn(['Ô tô', 'Xe máy'], { message: 'Loại xe phải là "Ô tô" hoặc "Xe máy"' })
  vehicleType: string;

  @ApiProperty({
    description: 'Hãng sản xuất của xe',
    example: 'Toyota',
  })
  @IsNotEmpty({ message: 'Hãng xe không được để trống' })
  @IsString({ message: 'Hãng xe phải là chuỗi ký tự' })
  brand: string;

  @ApiProperty({
    description: 'Dòng xe / Phiên bản',
    example: 'Vios 1.5G',
  })
  @IsNotEmpty({ message: 'Dòng xe không được để trống' })
  @IsString({ message: 'Dòng xe phải là chuỗi ký tự' })
  model: string;

  @ApiPropertyOptional({
    description: 'Năm sản xuất của xe',
    example: 2020,
  })
  @IsOptional()
  @IsInt({ message: 'Năm sản xuất phải là số nguyên' })
  @Min(1900, { message: 'Năm sản xuất không hợp lệ' })
  manufactureYear?: number;

  @ApiPropertyOptional({
    description: 'Ngày mua xe',
    example: '2020-05-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày mua phải đúng định dạng ngày tháng (YYYY-MM-DD)' })
  purchaseDate?: string;

  @ApiProperty({
    description: 'Số kilomet hiện tại (Odometer)',
    example: 35200,
  })
  @IsNotEmpty({ message: 'Số km hiện tại không được để trống' })
  @IsInt({ message: 'Số km phải là số nguyên' })
  @Min(0, { message: 'Số km không được âm' })
  currentOdometer: number;
}
