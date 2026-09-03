import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // VNPAY Sandbox Configuration Defaults
  private readonly vnp_TmnCode = process.env.VNP_TMN_CODE || 'ACOH2026';
  private readonly vnp_HashSecret = process.env.VNP_HASH_SECRET || 'SECRETKEYACOH2026';
  private readonly vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/api/payments/vnpay-return';

  constructor(
    private dbService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Tạo URL thanh toán (VNPAY / QR Code) & lưu bản ghi giao dịch Pending
   */
  async createPaymentUrl(userId: number, dto: CreatePaymentDto) {
    const amount = Number(dto.amount);
    const paymentMethod = dto.paymentMethod || 'VNPAY';
    const orderInfo = dto.orderInfo || `Thanh toan coc lich hen ACOH #${dto.appointmentId || '0'}`;

    // Sinh mã giao dịch duy nhất (TxnRef)
    const timestamp = Date.now();
    const txnRef = `ACOH_${timestamp}_${Math.floor(Math.random() * 1000)}`;

    // 1. Kiểm tra lịch hẹn nếu có truyền appointmentId
    if (dto.appointmentId) {
      const apptRes = await this.dbService.query(
        'SELECT * FROM Appointments WHERE AppointmentID = @id',
        [{ name: 'id', type: sql.Int, value: dto.appointmentId }]
      );
      if (apptRes.recordset.length === 0) {
        throw new NotFoundException('Không tìm thấy lịch hẹn bảo dưỡng này');
      }
    }

    // 2. Chèn bản ghi khởi tạo giao dịch vào bảng Payments (Status: Pending)
    const insertRes = await this.dbService.query(
      `INSERT INTO Payments (AppointmentID, UserID, Amount, PaymentMethod, TxnRef, OrderInfo, Status, CreatedAt)
       VALUES (@appointmentId, @userId, @amount, @paymentMethod, @txnRef, @orderInfo, N'Pending', GETDATE())
       RETURNING PaymentID`,
      [
        { name: 'appointmentId', type: sql.Int, value: dto.appointmentId || null },
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'amount', type: sql.Decimal, value: amount },
        { name: 'paymentMethod', type: sql.NVarChar, value: paymentMethod },
        { name: 'txnRef', type: sql.NVarChar, value: txnRef },
        { name: 'orderInfo', type: sql.NVarChar, value: orderInfo },
      ]
    );

    const paymentId = insertRes.recordset[0].PaymentID;

    // 3. Nếu là Tiền mặt tại Gara
    if (paymentMethod === 'Cash') {
      return {
        paymentId,
        txnRef,
        amount,
        paymentMethod,
        status: 'Pending',
        message: 'Yêu cầu thanh toán tiền mặt tại Gara đã được khởi tạo',
        paymentUrl: null,
      };
    }

    // 4. Khởi tạo URL Thanh toán VNPAY (Chuẩn hóa ký số HMAC SHA512)
    const date = new Date();
    const createDate = this.formatVnpayDate(date);
    
    // Ngày hết hạn giao dịch (sau 15 phút)
    const expireDateObj = new Date(date.getTime() + 15 * 60 * 1000);
    const expireDate = this.formatVnpayDate(expireDateObj);

    let vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(), // VNPAY nhân 100
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    vnp_Params = this.sortObject(vnp_Params);

    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    const paymentUrl = `${this.vnp_Url}?${querystring.stringify(vnp_Params, { encode: false })}`;

    // Tạo VietQR URL giả lập tiện ích cho người dùng quét mã trực tiếp
    const qrCodeUrl = `https://img.vietqr.io/image/MB-ACOH2026-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(txnRef)}&accountName=ACOH%20PAYMENT%20GATEWAY`;

    return {
      paymentId,
      txnRef,
      amount,
      paymentMethod,
      status: 'Pending',
      paymentUrl,
      qrCodeUrl,
      message: 'Khởi tạo link thanh toán VNPAY / VietQR thành công!',
    };
  }

  /**
   * Giả lập thanh toán thành công trực tiếp (Sandbox Test 1-Click)
   */
  async simulateSandboxSuccess(paymentId: number, userId: number) {
    const paymentRes = await this.dbService.query(
      'SELECT * FROM Payments WHERE PaymentID = @id',
      [{ name: 'id', type: sql.Int, value: paymentId }]
    );

    if (paymentRes.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy giao dịch thanh toán này');
    }

    const payment = paymentRes.recordset[0];
    const transactionNo = `SANDBOX_VNP_${Date.now()}`;

    // Cập nhật trạng thái Payment sang Success
    await this.dbService.query(
      `UPDATE Payments
       SET Status = N'Success',
           TransactionNo = @transactionNo,
           PaidAt = GETDATE()
       WHERE PaymentID = @id`,
      [
        { name: 'id', type: sql.Int, value: paymentId },
        { name: 'transactionNo', type: sql.NVarChar, value: transactionNo },
      ]
    );

    // Cập nhật trạng thái lịch hẹn nếu có
    let apptUpdated = false;
    if (payment.AppointmentID) {
      await this.dbService.query(
        `UPDATE Appointments
         SET Status = N'Đã cọc'
         WHERE AppointmentID = @apptId`,
        [{ name: 'apptId', type: sql.Int, value: payment.AppointmentID }]
      );
      apptUpdated = true;

      // Gửi thông báo đến chủ xe & chủ gara
      try {
        const title = `[Thanh toán thành công] Đã đặt cọc cho Lịch hẹn #${payment.AppointmentID}`;
        const msg = `Giao dịch thanh toán cọc số tiền ${Number(payment.Amount).toLocaleString('vi-VN')} đ (Mã GD: ${transactionNo}) đã hoàn tất thành công.`;
        await this.notificationsService.create(payment.UserID, title, msg, 'All');
      } catch (e) {
        this.logger.warn(`Lỗi gửi thông báo thanh toán: ${e.message}`);
      }
    }

    return {
      success: true,
      paymentId,
      txnRef: payment.TxnRef,
      transactionNo,
      amount: payment.Amount,
      status: 'Success',
      apptUpdated,
      message: 'Giả lập thanh toán VNPAY Sandbox thành công!',
    };
  }

  /**
   * Xử lý IPN Webhook tự động từ VNPAY Server
   */
  async handleVnPayIpn(queryParams: any) {
    let vnp_Params = { ...queryParams };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      return { RspCode: '97', Message: 'Invalid Checksum Signature' };
    }

    const txnRef = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const transactionNo = vnp_Params['vnp_TransactionNo'];

    // Tra cứu bản ghi thanh toán
    const paymentRes = await this.dbService.query(
      'SELECT * FROM Payments WHERE TxnRef = @txnRef',
      [{ name: 'txnRef', type: sql.NVarChar, value: txnRef }]
    );

    if (paymentRes.recordset.length === 0) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    const payment = paymentRes.recordset[0];

    if (payment.Status === 'Success') {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    if (rspCode === '00') {
      // Thanh toán thành công
      await this.dbService.query(
        `UPDATE Payments
         SET Status = N'Success',
             TransactionNo = @transactionNo,
             PaidAt = GETDATE()
         WHERE PaymentID = @id`,
        [
          { name: 'id', type: sql.Int, value: payment.PaymentID },
          { name: 'transactionNo', type: sql.NVarChar, value: transactionNo },
        ]
      );

      if (payment.AppointmentID) {
        await this.dbService.query(
          `UPDATE Appointments SET Status = N'Đã cọc' WHERE AppointmentID = @apptId`,
          [{ name: 'apptId', type: sql.Int, value: payment.AppointmentID }]
        );
      }

      return { RspCode: '00', Message: 'Confirm Success' };
    } else {
      // Thanh toán thất bại
      await this.dbService.query(
        `UPDATE Payments SET Status = N'Failed' WHERE PaymentID = @id`,
        [{ name: 'id', type: sql.Int, value: payment.PaymentID }]
      );
      return { RspCode: '00', Message: 'Confirm Failed Updated' };
    }
  }

  /**
   * Lấy lịch sử giao dịch thanh toán của User
   */
  async getMyPaymentHistory(userId: number) {
    const result = await this.dbService.query(
      `SELECT p.*, a.AppointmentDate, g.GarageName
       FROM Payments p
       LEFT JOIN Appointments a ON p.AppointmentID = a.AppointmentID
       LEFT JOIN Garages g ON a.GarageID = g.GarageID
       WHERE p.UserID = @userId
       ORDER BY p.CreatedAt DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    return result.recordset;
  }

  // Format date VNPAY yyyyMMddHHmmss
  private formatVnpayDate(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }

  // Sắp xếp các tham số URL theo alphabet để tính hash
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
