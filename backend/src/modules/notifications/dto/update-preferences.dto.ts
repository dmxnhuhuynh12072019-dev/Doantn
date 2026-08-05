import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  receiveZaloNotif?: boolean;

  @IsOptional()
  @IsBoolean()
  receiveSmsNotif?: boolean;

  @IsOptional()
  @IsString()
  zaloPhoneNumber?: string;
}
