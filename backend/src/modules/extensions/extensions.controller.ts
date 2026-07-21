import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ExtensionsService } from './extensions.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Extensions')
@ApiBearerAuth('JWT-auth')
@Controller('api/extensions')
@UseGuards(JwtAuthGuard)
export class ExtensionsController {
  constructor(private extensionsService: ExtensionsService) {}

  @Post('ai-chat')
  @ApiOperation({ summary: 'Gửi tin nhắn trò chuyện với Trợ lý ảo AI' })
  @ApiResponse({ status: 200, description: 'Trả về phản hồi của AI.' })
  async chatWithAI(@Body() dto: AiChatDto) {
    const reply = await this.extensionsService.chatWithAI(dto.message);
    return { reply };
  }

  @Post('garages/:id/reviews')
  @Roles('User', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Viết đánh giá chất lượng cho Gara' })
  @ApiParam({ name: 'id', description: 'ID của Gara', type: Number })
  @ApiResponse({ status: 201, description: 'Đánh giá thành công.' })
  async createReview(
    @Param('id', ParseIntPipe) garageId: number,
    @User() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.extensionsService.createReview(user.userId, garageId, dto.rating, dto.comment);
  }

  @Get('garages/:id/reviews')
  @ApiOperation({ summary: 'Lấy danh sách các đánh giá của Gara' })
  @ApiParam({ name: 'id', description: 'ID của Gara', type: Number })
  @ApiResponse({ status: 200, description: 'Trả về mảng danh sách đánh giá.' })
  async getReviews(@Param('id', ParseIntPipe) garageId: number) {
    return this.extensionsService.getReviews(garageId);
  }

  @Get('export/expenses')
  @Roles('User', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xuất báo cáo chi tiêu cá nhân ra file CSV' })
  async exportExpenses(@User() user: any, @Res() res: any) {
    const csvContent = await this.extensionsService.exportExpenses(user.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=user_expenses.csv');
    res.status(200).send(csvContent);
  }

  @Get('export/invoice/:appointmentId')
  @Roles('User', 'Garage', 'Admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Xuất hóa đơn bảo dưỡng chi tiết ra file CSV' })
  @ApiParam({ name: 'appointmentId', description: 'ID của lịch hẹn', type: Number })
  async exportInvoice(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @User() user: any,
    @Res() res: any,
  ) {
    try {
      const csvContent = await this.extensionsService.exportInvoice(appointmentId, user.userId, user.role);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_appt_${appointmentId}.csv`);
      res.status(200).send(csvContent);
    } catch (err) {
      res.status(400).json({ message: err.message || 'Xuất hóa đơn thất bại' });
    }
  }
}
