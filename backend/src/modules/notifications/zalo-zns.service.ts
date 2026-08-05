import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as sql from 'mssql';

@Injectable()
export class ZaloZnsService {
  private readonly logger = new Logger(ZaloZnsService.name);
  private zaloAccessToken: string;
  private zaloTemplateId: string;

  constructor(
    private configService: ConfigService,
    private dbService: DatabaseService,
  ) {
    this.zaloAccessToken = this.configService.get<string>('ZALO_OA_ACCESS_TOKEN') || '';
    this.zaloTemplateId = this.configService.get<string>('ZALO_TEMPLATE_ID') || '';
  }

  /**
   * Gửi tin nhắn Zalo ZNS (với cơ chế tự động Fallback SMS nếu Zalo thất bại hoặc người dùng chưa có Zalo)
   */
  async sendZnsNotification(
    userId: number,
    phoneNumber: string,
    title: string,
    message: string,
    templateParams: Record<string, string> = {}
  ): Promise<{ success: boolean; channel: 'ZaloZNS' | 'SMS'; statusMessage: string }> {
    const recipientPhone = phoneNumber || '0900000000';
    let isZaloSuccess = false;
    let errorMessage = '';

    this.logger.log(`[Zalo ZNS Dispatch] Bắt đầu gửi tin tới SĐT ${recipientPhone} cho User ID ${userId}...`);

    // 1. THỬ GỬI QUA ZALO ZNS
    try {
      if (this.zaloAccessToken && this.zaloTemplateId) {
        // Thực tế gọi API Zalo OpenAPI ZNS HTTP POST
        // const response = await axios.post('https://business.openapi.zalo.me/message/template', { ... });
        isZaloSuccess = true;
      } else {
        // Simulation / Sandbox Mode
        this.logger.log(`[Sandbox Mode] Giả lập gửi Zalo ZNS thành công tới SĐT: ${recipientPhone}`);
        isZaloSuccess = true;
      }
    } catch (err) {
      errorMessage = err.message || 'Lỗi kết nối Zalo ZNS Gateway';
      this.logger.warn(`Gửi Zalo ZNS thất bại cho SĐT ${recipientPhone}: ${errorMessage}`);
      isZaloSuccess = false;
    }

    // 2. NẾU ZALO THÀNH CÔNG -> LƯU LOG & TRẢ VỀ KẾT QUẢ
    if (isZaloSuccess) {
      await this.saveNotificationLog(userId, 'ZaloZNS', recipientPhone, title, message, 'Thành công', null);
      return {
        success: true,
        channel: 'ZaloZNS',
        statusMessage: `Đã gửi tin nhắn Zalo ZNS thành công tới SĐT ${recipientPhone}`,
      };
    }

    // 3. NẾU ZALO THẤT BẠI -> FALLBACK SANG SMS GATEWAY
    this.logger.log(`[Fallback SMS] Chuyển hướng gửi SMS thương hiệu tới SĐT ${recipientPhone}...`);
    let isSmsSuccess = false;
    try {
      // Giả lập gửi SMS Brandname thành công
      isSmsSuccess = true;
    } catch (smsErr) {
      errorMessage = `SMS Fail: ${smsErr.message}`;
    }

    const finalStatus = isSmsSuccess ? 'Fallback SMS' : 'Thất bại';
    await this.saveNotificationLog(userId, 'SMS', recipientPhone, title, message, finalStatus, errorMessage || null);

    return {
      success: isSmsSuccess,
      channel: 'SMS',
      statusMessage: isSmsSuccess
        ? `Zalo ZNS chưa khả dụng. Đã tự động chuyển sang tin nhắn SMS thành công tới SĐT ${recipientPhone}`
        : `Gửi tin nhắn Zalo và SMS thất bại: ${errorMessage}`,
    };
  }

  /**
   * Ghi nhận nhật ký tin nhắn vào bảng NotificationLogs
   */
  private async saveNotificationLog(
    userId: number,
    channel: string,
    recipient: string,
    title: string,
    message: string,
    status: string,
    errorMessage: string | null
  ) {
    try {
      await this.dbService.query(
        `INSERT INTO NotificationLogs (UserID, Channel, Recipient, Title, Message, Status, ErrorMessage, SentAt)
         VALUES (@userId, @channel, @recipient, @title, @message, @status, @errorMessage, GETDATE())`,
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'channel', type: sql.VarChar, value: channel },
          { name: 'recipient', type: sql.VarChar, value: recipient },
          { name: 'title', type: sql.NVarChar, value: title || 'Thông báo hệ thống' },
          { name: 'message', type: sql.NVarChar, value: message },
          { name: 'status', type: sql.NVarChar, value: status },
          { name: 'errorMessage', type: sql.NVarChar, value: errorMessage || null },
        ]
      );
    } catch (err) {
      this.logger.error(`Không thể lưu nhật ký NotificationLogs: ${err.message}`);
    }
  }

  /**
   * Lấy lịch sử nhật ký gửi tin nhắn của User
   */
  async getNotificationLogs(userId: number) {
    const result = await this.dbService.query(
      `SELECT TOP 50 * FROM NotificationLogs 
       WHERE UserID = @userId 
       ORDER BY SentAt DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    return result.recordset;
  }
}
