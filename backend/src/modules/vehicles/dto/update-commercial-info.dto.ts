import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommercialInfoDto {
  @ApiPropertyOptional({
    description: 'Có phải là xe chạy dịch vụ (Grab, Be, Xe hợp đồng...) hay không',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isCommercial phải là giá trị boolean (true/false)' })
  isCommercial?: boolean;

  @ApiPropertyOptional({
    description: 'Mã số Hợp tác xã (HTX)',
    example: 'HTX-SAIGON-01',
  })
  @IsOptional()
  @IsString({ message: 'Mã HTX phải là chuỗi ký tự' })
  htxCode?: string;

  @ApiPropertyOptional({
    description: 'Số phù hiệu xe',
    example: 'PH-889911',
  })
  @IsOptional()
  @IsString({ message: 'Số phù hiệu phải là chuỗi ký tự' })
  badgeNumber?: string;
}
