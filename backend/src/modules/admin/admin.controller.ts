import { Controller, Get, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy dữ liệu báo cáo thống kê toàn hệ thống' })
  @ApiResponse({ status: 200, description: 'Trả về dữ liệu stats tổng quan.' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(search || '', role || '');
  }

  @Put('users/:userId/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái người dùng (Hoạt động / Bị khóa)' })
  async updateUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(userId, status);
  }

  @Put('users/:userId/role')
  @ApiOperation({ summary: 'Cập nhật vai trò người dùng (User / Garage / Admin)' })
  async updateUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Get('garages')
  @ApiOperation({ summary: 'Lấy danh sách Gara' })
  async getGarages() {
    return this.adminService.getGarages();
  }

  @Put('garages/:garageId/status')
  @ApiOperation({ summary: 'Bật/tắt trạng thái hoạt động của Gara' })
  async updateGarageStatus(
    @Param('garageId', ParseIntPipe) garageId: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateGarageStatus(garageId, isActive);
  }
}
