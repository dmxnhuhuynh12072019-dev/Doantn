import { IsNotEmpty, IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của lịch hẹn',
    enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang sửa chữa', 'Hủy lịch'],
    example: 'Đã xác nhận',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  @IsIn(['Chờ xác nhận', 'Đã xác nhận', 'Đang sửa chữa', 'Hủy lịch'], {
    message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Chờ xác nhận, Đã xác nhận, Đang sửa chữa, Hủy lịch',
  })
  status: string;
}
