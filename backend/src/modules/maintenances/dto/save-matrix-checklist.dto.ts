import { IsNotEmpty, IsInt, Min, IsArray, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveMatrixChecklistDto {
  @ApiProperty({
    description: 'ID của phương tiện',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID xe không được để trống' })
  @IsInt({ message: 'ID xe phải là số nguyên' })
  vehicleId: number;

  @ApiProperty({
    description: 'Số km thực tế hoặc mốc km bảo dưỡng',
    example: 5000,
  })
  @IsNotEmpty({ message: 'Số kilomet không được để trống' })
  @IsInt({ message: 'Số kilomet phải là số nguyên' })
  @Min(0, { message: 'Số kilomet không được âm' })
  odometer: number;

  @ApiProperty({
    description: 'Danh sách ID của các hạng mục được chọn bảo dưỡng',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'Danh sách hạng mục phải là một mảng' })
  @ArrayNotEmpty({ message: 'Phải chọn ít nhất một hạng mục bảo dưỡng' })
  @IsInt({ each: true, message: 'Mỗi ID hạng mục phải là số nguyên' })
  selectedItemIds: number[];

  @ApiPropertyOptional({
    description: 'Ghi chú thêm về việc bảo dưỡng theo khung mốc',
    example: 'Thực hiện bảo dưỡng mốc 5.000km tại garage',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notes?: string;
}
