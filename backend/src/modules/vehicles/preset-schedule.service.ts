import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';

export interface PresetItem {
  categoryName: string;
  targetOdometer: number;
  targetDate: string; // YYYY-MM-DD
  alertThresholdKM: number;
  notes: string;
  itemType: 'Maintenance' | 'Legal';
}

@Injectable()
export class PresetScheduleService {
  private readonly logger = new Logger(PresetScheduleService.name);

  constructor(private dbService: DatabaseService) {}

  /**
   * Tính toán trước danh sách lịch nhắc mẫu (Preview) mà không lưu vào DB
   */
  previewPresetSchedules(vehicleType: string, currentOdometer: number, purchaseDate?: string): PresetItem[] {
    const odo = Math.max(0, Number(currentOdometer) || 0);
    const baseDate = purchaseDate ? new Date(purchaseDate) : new Date();
    const presets: PresetItem[] = [];

    const addMonths = (date: Date, months: number): string => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    };

    if (vehicleType === 'Ô tô') {
      // 1. Thay nhớt động cơ (Mỗi 5.000 km)
      const oilOdo = Math.ceil((odo + 1) / 5000) * 5000;
      presets.push({
        categoryName: 'Thay nhớt động cơ',
        targetOdometer: oilOdo,
        targetDate: addMonths(baseDate, 6),
        alertThresholdKM: 500,
        notes: `Tự động khởi tạo theo mốc ${oilOdo.toLocaleString('vi-VN')} km (chu kỳ 5.000 km)`,
        itemType: 'Maintenance',
      });

      // 2. Thay lọc nhớt động cơ (Mỗi 10.000 km)
      const oilFilterOdo = Math.ceil((odo + 1) / 10000) * 10000;
      presets.push({
        categoryName: 'Thay lọc nhớt động cơ',
        targetOdometer: oilFilterOdo,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 500,
        notes: `Tự động khởi tạo theo mốc ${oilFilterOdo.toLocaleString('vi-VN')} km (chu kỳ 10.000 km)`,
        itemType: 'Maintenance',
      });

      // 3. Bảo dưỡng hệ thống phanh (Mỗi 10.000 km)
      const brakeOdo = Math.ceil((odo + 1) / 10000) * 10000;
      presets.push({
        categoryName: 'Bảo dưỡng hệ thống phanh',
        targetOdometer: brakeOdo,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 500,
        notes: `Tự động khởi tạo theo mốc ${brakeOdo.toLocaleString('vi-VN')} km (chu kỳ 10.000 km)`,
        itemType: 'Maintenance',
      });

      // 4. Thay lọc gió động cơ & điều hòa (Mỗi 20.000 km)
      const airFilterOdo = Math.ceil((odo + 1) / 20000) * 20000;
      presets.push({
        categoryName: 'Thay lọc gió động cơ & điều hòa',
        targetOdometer: airFilterOdo,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 500,
        notes: `Tự động khởi tạo theo mốc ${airFilterOdo.toLocaleString('vi-VN')} km (chu kỳ 20.000 km)`,
        itemType: 'Maintenance',
      });

      // 5. Đăng kiểm định kỳ (Mỗi 24 tháng)
      presets.push({
        categoryName: 'Đăng kiểm xe ô tô định kỳ',
        targetOdometer: 0,
        targetDate: addMonths(baseDate, 24),
        alertThresholdKM: 0,
        notes: 'Giấy tờ kiểm định an toàn kỹ thuật & bảo vệ môi trường',
        itemType: 'Legal',
      });
    } else {
      // Dành cho Xe máy
      // 1. Thay nhớt máy (Mỗi 2.000 km)
      const oilOdo = Math.ceil((odo + 1) / 2000) * 2000;
      presets.push({
        categoryName: 'Thay nhớt máy',
        targetOdometer: oilOdo,
        targetDate: addMonths(baseDate, 3),
        alertThresholdKM: 300,
        notes: `Tự động khởi tạo theo mốc ${oilOdo.toLocaleString('vi-VN')} km (chu kỳ 2.000 km)`,
        itemType: 'Maintenance',
      });

      // 2. Thay nhớt hộp số / nhớt láp (Mỗi 4.000 km)
      const gearOilOdo = Math.ceil((odo + 1) / 4000) * 4000;
      presets.push({
        categoryName: 'Thay nhớt hộp số (nhớt láp)',
        targetOdometer: gearOilOdo,
        targetDate: addMonths(baseDate, 6),
        alertThresholdKM: 300,
        notes: `Tự động khởi tạo theo mốc ${gearOilOdo.toLocaleString('vi-VN')} km (chu kỳ 4.000 km)`,
        itemType: 'Maintenance',
      });

      // 3. Vệ sinh lọc gió & bugi (Mỗi 8.000 km)
      const filterSparkOdo = Math.ceil((odo + 1) / 8000) * 8000;
      presets.push({
        categoryName: 'Vệ sinh / Thay lọc gió & Bugi',
        targetOdometer: filterSparkOdo,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 300,
        notes: `Tự động khởi tạo theo mốc ${filterSparkOdo.toLocaleString('vi-VN')} km (chu kỳ 8.000 km)`,
        itemType: 'Maintenance',
      });

      // 4. Bảo dưỡng phanh & nhông sên dĩa (Mỗi 10.000 km)
      const chainBrakeOdo = Math.ceil((odo + 1) / 10000) * 10000;
      presets.push({
        categoryName: 'Bảo dưỡng phanh & Nhông sên dĩa',
        targetOdometer: chainBrakeOdo,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 300,
        notes: `Tự động khởi tạo theo mốc ${chainBrakeOdo.toLocaleString('vi-VN')} km (chu kỳ 10.000 km)`,
        itemType: 'Maintenance',
      });

      // 5. Bảo hiểm TNDS bắt buộc (Mỗi 12 tháng)
      presets.push({
        categoryName: 'Bảo hiểm TNDS xe máy bắt buộc',
        targetOdometer: 0,
        targetDate: addMonths(baseDate, 12),
        alertThresholdKM: 0,
        notes: 'Bảo hiểm trách nhiệm dân sự bắt buộc cho xe máy',
        itemType: 'Legal',
      });
    }

    return presets;
  }

  /**
   * Sinh và chèn trực tiếp bộ lịch bảo dưỡng mẫu & giấy tờ vào DB cho xe vừa tạo
   */
  async generateSchedulesForVehicle(
    vehicleId: number,
    vehicleType: string,
    currentOdometer: number,
    purchaseDate?: string,
  ) {
    const presets = this.previewPresetSchedules(vehicleType, currentOdometer, purchaseDate);
    let createdMaintenanceCount = 0;
    let createdLegalCount = 0;

    for (const preset of presets) {
      if (preset.itemType === 'Maintenance') {
        await this.dbService.query(
          `INSERT INTO MaintenanceSchedules (VehicleID, CategoryName, TargetOdometer, TargetDate, AlertThresholdKM, Status, Notes)
           VALUES (@vehicleId, @categoryName, @targetOdometer, @targetDate, @alertThresholdKM, N'Chưa thực hiện', @notes)`,
          [
            { name: 'vehicleId', type: sql.Int, value: vehicleId },
            { name: 'categoryName', type: sql.NVarChar, value: preset.categoryName },
            { name: 'targetOdometer', type: sql.Int, value: preset.targetOdometer },
            { name: 'targetDate', type: sql.Date, value: new Date(preset.targetDate) },
            { name: 'alertThresholdKM', type: sql.Int, value: preset.alertThresholdKM },
            { name: 'notes', type: sql.NVarChar, value: preset.notes },
          ],
        );
        createdMaintenanceCount++;
      } else if (preset.itemType === 'Legal') {
        // Kiểm tra xem đã có giấy tờ chưa trước khi chèn
        const docType = vehicleType === 'Ô tô' ? 'Đăng kiểm' : 'Bảo hiểm dân sự';
        const existingDoc = await this.dbService.query(
          `SELECT DocumentID FROM LegalDocuments WHERE VehicleID = @vehicleId AND DocumentType = @docType`,
          [
            { name: 'vehicleId', type: sql.Int, value: vehicleId },
            { name: 'docType', type: sql.NVarChar, value: docType },
          ],
        );

        if (existingDoc.recordset.length === 0) {
          const issueDate = purchaseDate ? new Date(purchaseDate) : new Date();
          const expiryDate = new Date(preset.targetDate);

          await this.dbService.query(
            `INSERT INTO LegalDocuments (VehicleID, DocumentType, IssueDate, ExpiryDate, AlertThresholdDays, Status)
             VALUES (@vehicleId, @docType, @issueDate, @expiryDate, 30, N'Còn hạn')`,
            [
              { name: 'vehicleId', type: sql.Int, value: vehicleId },
              { name: 'docType', type: sql.NVarChar, value: docType },
              { name: 'issueDate', type: sql.Date, value: issueDate },
              { name: 'expiryDate', type: sql.Date, value: expiryDate },
            ],
          );
          createdLegalCount++;
        }
      }
    }

    this.logger.log(
      `Đã khởi tạo tự động ${createdMaintenanceCount} lịch nhắc bảo dưỡng và ${createdLegalCount} giấy tờ cho VehicleID=${vehicleId}`,
    );

    return {
      maintenanceCount: createdMaintenanceCount,
      legalCount: createdLegalCount,
      totalCount: createdMaintenanceCount + createdLegalCount,
      presets,
    };
  }
}
