import { IsNotEmpty, IsNumber, Min, IsOptional, IsString, IsIn, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: 'ID của lịch hẹn nếu thanh toán cọc hoặc thanh toán hóa đơn lịch hẹn', example: 1 })
  @IsOptional()
  @IsInt()
  appointmentId?: number;

  @ApiProperty({ description: 'Số tiền thanh toán (VND)', example: 100000 })
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(1000, { message: 'Số tiền thanh toán tối thiểu là 1.000 VNĐ' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Phương thức thanh toán',
    enum: ['VNPAY', 'MoMo', 'ZaloPay', 'Cash'],
    example: 'VNPAY',
  })
  @IsOptional()
  @IsIn(['VNPAY', 'MoMo', 'ZaloPay', 'Cash'], { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Ghi chú / Thông tin đơn hàng', example: 'Thanh toán cọc lịch hẹn bảo dưỡng ACOH' })
  @IsOptional()
  @IsString()
  orderInfo?: string;
}
