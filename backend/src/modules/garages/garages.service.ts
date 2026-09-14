import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GaragesService {
  constructor(private dbService: DatabaseService) {}

  // Lấy danh sách tất cả các Gara đang hoạt động (dành cho User lựa chọn khi đặt lịch)
  async findAll() {
    const result = await this.dbService.query(
      'SELECT GarageID, GarageName, Address, Phone, Email, Rating FROM Garages WHERE IsActive = 1'
    );
    return result.recordset;
  }

  // Tiện ích: Lấy GarageID từ UserID của tài khoản Gara (tự động liên kết thông minh)
  private async getGarageIdByUserId(userId: number): Promise<number> {
    // 1. Tìm Garage đã gán UserID chính xác
    const result = await this.dbService.query(
      'SELECT GarageID FROM Garages WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length > 0) {
      return result.recordset[0].GarageID;
    }

    // 2. Tìm Gara có Email hoặc Số điện thoại khớp với tài khoản User
    const matchUser = await this.dbService.query(
      `SELECT g.GarageID 
       FROM Garages g 
       JOIN Users u ON (g.Email = u.Email OR g.Phone = u.PhoneNumber OR g.GarageName LIKE '%' || u.FullName || '%')
       WHERE u.UserID = @userId
       LIMIT 1`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    if (matchUser.recordset.length > 0) {
      const gId = matchUser.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 3. Tìm Gara chưa gán UserID hoặc UserID không còn hợp lệ
    const unlinked = await this.dbService.query(
      `SELECT GarageID FROM Garages WHERE UserID IS NULL OR UserID NOT IN (SELECT UserID FROM Users WHERE Role = 'Garage') ORDER BY GarageID ASC LIMIT 1`
    );
    if (unlinked.recordset.length > 0) {
      const gId = unlinked.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 4. Lấy bất kỳ Gara nào hiện có trong hệ thống và tự động liên kết
    const anyGarage = await this.dbService.query(
      'SELECT GarageID FROM Garages ORDER BY GarageID ASC LIMIT 1'
    );
    if (anyGarage.recordset.length > 0) {
      const gId = anyGarage.recordset[0].GarageID;
      await this.dbService.query(
        'UPDATE Garages SET UserID = @userId WHERE GarageID = @gId AND (UserID IS NULL OR UserID = 0)',
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'gId', type: sql.Int, value: gId },
        ]
      );
      return gId;
    }

    // 5. Nếu bảng Garages chưa có bản ghi nào, tự động khởi tạo 1 Gara mặc định
    const userRes = await this.dbService.query(
      'SELECT FullName, PhoneNumber, Email FROM Users WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    const uInfo = userRes.recordset[0] || {};
    const garageName = uInfo.FullName ? `Gara Dịch Vụ ${uInfo.FullName}` : 'ACOH Garage AutoCare';
    const createRes = await this.dbService.query(
      `INSERT INTO Garages (UserID, GarageName, Address, Phone, Email, Rating, IsActive)
       VALUES (@userId, @garageName, N'Tứ Dân, Khoái Châu, Hưng Yên', @phone, @email, 5.0, true)
       RETURNING GarageID`,
      [
        { name: 'userId', type: sql.Int, value: userId },
        { name: 'garageName', type: sql.NVarChar, value: garageName },
        { name: 'phone', type: sql.VarChar, value: uInfo.PhoneNumber || '0901112222' },
        { name: 'email', type: sql.VarChar, value: uInfo.Email || 'garage@autocare.vn' },
      ]
    );

    return createRes.recordset[0].GarageID;
  }

  // Lấy danh sách xe đã bảo dưỡng tại Gara (dành cho Gara quản lý)
  async getServicedVehicles(userId: number, role: string, search: string = '') {
    let garageId: number;
    if (role === 'Admin') {
      const query = `
        SELECT DISTINCT v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType, v.CurrentOdometer,
                        u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
        FROM Vehicles v
        JOIN Users u ON v.UserID = u.UserID
        WHERE (@search = '' OR v.LicensePlate ILIKE '%' || @search || '%')
      `;
      const result = await this.dbService.query(query, [
        { name: 'search', type: sql.VarChar, value: search.trim() }
      ]);
      return result.recordset;
    }

    // Role: Garage
    garageId = await this.getGarageIdByUserId(userId);

    const query = `
      SELECT DISTINCT v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType, v.CurrentOdometer,
                      u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
      FROM Vehicles v
      JOIN Users u ON v.UserID = u.UserID
      LEFT JOIN MaintenanceHistory h ON v.VehicleID = h.VehicleID
      LEFT JOIN Appointments a ON v.VehicleID = a.VehicleID
      WHERE (h.GarageID = @garageId OR a.GarageID = @garageId)
        AND (@search = '' OR v.LicensePlate ILIKE '%' || @search || '%')
    `;

    const result = await this.dbService.query(query, [
      { name: 'garageId', type: sql.Int, value: garageId },
      { name: 'search', type: sql.VarChar, value: search.trim() }
    ]);

    return result.recordset;
  }

  // Xem hồ sơ xe chi tiết và toàn bộ lịch sử sửa chữa của chiếc xe đó tại Gara
  async getVehicleProfile(userId: number, role: string, vehicleId: number) {
    let garageId: number | null = null;
    if (role !== 'Admin') {
      garageId = await this.getGarageIdByUserId(userId);
    }

    // Lấy thông tin xe và thông tin chủ xe
    const vehicleResult = await this.dbService.query(
      `SELECT v.*, u.FullName AS OwnerName, u.Email AS OwnerEmail, u.PhoneNumber AS OwnerPhone
       FROM Vehicles v
       JOIN Users u ON v.UserID = u.UserID
       WHERE v.VehicleID = @vehicleId`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    if (vehicleResult.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này.');
    }

    // Lấy toàn bộ lịch sử sửa chữa của xe tại gara này (hoặc toàn bộ lịch sử nếu là Admin)
    const historyQuery = garageId 
      ? `SELECT h.*, COALESCE(g.GarageName, N'Gara của bạn') AS GarageName 
         FROM MaintenanceHistory h 
         LEFT JOIN Garages g ON h.GarageID = g.GarageID 
         WHERE h.VehicleID = @vehicleId 
         ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`
      : `SELECT h.*, COALESCE(g.GarageName, N'Gara đối tác') AS GarageName 
         FROM MaintenanceHistory h 
         LEFT JOIN Garages g ON h.GarageID = g.GarageID 
         WHERE h.VehicleID = @vehicleId 
         ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`;

    const historyParams = [{ name: 'vehicleId', type: sql.Int, value: vehicleId }];

    const historyResult = await this.dbService.query(historyQuery, historyParams);

    return {
      vehicle: vehicleResult.recordset[0],
      history: historyResult.recordset || []
    };
  }

  // Lấy thông tin chi tiết cấu hình Gara của tài khoản đang đăng nhập
  async getMyGarage(userId: number) {
    const garageId = await this.getGarageIdByUserId(userId);

    const query = `
      SELECT TOP 1 g.*, 
             u.FullName AS OwnerName, 
             u.Email AS OwnerEmail, 
             u.PhoneNumber AS OwnerPhone,
             u.ThemePreference
      FROM Garages g
      JOIN Users u ON g.UserID = u.UserID
      WHERE g.GarageID = @garageId
    `;

    const result = await this.dbService.query(query, [
      { name: 'garageId', type: sql.Int, value: garageId }
    ]);

    if (result.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin Gara của bạn.');
    }

    const data = result.recordset[0];
    return {
      garageId: data.GarageID,
      userId: data.UserID,
      garageName: data.GarageName || 'AutoCare Central Garage',
      ownerName: data.OwnerName || '',
      phone: data.Phone || data.OwnerPhone || '',
      rescueHotline: data.rescue_hotline || data.RescueHotline || '1900 6868',
      email: data.Email || data.OwnerEmail || '',
      address: data.Address || '',
      taxCode: data.tax_code || data.TaxCode || '',
      description: data.description || data.Description || '',
      openingHours: data.opening_hours || data.OpeningHours || '07:30 - 18:00',
      openDays: data.open_days || data.OpenDays || 'Thứ 2 - Thứ 7 (Nghỉ CN)',
      serviceCapacity: Number(data.service_capacity || data.ServiceCapacity || 6),
      slotDuration: Number(data.slot_duration || data.SlotDuration || 45),
      maxParallelSlots: Number(data.max_parallel_slots || data.MaxParallelSlots || 4),
      bankName: data.bank_name || data.BankName || 'Vietcombank',
      bankAccountNumber: data.bank_account_number || data.BankAccountNumber || '',
      bankAccountHolder: data.bank_account_holder || data.BankAccountHolder || '',
      servicesOffered: data.services_offered || data.ServicesOffered || 'Bảo dưỡng định kỳ, Sửa chữa gầm máy, Chẩn đoán điện tử, Đồng sơn cao cấp, Phụ tùng chính hãng, Cứu hộ 24/7',
      vatRate: Number(data.vat_rate || data.VatRate || 10),
      warrantyTerms: data.warranty_terms || data.WarrantyTerms || 'Bảo hành phụ tùng 12 tháng hoặc 20.000km tùy điều kiện nào đến trước. Miễn phí công kiểm tra lại trong vòng 7 ngày.',
      invoiceFooterNote: data.invoice_footer_note || data.InvoiceFooterNote || 'AutoCare trân trọng cảm ơn Quý khách. Kính chúc Quý khách vạn dặm bình an!',
      receiveZaloNotif: data.receive_zalo_notif !== false,
      receiveSmsNotif: data.receive_sms_notif !== false,
      receiveEmailReport: data.receive_email_report !== false,
      soundAlertEnabled: data.sound_alert_enabled !== false,
      avatarUrl: data.avatar_url || data.AvatarUrl || '',
      bannerUrl: data.banner_url || data.BannerUrl || '',
      rating: Number(data.Rating || 5.0),
      isActive: data.IsActive !== false,
      themePreference: data.ThemePreference || 'light',
    };
  }

  // Cập nhật thông tin cấu hình Gara
  async updateMyGarage(userId: number, dto: any) {
    const garageId = await this.getGarageIdByUserId(userId);

    // 1. Cập nhật bảng Garages
    await this.dbService.query(
      `UPDATE Garages SET 
         GarageName = COALESCE(@garageName, GarageName),
         Address = COALESCE(@address, Address),
         Phone = COALESCE(@phone, Phone),
         Email = COALESCE(@email, Email),
         description = COALESCE(@description, description),
         opening_hours = COALESCE(@openingHours, opening_hours),
         open_days = COALESCE(@openDays, open_days),
         service_capacity = COALESCE(@serviceCapacity, service_capacity),
         slot_duration = COALESCE(@slotDuration, slot_duration),
         max_parallel_slots = COALESCE(@maxParallelSlots, max_parallel_slots),
         tax_code = COALESCE(@taxCode, tax_code),
         rescue_hotline = COALESCE(@rescueHotline, rescue_hotline),
         bank_name = COALESCE(@bankName, bank_name),
         bank_account_number = COALESCE(@bankAccountNumber, bank_account_number),
         bank_account_holder = COALESCE(@bankAccountHolder, bank_account_holder),
         services_offered = COALESCE(@servicesOffered, services_offered),
         vat_rate = COALESCE(@vatRate, vat_rate),
         warranty_terms = COALESCE(@warrantyTerms, warranty_terms),
         invoice_footer_note = COALESCE(@invoiceFooterNote, invoice_footer_note),
         receive_zalo_notif = COALESCE(@receiveZaloNotif, receive_zalo_notif),
         receive_sms_notif = COALESCE(@receiveSmsNotif, receive_sms_notif),
         receive_email_report = COALESCE(@receiveEmailReport, receive_email_report),
         sound_alert_enabled = COALESCE(@soundAlertEnabled, sound_alert_enabled),
         avatar_url = COALESCE(@avatarUrl, avatar_url),
         banner_url = COALESCE(@bannerUrl, banner_url),
         IsActive = COALESCE(@isActive, IsActive),
         UpdatedAt = NOW()
       WHERE GarageID = @garageId`,
      [
        { name: 'garageId', type: sql.Int, value: garageId },
        { name: 'garageName', type: sql.NVarChar, value: dto.garageName ?? null },
        { name: 'address', type: sql.NVarChar, value: dto.address ?? null },
        { name: 'phone', type: sql.VarChar, value: dto.phone ?? null },
        { name: 'email', type: sql.VarChar, value: dto.email ?? null },
        { name: 'description', type: sql.NVarChar, value: dto.description ?? null },
        { name: 'openingHours', type: sql.VarChar, value: dto.openingHours ?? null },
        { name: 'openDays', type: sql.NVarChar, value: dto.openDays ?? null },
        { name: 'serviceCapacity', type: sql.Int, value: dto.serviceCapacity ?? null },
        { name: 'slotDuration', type: sql.Int, value: dto.slotDuration ?? null },
        { name: 'maxParallelSlots', type: sql.Int, value: dto.maxParallelSlots ?? null },
        { name: 'taxCode', type: sql.VarChar, value: dto.taxCode ?? null },
        { name: 'rescueHotline', type: sql.VarChar, value: dto.rescueHotline ?? null },
        { name: 'bankName', type: sql.NVarChar, value: dto.bankName ?? null },
        { name: 'bankAccountNumber', type: sql.VarChar, value: dto.bankAccountNumber ?? null },
        { name: 'bankAccountHolder', type: sql.NVarChar, value: dto.bankAccountHolder ?? null },
        { name: 'servicesOffered', type: sql.NVarChar, value: dto.servicesOffered ?? null },
        { name: 'vatRate', type: sql.Decimal, value: dto.vatRate ?? null },
        { name: 'warrantyTerms', type: sql.NVarChar, value: dto.warrantyTerms ?? null },
        { name: 'invoiceFooterNote', type: sql.NVarChar, value: dto.invoiceFooterNote ?? null },
        { name: 'receiveZaloNotif', type: sql.Bit, value: dto.receiveZaloNotif !== undefined ? (dto.receiveZaloNotif ? 1 : 0) : null },
        { name: 'receiveSmsNotif', type: sql.Bit, value: dto.receiveSmsNotif !== undefined ? (dto.receiveSmsNotif ? 1 : 0) : null },
        { name: 'receiveEmailReport', type: sql.Bit, value: dto.receiveEmailReport !== undefined ? (dto.receiveEmailReport ? 1 : 0) : null },
        { name: 'soundAlertEnabled', type: sql.Bit, value: dto.soundAlertEnabled !== undefined ? (dto.soundAlertEnabled ? 1 : 0) : null },
        { name: 'avatarUrl', type: sql.VarChar, value: dto.avatarUrl ?? null },
        { name: 'bannerUrl', type: sql.VarChar, value: dto.bannerUrl ?? null },
        { name: 'isActive', type: sql.Bit, value: dto.isActive !== undefined ? (dto.isActive ? 1 : 0) : null },
      ]
    );

    // 2. Cập nhật họ tên chủ / số điện thoại tài khoản nếu có
    if (dto.ownerName || dto.phone) {
      await this.dbService.query(
        `UPDATE Users SET 
           FullName = COALESCE(@ownerName, FullName),
           PhoneNumber = COALESCE(@phone, PhoneNumber)
         WHERE UserID = @userId`,
        [
          { name: 'userId', type: sql.Int, value: userId },
          { name: 'ownerName', type: sql.NVarChar, value: dto.ownerName ?? null },
          { name: 'phone', type: sql.VarChar, value: dto.phone ?? null },
        ]
      );
    }

    return this.getMyGarage(userId);
  }
}
