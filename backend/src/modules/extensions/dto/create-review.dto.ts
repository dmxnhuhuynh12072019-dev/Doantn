import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Điểm đánh giá (1-5)', example: 5 })
  @IsNotEmpty({ message: 'Điểm đánh giá không được để trống' })
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên' })
  @Min(1, { message: 'Điểm đánh giá nhỏ nhất là 1' })
  @Max(5, { message: 'Điểm đánh giá lớn nhất là 5' })
  rating: number;

  @ApiProperty({ description: 'Nội dung bình luận phản hồi', example: 'Dịch vụ rất tốt, nhân viên thân thiện!', required: false })
  @IsOptional()
  @IsString({ message: 'Bình luận phải là chuỗi ký tự' })
  comment?: string;
}
