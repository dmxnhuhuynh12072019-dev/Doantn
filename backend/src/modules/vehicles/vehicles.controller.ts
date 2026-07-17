import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateOdometerDto } from './dto/update-odometer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Vehicles')
@ApiBearerAuth('JWT-auth')
@Controller('api/vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phương tiện của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về mảng danh sách phương tiện.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async findAll(@User() user: any) {
    return this.vehiclesService.findAll(user.userId, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một phương tiện cụ thể theo ID' })
  @ApiParam({ name: 'id', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về thông tin chi tiết xe.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập xe này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  async findOne(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.vehiclesService.findOne(id, user.userId, user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Đăng ký thêm phương tiện mới' })
  @ApiResponse({ status: 201, description: 'Thêm phương tiện mới thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 409, description: 'Biển số xe đã được đăng ký.' })
  async create(@User() user: any, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin cố định của phương tiện (Hãng xe, dòng xe, năm, ngày mua)' })
  @ApiParam({ name: 'id', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Cập nhật xe thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa xe này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, user.userId, user.role, dto);
  }

  @Patch(':id/odometer')
  @ApiOperation({ summary: 'Cập nhật nhanh chỉ số kilomet thực tế (Odometer)' })
  @ApiParam({ name: 'id', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Cập nhật số kilomet thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật xe này.' })
  @ApiResponse({ status: 409, description: 'Số km mới nhỏ hơn số km hiện tại.' })
  async updateOdometer(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: UpdateOdometerDto,
  ) {
    return this.vehiclesService.updateOdometer(id, user.userId, user.role, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phương tiện khỏi hệ thống' })
  @ApiParam({ name: 'id', description: 'ID của phương tiện', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa phương tiện thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa xe này.' })
  async delete(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.vehiclesService.delete(id, user.userId, user.role);
  }
}
