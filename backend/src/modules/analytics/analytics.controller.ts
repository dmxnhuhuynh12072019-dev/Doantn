import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('garage/dashboard')
  @Roles('Garage')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy dữ liệu báo cáo vận hành Gara (Garage Dashboard)' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu thống kê doanh thu và xe.' })
  async getGarageDashboard(@User() user: any) {
    return this.analyticsService.getGarageDashboard(user.userId);
  }

  @Get('user/expenses')
  @Roles('User', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy dữ liệu báo cáo phân tích chi tiêu cá nhân của Chủ xe (User Dashboard)' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu thống kê chi phí nuôi xe theo tháng và theo đầu xe.' })
  async getUserExpenses(@User() user: any) {
    return this.analyticsService.getUserExpenses(user.userId);
  }
}
