import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GaragesService } from './garages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Garages')
@ApiBearerAuth('JWT-auth')
@Controller('api/garages')
@UseGuards(JwtAuthGuard)
export class GaragesController {
  constructor(private garagesService: GaragesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các Gara liên kết đang hoạt động' })
  @ApiResponse({ status: 200, description: 'Trả về mảng danh sách Gara.' })
  async findAll() {
    return this.garagesService.findAll();
  }

  @Get('serviced-vehicles')
  @Roles('Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách các xe đã từng bảo dưỡng tại Gara' })
  @ApiQuery({ name: 'search', description: 'Tìm kiếm theo biển số xe (tùy chọn)', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Trả về danh sách xe.' })
  async getServicedVehicles(@User() user: any, @Query('search') search?: string) {
    return this.garagesService.getServicedVehicles(user.userId, user.role, search || '');
  }

  @Get('vehicle-profile/:vehicleId')
  @Roles('Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xem hồ sơ định danh chi tiết và toàn bộ lịch sử sửa chữa của chiếc xe tại Gara' })
  @ApiParam({ name: 'vehicleId', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về hồ sơ xe và lịch sử sửa chữa.' })
  async getVehicleProfile(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @User() user: any,
  ) {
    return this.garagesService.getVehicleProfile(user.userId, user.role, vehicleId);
  }
}
