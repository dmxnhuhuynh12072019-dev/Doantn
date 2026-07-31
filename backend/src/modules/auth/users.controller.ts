import { Controller, Put, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

class UpdatePreferencesDto {
  themePreference: string;
}

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private authService: AuthService) {}

  @Put('preferences')
  @ApiOperation({ summary: 'Cập nhật tùy chọn giao diện (Light/Dark/System)' })
  @ApiResponse({ status: 200, description: 'Cập nhật tùy chọn giao diện thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async updatePreferences(@User() user: any, @Body() dto: UpdatePreferencesDto) {
    if (!dto || !dto.themePreference) {
      throw new BadRequestException('Thiếu trường themePreference');
    }
    return this.authService.updateThemePreference(user.userId, dto.themePreference);
  }
}
