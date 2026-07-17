import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
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
}
