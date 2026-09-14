import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGarageSettingsDto {
  @ApiPropertyOptional({ description: 'Tên Gara / Trung tâm dịch vụ', example: 'AutoCare Central Garage' })
  @IsOptional()
  @IsString()
  garageName?: string;

  @ApiPropertyOptional({ description: 'Tên người đại diện / Quản lý', example: 'Nguyễn Văn Quản Lý' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại liên hệ / Hotline', example: '0313728397' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Hotline cứu hộ khẩn cấp 24/7', example: '1900 6868' })
  @IsOptional()
  @IsString()
  rescueHotline?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ của Gara', example: 'garage@autocare.vn' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ chi tiết xưởng dịch vụ', example: '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Mã số thuế / Giấy phép kinh doanh', example: '0109887766' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Mô tả / Khẩu hiệu / Giới thiệu năng lực', example: 'Chuyên bảo dưỡng & sửa chữa ô tô cao cấp.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Khung giờ mở cửa', example: '07:30 - 18:00' })
  @IsOptional()
  @IsString()
  openingHours?: string;

  @ApiPropertyOptional({ description: 'Ngày làm việc trong tuần', example: 'Thứ 2 - Thứ 7 (Nghỉ CN)' })
  @IsOptional()
  @IsString()
  openDays?: string;

  @ApiPropertyOptional({ description: 'Số khoang sửa chữa / Cầu nâng', example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  serviceCapacity?: number;

  @ApiPropertyOptional({ description: 'Thời gian phục vụ trung bình mỗi lượt (phút)', example: 45 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  slotDuration?: number;

  @ApiPropertyOptional({ description: 'Số lượt xe tiếp nhận tối đa mỗi khung giờ', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxParallelSlots?: number;

  @ApiPropertyOptional({ description: 'Tên ngân hàng thụ hưởng', example: 'Vietcombank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Số tài khoản ngân hàng', example: '998877665544' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Tên chủ tài khoản', example: 'CTY TNHH DICH VU AUTOCARE' })
  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @ApiPropertyOptional({ description: 'Danh sách dịch vụ mũi nhọn', example: 'Bảo dưỡng định kỳ, Sửa chữa gầm máy, Đồng sơn' })
  @IsOptional()
  @IsString()
  servicesOffered?: string;

  @ApiPropertyOptional({ description: 'Thuế suất VAT mặc định (%)', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  vatRate?: number;

  @ApiPropertyOptional({ description: 'Chính sách bảo hành & điều khoản', example: 'Bảo hành phụ tùng 12 tháng hoặc 20.000km.' })
  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  @ApiPropertyOptional({ description: 'Lời cảm ơn in chân hóa đơn', example: 'AutoCare trân trọng cảm ơn Quý khách!' })
  @IsOptional()
  @IsString()
  invoiceFooterNote?: string;

  @ApiPropertyOptional({ description: 'Nhận thông báo Zalo ZNS', example: true })
  @IsOptional()
  @IsBoolean()
  receiveZaloNotif?: boolean;

  @ApiPropertyOptional({ description: 'Nhận thông báo SMS', example: true })
  @IsOptional()
  @IsBoolean()
  receiveSmsNotif?: boolean;

  @ApiPropertyOptional({ description: 'Nhận email báo cáo định kỳ', example: true })
  @IsOptional()
  @IsBoolean()
  receiveEmailReport?: boolean;

  @ApiPropertyOptional({ description: 'Bật âm thanh chuông báo lịch hẹn mới', example: true })
  @IsOptional()
  @IsBoolean()
  soundAlertEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Ảnh đại diện / Logo Gara', example: '' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh bìa Gara', example: '' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
