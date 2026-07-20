import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class LegalService {
  constructor(private dbService: DatabaseService) {}

  // Kiểm tra quyền truy cập của người dùng đối với xe
  private async checkVehicleAccess(vehicleId: number, userId: number, role: string) {
    const result = await this.dbService.query(
      'SELECT UserID FROM Vehicles WHERE VehicleID = @vehicleId',
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    if (result.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này');
    }

    const vehicle = result.recordset[0];

    if (role === 'Admin') {
      return vehicle;
    }

    if (role === 'User') {
      if (vehicle.UserID !== userId) {
        throw new ForbiddenException('Bạn không có quyền truy cập phương tiện này');
      }
      return vehicle;
    }

    throw new ForbiddenException('Chỉ tài khoản Chủ xe hoặc Admin mới có quyền truy cập thông tin giấy tờ xe');
  }

  // Lấy tất cả giấy tờ của một phương tiện (Đồng thời tự động cập nhật Status bằng DATEDIFF)
  async findAllByVehicle(vehicleId: number, userId: number, role: string) {
    await this.checkVehicleAccess(vehicleId, userId, role);

    // Tự động đồng bộ hóa trạng thái Status dựa trên khoảng cách ngày hiện tại so với ngày hết hạn (DATEDIFF)
    await this.dbService.query(
      `UPDATE LegalDocuments
       SET Status = CASE
                      WHEN DATEDIFF(day, GETDATE(), ExpiryDate) < 0 THEN N'Quá hạn'
                      WHEN DATEDIFF(day, GETDATE(), ExpiryDate) <= AlertThresholdDays THEN N'Sắp hết hạn'
                      ELSE N'Còn hạn'
                    END
       WHERE VehicleID = @vehicleId`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    // Lấy danh sách giấy tờ sau khi đã đồng bộ
    const result = await this.dbService.query(
      `SELECT * FROM LegalDocuments 
       WHERE VehicleID = @vehicleId 
       ORDER BY ExpiryDate ASC`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    return result.recordset;
  }

  // Thêm mới giấy tờ xe
  async create(userId: number, role: string, dto: CreateDocumentDto) {
    await this.checkVehicleAccess(dto.vehicleId, userId, role);

    // Kiểm tra xem loại giấy tờ này đã tồn tại cho xe này chưa
    const checkResult = await this.dbService.query(
      `SELECT DocumentID FROM LegalDocuments 
       WHERE VehicleID = @vehicleId AND DocumentType = @documentType`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'documentType', type: sql.NVarChar, value: dto.documentType }
      ]
    );

    if (checkResult.recordset.length > 0) {
      throw new ConflictException(`Loại giấy tờ "${dto.documentType}" đã tồn tại cho xe này. Vui lòng chỉnh sửa hoặc gia hạn bản ghi hiện tại.`);
    }

    const alertThresholdDays = dto.alertThresholdDays !== undefined ? dto.alertThresholdDays : 30;

    const result = await this.dbService.query(
      `INSERT INTO LegalDocuments (VehicleID, DocumentType, IssueDate, ExpiryDate, AlertThresholdDays, Status)
       OUTPUT INSERTED.DocumentID
       VALUES (@vehicleId, @documentType, @issueDate, @expiryDate, @alertThresholdDays,
         CASE
           WHEN DATEDIFF(day, GETDATE(), @expiryDate) < 0 THEN N'Quá hạn'
           WHEN DATEDIFF(day, GETDATE(), @expiryDate) <= @alertThresholdDays THEN N'Sắp hết hạn'
           ELSE N'Còn hạn'
         END
       )`,
      [
        { name: 'vehicleId', type: sql.Int, value: dto.vehicleId },
        { name: 'documentType', type: sql.NVarChar, value: dto.documentType },
        { name: 'issueDate', type: sql.Date, value: dto.issueDate || null },
        { name: 'expiryDate', type: sql.Date, value: dto.expiryDate },
        { name: 'alertThresholdDays', type: sql.Int, value: alertThresholdDays }
      ]
    );

    return {
      message: 'Thêm mới giấy tờ xe thành công!',
      documentId: result.recordset[0].DocumentID,
    };
  }

  // Cập nhật hoặc gia hạn giấy tờ
  async update(id: number, userId: number, role: string, dto: UpdateDocumentDto) {
    const checkDoc = await this.dbService.query(
      'SELECT * FROM LegalDocuments WHERE DocumentID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (checkDoc.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin giấy tờ này');
    }

    const doc = checkDoc.recordset[0];
    await this.checkVehicleAccess(doc.VehicleID, userId, role);

    const merged = {
      DocumentType: dto.documentType !== undefined ? dto.documentType : doc.DocumentType,
      IssueDate: dto.issueDate !== undefined ? dto.issueDate : doc.IssueDate,
      ExpiryDate: dto.expiryDate !== undefined ? dto.expiryDate : doc.ExpiryDate,
      AlertThresholdDays: dto.alertThresholdDays !== undefined ? dto.alertThresholdDays : doc.AlertThresholdDays,
    };

    // Kiểm tra trùng lắp loại giấy tờ khi thay đổi loại giấy tờ
    if (dto.documentType && dto.documentType !== doc.DocumentType) {
      const conflictCheck = await this.dbService.query(
        `SELECT DocumentID FROM LegalDocuments 
         WHERE VehicleID = @vehicleId AND DocumentType = @documentType AND DocumentID != @id`,
        [
          { name: 'vehicleId', type: sql.Int, value: doc.VehicleID },
          { name: 'documentType', type: sql.NVarChar, value: dto.documentType },
          { name: 'id', type: sql.Int, value: id }
        ]
      );
      if (conflictCheck.recordset.length > 0) {
        throw new ConflictException(`Loại giấy tờ "${dto.documentType}" đã tồn tại cho xe này.`);
      }
    }

    await this.dbService.query(
      `UPDATE LegalDocuments
       SET DocumentType = @documentType,
           IssueDate = @issueDate,
           ExpiryDate = @expiryDate,
           AlertThresholdDays = @alertThresholdDays,
           Status = CASE
                      WHEN DATEDIFF(day, GETDATE(), @expiryDate) < 0 THEN N'Quá hạn'
                      WHEN DATEDIFF(day, GETDATE(), @expiryDate) <= @alertThresholdDays THEN N'Sắp hết hạn'
                      ELSE N'Còn hạn'
                    END
       WHERE DocumentID = @id`,
      [
        { name: 'id', type: sql.Int, value: id },
        { name: 'documentType', type: sql.NVarChar, value: merged.DocumentType },
        { name: 'issueDate', type: sql.Date, value: merged.IssueDate || null },
        { name: 'expiryDate', type: sql.Date, value: merged.ExpiryDate },
        { name: 'alertThresholdDays', type: sql.Int, value: merged.AlertThresholdDays }
      ]
    );

    return { message: 'Cập nhật giấy tờ xe thành công!' };
  }

  // Xóa giấy tờ xe
  async delete(id: number, userId: number, role: string) {
    const checkDoc = await this.dbService.query(
      'SELECT * FROM LegalDocuments WHERE DocumentID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    if (checkDoc.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy thông tin giấy tờ này');
    }

    const doc = checkDoc.recordset[0];
    await this.checkVehicleAccess(doc.VehicleID, userId, role);

    await this.dbService.query(
      'DELETE FROM LegalDocuments WHERE DocumentID = @id',
      [{ name: 'id', type: sql.Int, value: id }]
    );

    return { message: 'Xóa giấy tờ xe thành công!' };
  }
}
