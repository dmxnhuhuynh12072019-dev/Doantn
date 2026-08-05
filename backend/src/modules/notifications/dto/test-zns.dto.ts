import { IsOptional, IsString } from 'class-validator';

export class TestZnsDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
