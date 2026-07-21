import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendCompletionDto } from './dto/send-completion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng đăng nhập' })
  @ApiResponse({ status: 200, description: 'Trả về mảng danh sách thông báo.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async findAll(@User() user: any) {
    return this.notificationsService.findAllByUser(user.userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu đọc tất cả thông báo của người dùng đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đánh dấu đọc tất cả thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async markAllAsRead(@User() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo cụ thể là đã đọc' })
  @ApiParam({ name: 'id', description: 'ID của thông báo', type: Number })
  @ApiResponse({ status: 200, description: 'Đánh dấu đọc thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thao tác trên thông báo này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo.' })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Post('send-completion')
  @ApiOperation({ summary: 'Gửi thông báo hoàn thành bảo dưỡng xe (Dành cho Gara hoặc Admin)' })
  @ApiResponse({ status: 201, description: 'Gửi thông báo hoàn thành thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện.' })
  async sendCompletion(@User() user: any, @Body() dto: SendCompletionDto) {
    return this.notificationsService.sendCompletionNotification(user.userId, user.role, dto);
  }

  @Post('trigger-cron')
  @ApiOperation({ summary: 'Chạy thử quét hệ thống tức thì (Phục vụ việc kiểm thử/Demo)' })
  @ApiResponse({ status: 200, description: 'Đã hoàn thành quét hệ thống.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực.' })
  async triggerCron() {
    return this.notificationsService.runSystemScan();
  }
}
