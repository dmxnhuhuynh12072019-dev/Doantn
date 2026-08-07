import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Khởi tạo link thanh toán VNPAY / VietQR động' })
  @ApiResponse({ status: 201, description: 'Khởi tạo thanh toán thành công.' })
  async createPaymentUrl(@User() user: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPaymentUrl(user.userId, dto);
  }

  @Post(':id/simulate-success')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Giả lập thanh toán Sandbox thành công 1-Click' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi Payment', type: Number })
  @ApiResponse({ status: 200, description: 'Giả lập thanh toán thành công.' })
  async simulateSandboxSuccess(@Param('id', ParseIntPipe) id: number, @User() user: any) {
    return this.paymentsService.simulateSandboxSuccess(id, user.userId);
  }

  @Get('vnpay-ipn')
  @ApiOperation({ summary: 'IPN Webhook nhận kết quả tự động từ VNPAY Server' })
  async handleVnPayIpn(@Query() query: any) {
    return this.paymentsService.handleVnPayIpn(query);
  }

  @Get('vnpay-return')
  @ApiOperation({ summary: 'Endpoint chuyển hướng trả về trình duyệt sau khi thao tác trên VNPAY' })
  async handleVnPayReturn(@Query() query: any, @Res() res: any) {
    const rspCode = query.vnp_ResponseCode;
    const txnRef = query.vnp_TxnRef || '';

    // Trả về HTML kết quả giao dịch cực kỳ đẹp mắt cho trình duyệt
    const isSuccess = rspCode === '00';
    const statusText = isSuccess ? 'THANH TOÁN THÀNH CÔNG' : 'THANH TOÁN THẤT BẠI';
    const statusColor = isSuccess ? '#16a34a' : '#dc2626';

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Kết quả thanh toán ACOH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #1e293b; border-radius: 24px; padding: 40px; text-align: center; max-width: 420px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
          .icon { font-size: 56px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: 900; color: ${statusColor}; margin-bottom: 8px; }
          .sub { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
          .info { background: #0f172a; padding: 16px; border-radius: 16px; font-size: 13px; color: #cbd5e1; margin-bottom: 24px; text-align: left; line-height: 1.6; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 28px; border-radius: 14px; font-weight: bold; text-decoration: none; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${isSuccess ? '🎉' : '❌'}</div>
          <div class="title">${statusText}</div>
          <div class="sub">Cổng thanh toán trực tuyến ACOH VNPAY Gateway</div>
          <div class="info">
            <div><strong>Mã giao dịch:</strong> ${txnRef}</div>
            <div><strong>Trạng thái:</strong> ${isSuccess ? 'Đã xác nhận thành công' : 'Đã hủy hoặc có lỗi xảy ra'}</div>
          </div>
          <a href="http://localhost:5173" class="btn">Trở về ứng dụng ACOH</a>
        </div>
      </body>
      </html>
    `;

    return res.type('html').send(html);
  }

  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy lịch sử các giao dịch thanh toán của người dùng' })
  async getMyPaymentHistory(@User() user: any) {
    return this.paymentsService.getMyPaymentHistory(user.userId);
  }
}
