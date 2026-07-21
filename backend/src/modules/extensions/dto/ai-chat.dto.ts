import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiChatDto {
  @ApiProperty({ description: 'Nội dung câu hỏi gửi đến trợ lý AI', example: 'Xe Toyota Vios đi được 40.000 km cần thay những gì?' })
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @IsString({ message: 'Nội dung câu hỏi phải là chuỗi ký tự' })
  message: string;
}
