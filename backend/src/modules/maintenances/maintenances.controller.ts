import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MaintenancesService } from './maintenances.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateHistoryGarageDto } from './dto/create-history-garage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Maintenances')
@ApiBearerAuth('JWT-auth')
@Controller('api/maintenances')
@UseGuards(JwtAuthGuard)
export class MaintenancesController {
  constructor(private maintenancesService: MaintenancesService) {}

  @Get('schedules/:vehicleId')
  @ApiOperation({ summary: 'Lấy kế hoạch nhắc bảo dưỡng dự kiến của xe' })
  @ApiParam({ name: 'vehicleId', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về mảng lịch nhắc bảo dưỡng.' })
  async getSchedules(@Param('vehicleId', ParseIntPipe) vehicleId: number, @User() user: any) {
    return this.maintenancesService.getSchedules(vehicleId, user.userId, user.role);
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Tạo lịch nhắc/mốc bảo dưỡng mới' })
  @ApiResponse({ status: 201, description: 'Tạo lịch nhắc bảo dưỡng thành công.' })
  async createSchedule(@User() user: any, @Body() dto: CreateScheduleDto) {
    return this.maintenancesService.createSchedule(user.userId, user.role, dto);
  }

  @Put('schedules/:id')
  @ApiOperation({ summary: 'Cập nhật trạng thái hoặc thông tin lịch nhắc bảo dưỡng' })
  @ApiParam({ name: 'id', description: 'ID của lịch nhắc', type: Number })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.maintenancesService.updateSchedule(id, user.userId, user.role, dto);
  }

  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Xóa lịch nhắc bảo dưỡng' })
  @ApiParam({ name: 'id', description: 'ID của lịch nhắc', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  async deleteSchedule(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.maintenancesService.deleteSchedule(id, user.userId, user.role);
  }

  @Get('history/:vehicleId')
  @ApiOperation({ summary: 'Lấy toàn bộ lịch sử sửa chữa trong quá khứ của xe' })
  @ApiParam({ name: 'vehicleId', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về danh sách lịch sử sửa chữa.' })
  async getHistory(@Param('vehicleId', ParseIntPipe) vehicleId: number, @User() user: any) {
    return this.maintenancesService.getHistory(vehicleId, user.userId, user.role);
  }

  @Post('history/garage')
  @Roles('Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Gara trực tiếp ghi sổ lịch sử bảo dưỡng xe cho khách' })
  @ApiResponse({ status: 201, description: 'Ghi sổ thành công.' })
  async createHistoryGarage(@User() user: any, @Body() dto: CreateHistoryGarageDto) {
    return this.maintenancesService.createHistoryGarage(user.userId, user.role, dto);
  }

  @Get('vehicles/search')
  @Roles('Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Tìm xe theo biển số dành cho Gara ghi sổ' })
  @ApiQuery({ name: 'licensePlate', description: 'Biển số xe cần tìm', type: String })
  @ApiResponse({ status: 200, description: 'Trả về thông tin xe.' })
  async searchVehicle(@Query('licensePlate') licensePlate: string) {
    return this.maintenancesService.searchVehicleByLicensePlate(licensePlate);
  }
}
