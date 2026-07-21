import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('User')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Khách hàng đặt lịch hẹn bảo dưỡng sửa xe tại Gara' })
  @ApiResponse({ status: 201, description: 'Đặt lịch thành công.' })
  async create(@User() user: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.userId, dto);
  }

  @Get('user')
  @Roles('User')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Khách hàng xem danh sách các lịch đặt hẹn của mình' })
  @ApiResponse({ status: 200, description: 'Trả về mảng lịch hẹn của khách hàng.' })
  async findAllForUser(@User() user: any) {
    return this.appointmentsService.findAllForUser(user.userId);
  }

  @Get('garage')
  @Roles('Garage')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Gara đối tác xem danh sách các lịch hẹn của xưởng mình' })
  @ApiResponse({ status: 200, description: 'Trả về mảng lịch hẹn đặt tại Gara.' })
  async findAllForGarage(@User() user: any) {
    return this.appointmentsService.findAllForGarage(user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái lịch hẹn (Xác nhận, Đang sửa chữa, Hủy lịch)' })
  @ApiParam({ name: 'id', description: 'ID của lịch hẹn', type: Number })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, user.userId, user.role, dto);
  }

  @Patch(':id/complete-and-notify')
  @Roles('Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Gara xác nhận xe đã sửa xong, hoàn tất lịch hẹn, ghi nhận lịch sử bảo dưỡng và gửi thông báo cho khách' })
  @ApiParam({ name: 'id', description: 'ID của lịch hẹn', type: Number })
  @ApiResponse({ status: 200, description: 'Đã hoàn tất lịch hẹn và gửi thông báo.' })
  async completeAndNotify(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
    @Body() dto: CompleteAppointmentDto,
  ) {
    return this.appointmentsService.completeAndNotify(id, user.userId, user.role, dto);
  }
}
