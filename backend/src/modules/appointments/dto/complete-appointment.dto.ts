import { IsNotEmpty, IsInt, IsNumber, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteAppointmentDto {
  @ApiProperty({
    description: 'Chỉ số Odometer hiện tại của xe lúc hoàn thành sửa chữa',
    example: 36000,
  })
  @IsNotEmpty({ message: 'Số km (Odometer) không được để trống' })
  @IsInt({ message: 'Số km phải là số nguyên' })
  @Min(0, { message: 'Số km không được âm' })
  odometer: number;

  @ApiProperty({
    description: 'Tổng chi phí của dịch vụ sửa chữa',
    example: 1500000,
  })
  @IsNotEmpty({ message: 'Tổng chi phí không được để trống' })
  @IsNumber({}, { message: 'Tổng chi phí phải là số' })
  @Min(0, { message: 'Tổng chi phí không được âm' })
  totalCost: number;

  @ApiProperty({
    description: 'Nội dung chi tiết dịch vụ đã thực hiện',
    example: 'Thay nhớt, thay lọc dầu động cơ, kiểm tra phanh.',
  })
  @IsNotEmpty({ message: 'Chi tiết dịch vụ không được để trống' })
  @IsString({ message: 'Chi tiết dịch vụ phải là chuỗi ký tự' })
  details: string;
}
