import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOdometerDto {
  @ApiProperty({
    description: 'Số kilomet hiện tại (Odometer)',
    example: 36000,
  })
  @IsNotEmpty({ message: 'Số km hiện tại không được để trống' })
  @IsInt({ message: 'Số km phải là số nguyên' })
  @Min(0, { message: 'Số km không được âm' })
  currentOdometer: number;
}
