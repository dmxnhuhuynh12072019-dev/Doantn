import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';

export interface ComponentHealth {
  id: string;
  name: string;
  category: string;
  icon: string;
  intervalKm: number;
  intervalDays: number;
  lastDoneOdometer: number;
  lastDoneDate: string | null;
  kmUsed: number;
  daysUsed: number;
  remainingKm: number;
  remainingDays: number;
  healthPercent: number;
  status: 'Good' | 'Warning' | 'Urgent';
  statusText: string;
  description: string;
  estimatedCost: number;
}

export interface VehicleHealthReport {
  vehicleId: number;
  licensePlate: string;
  vehicleName: string;
  vehicleType: string;
  currentOdometer: number;
  estimatedOdometer: number;
  dailyAverageKm: number;
  healthScore: number;
  healthTier: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  healthTierText: string;
  healthTierColor: string;
  summaryQuote: string;
  nextService: {
    targetOdometer: number;
    remainingKm: number;
    remainingDays: number;
    estimatedDate: string;
    packageName: string;
    totalEstimatedCost: number;
  };
  components: ComponentHealth[];
  recommendedActions: Array<{
    id: string;
    title: string;
    urgency: 'high' | 'medium' | 'low';
    reason: string;
    estimatedCost: number;
    suggestedItems: string[];
  }>;
}

@Injectable()
export class AdvisorService {
  private readonly logger = new Logger(AdvisorService.name);

  constructor(private dbService: DatabaseService) {}

  // 1. Phân tích toàn diện và Chấm điểm Sức khỏe Phương tiện (Car Health Doctor Engine)
  async getVehicleHealth(vehicleId: number, userId: number, role: string): Promise<VehicleHealthReport> {
    // A. Lấy thông tin phương tiện
    const vehicleRes = await this.dbService.query(
      `SELECT v.*, u.FullName AS OwnerName, u.Email AS OwnerEmail
       FROM Vehicles v
       JOIN Users u ON v.UserID = u.UserID
       WHERE v.VehicleID = @vehicleId`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );

    if (vehicleRes.recordset.length === 0) {
      throw new NotFoundException('Không tìm thấy phương tiện này trong hệ thống.');
    }

    const vehicle = vehicleRes.recordset[0];
    if (role !== 'Admin' && role !== 'Garage' && vehicle.UserID !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem hồ sơ xe của người khác.');
    }

    // B. Lấy toàn bộ lịch sử sửa chữa/bảo dưỡng của xe
    const historyRes = await this.dbService.query(
      `SELECT h.*, g.GarageName 
       FROM MaintenanceHistory h
       LEFT JOIN Garages g ON h.GarageID = g.GarageID
       WHERE h.VehicleID = @vehicleId
       ORDER BY h.ExecutionDate DESC, h.ExecutionOdometer DESC`,
      [{ name: 'vehicleId', type: sql.Int, value: vehicleId }]
    );
    const historyList = historyRes.recordset || [];

    // C. Tính toán Tốc độ di chuyển trung bình (km/ngày)
    const baseOdo = Number(vehicle.CurrentOdometer) || 0;
    let dailyAverageKm = 35; // Mặc định xe cá nhân chạy ~35 km/ngày ở đô thị

    if (historyList.length >= 2) {
      const latestH = historyList[0];
      const oldestH = historyList[historyList.length - 1];
      const odoDiff = Number(latestH.ExecutionOdometer) - Number(oldestH.ExecutionOdometer);
      const daysDiff = Math.max(1, Math.floor((new Date(latestH.ExecutionDate).getTime() - new Date(oldestH.ExecutionDate).getTime()) / (1000 * 60 * 60 * 24)));
      if (odoDiff > 0 && daysDiff > 0) {
        const calculated = Math.round(odoDiff / daysDiff);
        if (calculated >= 10 && calculated <= 250) {
          dailyAverageKm = calculated;
        }
      }
    } else if (vehicle.PurchaseDate) {
      const daysSincePurchase = Math.max(1, Math.floor((Date.now() - new Date(vehicle.PurchaseDate).getTime()) / (1000 * 60 * 60 * 24)));
      if (baseOdo > 0 && daysSincePurchase > 0) {
        const calculated = Math.round(baseOdo / daysSincePurchase);
        if (calculated >= 10 && calculated <= 200) {
          dailyAverageKm = calculated;
        }
      }
    }

    // D. Ước tính số km thực tế hôm nay (Realtime Estimated Odo)
    const lastUpdateDate = vehicle.UpdatedAt ? new Date(vehicle.UpdatedAt) : new Date(vehicle.CreatedAt || Date.now());
    const daysSinceLastUpdate = Math.max(0, Math.floor((Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)));
    const estimatedOdometer = baseOdo + (daysSinceLastUpdate > 0 ? Math.min(daysSinceLastUpdate * dailyAverageKm, 10000) : 0);

    // E. Phân tích từng nhóm hạng mục kỹ thuật cốt lõi
    const components: ComponentHealth[] = [];
    let totalDeductions = 0;

    // Helper kiểm tra lịch sử theo từ khóa
    const findLastMaintenance = (keywords: string[]) => {
      for (const h of historyList) {
        const details = (h.Details || '').toLowerCase();
        for (const kw of keywords) {
          if (details.includes(kw.toLowerCase())) {
            return {
              odometer: Number(h.ExecutionOdometer) || baseOdo,
              date: new Date(h.ExecutionDate).toISOString(),
            };
          }
        }
      }
      return null;
    };

    // 1. Dầu động cơ (Engine Oil) - Chu kỳ 5.000 km hoặc 180 ngày
    const oilHist = findLastMaintenance(['nhớt', 'dầu động cơ', 'dầu máy', 'oil', 'castrol', 'motul']);
    const oilLastOdo = oilHist ? oilHist.odometer : Math.max(0, estimatedOdometer - (estimatedOdometer % 5000));
    const oilLastDate = oilHist ? oilHist.date : null;
    const oilKmUsed = Math.max(0, estimatedOdometer - oilLastOdo);
    const oilDaysUsed = oilLastDate ? Math.floor((Date.now() - new Date(oilLastDate).getTime()) / 86400000) : Math.round(oilKmUsed / dailyAverageKm);
    const oilRemainingKm = Math.max(0, 5000 - oilKmUsed);
    const oilRemainingDays = Math.max(0, 180 - oilDaysUsed);
    const oilHealthPct = Math.max(0, Math.min(100, Math.round(((5000 - oilKmUsed) / 5000) * 100)));
    let oilStatus: 'Good' | 'Warning' | 'Urgent' = 'Good';
    let oilStatusText = 'Chất lượng dầu tốt';
    if (oilKmUsed >= 5000 || oilDaysUsed >= 180) {
      oilStatus = 'Urgent';
      oilStatusText = 'Đã quá hạn thay dầu máy!';
      totalDeductions += 25;
    } else if (oilKmUsed >= 4200 || oilDaysUsed >= 150) {
      oilStatus = 'Warning';
      oilStatusText = 'Sắp đến hạn thay dầu';
      totalDeductions += 12;
    }
    components.push({
      id: 'engine_oil',
      name: 'Dầu nhớt động cơ',
      category: 'Bôi trơn',
      icon: '🛢️',
      intervalKm: 5000,
      intervalDays: 180,
      lastDoneOdometer: oilLastOdo,
      lastDoneDate: oilLastDate,
      kmUsed: oilKmUsed,
      daysUsed: oilDaysUsed,
      remainingKm: oilRemainingKm,
      remainingDays: oilRemainingDays,
      healthPercent: oilHealthPct,
      status: oilStatus,
      statusText: oilStatusText,
      description: 'Bôi trơn, tản nhiệt và làm sạch muội than trong xy-lanh động cơ',
      estimatedCost: 450000,
    });

    // 2. Lọc dầu động cơ (Oil Filter) - Chu kỳ 10.000 km hoặc 365 ngày
    const filterHist = findLastMaintenance(['lọc dầu', 'lọc nhớt', 'oil filter']);
    const filterLastOdo = filterHist ? filterHist.odometer : Math.max(0, estimatedOdometer - (estimatedOdometer % 10000));
    const filterKmUsed = Math.max(0, estimatedOdometer - filterLastOdo);
    const filterRemainingKm = Math.max(0, 10000 - filterKmUsed);
    const filterHealthPct = Math.max(0, Math.min(100, Math.round(((10000 - filterKmUsed) / 10000) * 100)));
    let filterStatus: 'Good' | 'Warning' | 'Urgent' = 'Good';
    let filterStatusText = 'Lọc dầu hoạt động tốt';
    if (filterKmUsed >= 10000) {
      filterStatus = 'Urgent';
      filterStatusText = 'Cần thay cốc lọc dầu mới';
      totalDeductions += 15;
    } else if (filterKmUsed >= 8500) {
      filterStatus = 'Warning';
      filterStatusText = 'Nên thay kèm lần thay nhớt tới';
      totalDeductions += 8;
    }
    components.push({
      id: 'oil_filter',
      name: 'Lọc dầu động cơ',
      category: 'Lọc & Nhiên liệu',
      icon: '🔄',
      intervalKm: 10000,
      intervalDays: 365,
      lastDoneOdometer: filterLastOdo,
      lastDoneDate: filterHist?.date || null,
      kmUsed: filterKmUsed,
      daysUsed: Math.round(filterKmUsed / dailyAverageKm),
      remainingKm: filterRemainingKm,
      remainingDays: Math.round(filterRemainingKm / dailyAverageKm),
      healthPercent: filterHealthPct,
      status: filterStatus,
      statusText: filterStatusText,
      description: 'Ngăn chặn mạt kim loại và cặn bẩn xâm nhập làm xước thành xy-lanh',
      estimatedCost: 150000,
    });

    // 3. Lọc gió động cơ & Điều hòa (Air & Cabin Filter) - Chu kỳ 20.000 km
    const airHist = findLastMaintenance(['lọc gió', 'lọc điều hòa', 'air filter', 'cabin filter']);
    const airLastOdo = airHist ? airHist.odometer : Math.max(0, estimatedOdometer - (estimatedOdometer % 20000));
    const airKmUsed = Math.max(0, estimatedOdometer - airLastOdo);
    const airRemainingKm = Math.max(0, 20000 - airKmUsed);
    const airHealthPct = Math.max(0, Math.min(100, Math.round(((20000 - airKmUsed) / 20000) * 100)));
    let airStatus: 'Good' | 'Warning' | 'Urgent' = 'Good';
    let airStatusText = 'Luồng gió sạch & thông thoáng';
    if (airKmUsed >= 20000) {
      airStatus = 'Urgent';
      airStatusText = 'Lọc gió bám bụi nặng, cần thay';
      totalDeductions += 12;
    } else if (airKmUsed >= 16000) {
      airStatus = 'Warning';
      airStatusText = 'Cần vệ sinh hoặc thay mới';
      totalDeductions += 6;
    }
    components.push({
      id: 'air_filter',
      name: 'Lọc gió động cơ & Máy lạnh',
      category: 'Hệ thống nạp khí',
      icon: '❄️',
      intervalKm: 20000,
      intervalDays: 365,
      lastDoneOdometer: airLastOdo,
      lastDoneDate: airHist?.date || null,
      kmUsed: airKmUsed,
      daysUsed: Math.round(airKmUsed / dailyAverageKm),
      remainingKm: airRemainingKm,
      remainingDays: Math.round(airRemainingKm / dailyAverageKm),
      healthPercent: airHealthPct,
      status: airStatus,
      statusText: airStatusText,
      description: 'Lọc bụi bẩn bảo vệ buồng đốt và không khí trong lành trong khoang lái',
      estimatedCost: 350000,
    });

    // 4. Hệ thống Phanh & Dầu phanh (Brakes & Brake Fluid) - Chu kỳ 30.000 km
    const brakeHist = findLastMaintenance(['phanh', 'thắng', 'dầu phanh', 'má phanh', 'brake']);
    const brakeLastOdo = brakeHist ? brakeHist.odometer : Math.max(0, estimatedOdometer - (estimatedOdometer % 30000));
    const brakeKmUsed = Math.max(0, estimatedOdometer - brakeLastOdo);
    const brakeRemainingKm = Math.max(0, 30000 - brakeKmUsed);
    const brakeHealthPct = Math.max(0, Math.min(100, Math.round(((30000 - brakeKmUsed) / 30000) * 100)));
    let brakeStatus: 'Good' | 'Warning' | 'Urgent' = 'Good';
    let brakeStatusText = 'Hiệu suất phanh an toàn';
    if (brakeKmUsed >= 30000) {
      brakeStatus = 'Urgent';
      brakeStatusText = 'Cần bảo dưỡng má phanh & thay dầu phanh';
      totalDeductions += 20;
    } else if (brakeKmUsed >= 24000) {
      brakeStatus = 'Warning';
      brakeStatusText = 'Nên kiểm tra độ mòn má phanh';
      totalDeductions += 10;
    }
    components.push({
      id: 'brake_system',
      name: 'Hệ thống phanh & Dầu phanh',
      category: 'An toàn vận hành',
      icon: '🛑',
      intervalKm: 30000,
      intervalDays: 730,
      lastDoneOdometer: brakeLastOdo,
      lastDoneDate: brakeHist?.date || null,
      kmUsed: brakeKmUsed,
      daysUsed: Math.round(brakeKmUsed / dailyAverageKm),
      remainingKm: brakeRemainingKm,
      remainingDays: Math.round(brakeRemainingKm / dailyAverageKm),
      healthPercent: brakeHealthPct,
      status: brakeStatus,
      statusText: brakeStatusText,
      description: 'Đảm bảo quãng đường phanh ngắn nhất và an toàn tuyệt đối',
      estimatedCost: 650000,
    });

    // 5. Bugi, Nước làm mát & Hệ thống đánh lửa (Spark Plugs & Coolant) - Chu kỳ 40.000 km
    const sparkHist = findLastMaintenance(['bugi', 'nước làm mát', 'coolant', 'spark']);
    const sparkLastOdo = sparkHist ? sparkHist.odometer : Math.max(0, estimatedOdometer - (estimatedOdometer % 40000));
    const sparkKmUsed = Math.max(0, estimatedOdometer - sparkLastOdo);
    const sparkRemainingKm = Math.max(0, 40000 - sparkKmUsed);
    const sparkHealthPct = Math.max(0, Math.min(100, Math.round(((40000 - sparkKmUsed) / 40000) * 100)));
    let sparkStatus: 'Good' | 'Warning' | 'Urgent' = 'Good';
    let sparkStatusText = 'Đánh lửa & làm mát tối ưu';
    if (sparkKmUsed >= 40000) {
      sparkStatus = 'Urgent';
      sparkStatusText = 'Đến hạn đại tu cấp 4 vạn km';
      totalDeductions += 15;
    } else if (sparkKmUsed >= 35000) {
      sparkStatus = 'Warning';
      sparkStatusText = 'Chuẩn bị cho mốc 40.000 km';
      totalDeductions += 7;
    }
    components.push({
      id: 'spark_coolant',
      name: 'Bugi & Nước làm mát động cơ',
      category: 'Động cơ & Tản nhiệt',
      icon: '⚡',
      intervalKm: 40000,
      intervalDays: 730,
      lastDoneOdometer: sparkLastOdo,
      lastDoneDate: sparkHist?.date || null,
      kmUsed: sparkKmUsed,
      daysUsed: Math.round(sparkKmUsed / dailyAverageKm),
      remainingKm: sparkRemainingKm,
      remainingDays: Math.round(sparkRemainingKm / dailyAverageKm),
      healthPercent: sparkHealthPct,
      status: sparkStatus,
      statusText: sparkStatusText,
      description: 'Duy trì công suất máy, tiết kiệm xăng và tránh hiện tượng sôi két nước',
      estimatedCost: 850000,
    });

    // F. Tính toán Điểm Sức Khỏe Tổng thể (Health Score: 0 - 100)
    const rawScore = 100 - totalDeductions;
    const healthScore = Math.max(30, Math.min(100, rawScore));

    let healthTier: 'Excellent' | 'Good' | 'Warning' | 'Critical' = 'Excellent';
    let healthTierText = 'Tình trạng Hoàn hảo';
    let healthTierColor = '#10B981'; // Emerald
    let summaryQuote = 'Phương tiện đang trong trạng thái vận hành xuất sắc. Tiếp tục duy trì thói quen chăm sóc xe!';

    if (healthScore < 60) {
      healthTier = 'Critical';
      healthTierText = 'Cảnh báo: Cần bảo dưỡng ngay';
      healthTierColor = '#EF4444'; // Rose/Red
      summaryQuote = `Xe ${vehicle.LicensePlate} có một số hạng mục đã vượt quá mốc an toàn. Hãy đặt lịch kiểm tra ngay để tránh hư hỏng nặng!`;
    } else if (healthScore < 75) {
      healthTier = 'Warning';
      healthTierText = 'Cần lưu ý kiểm tra sớm';
      healthTierColor = '#F59E0B'; // Amber
      summaryQuote = `Xe sắp chạm các mốc bảo dưỡng định kỳ tiếp theo. Hãy lên lịch hẹn trước để chủ động thời gian.`;
    } else if (healthScore < 90) {
      healthTier = 'Good';
      healthTierText = 'Tình trạng Khá tốt';
      healthTierColor = '#3B82F6'; // Blue
      summaryQuote = 'Các hệ thống cơ bản hoạt động ổn định. Một số chi tiết tiêu hao đang trong ngưỡng kiểm soát.';
    }

    // G. Mốc bảo dưỡng tiếp theo (Next Service Target)
    const nextMilestoneOdo = Math.ceil((estimatedOdometer + 1) / 5000) * 5000;
    const remainingKmToNext = Math.max(0, nextMilestoneOdo - estimatedOdometer);
    const remainingDaysToNext = Math.max(1, Math.ceil(remainingKmToNext / dailyAverageKm));
    const estimatedNextDate = new Date(Date.now() + remainingDaysToNext * 86400000).toISOString().split('T')[0];

    // Xác định tên gói bảo dưỡng tiếp theo
    let packageName = `Bảo dưỡng cấp nhỏ mốc ${nextMilestoneOdo.toLocaleString()} km`;
    if (nextMilestoneOdo % 40000 === 0) {
      packageName = `Bảo dưỡng Cấp Lớn (Đại tu) mốc ${nextMilestoneOdo.toLocaleString()} km`;
    } else if (nextMilestoneOdo % 20000 === 0) {
      packageName = `Bảo dưỡng cấp Trung bình lớn mốc ${nextMilestoneOdo.toLocaleString()} km`;
    } else if (nextMilestoneOdo % 10000 === 0) {
      packageName = `Bảo dưỡng cấp Trung bình mốc ${nextMilestoneOdo.toLocaleString()} km`;
    }

    // H. Tổng hợp danh sách khuyến nghị hành động thông minh (Actionable Recommendations)
    const recommendedActions: Array<{
      id: string;
      title: string;
      urgency: 'high' | 'medium' | 'low';
      reason: string;
      estimatedCost: number;
      suggestedItems: string[];
    }> = [];

    const urgentComponents = components.filter(c => c.status === 'Urgent');
    const warningComponents = components.filter(c => c.status === 'Warning');

    if (urgentComponents.length > 0) {
      recommendedActions.push({
        id: 'urgent_package',
        title: `Bảo dưỡng khẩn cấp: ${urgentComponents.map(c => c.name).join(' & ')}`,
        urgency: 'high',
        reason: `Đã vượt quá số km khuyến nghị an toàn (${urgentComponents.map(c => c.kmUsed + '/' + c.intervalKm + ' km').join(', ')})`,
        estimatedCost: urgentComponents.reduce((sum, c) => sum + c.estimatedCost, 0),
        suggestedItems: urgentComponents.map(c => c.name),
      });
    }

    if (warningComponents.length > 0) {
      recommendedActions.push({
        id: 'warning_package',
        title: `Bảo dưỡng dự phòng: ${warningComponents.map(c => c.name).join(' & ')}`,
        urgency: 'medium',
        reason: `Sắp chạm ngưỡng chu kỳ trong vòng ${Math.min(...warningComponents.map(c => c.remainingKm))} km tới`,
        estimatedCost: warningComponents.reduce((sum, c) => sum + c.estimatedCost, 0),
        suggestedItems: warningComponents.map(c => c.name),
      });
    }

    const totalEstCost = components
      .filter(c => c.status !== 'Good')
      .reduce((sum, c) => sum + c.estimatedCost, 0) || 600000;

    return {
      vehicleId: vehicle.VehicleID,
      licensePlate: vehicle.LicensePlate,
      vehicleName: `${vehicle.Brand || ''} ${vehicle.Model || ''}`.trim() || 'Phương tiện',
      vehicleType: vehicle.VehicleType || 'Ô tô',
      currentOdometer: baseOdo,
      estimatedOdometer,
      dailyAverageKm,
      healthScore,
      healthTier,
      healthTierText,
      healthTierColor,
      summaryQuote,
      nextService: {
        targetOdometer: nextMilestoneOdo,
        remainingKm: remainingKmToNext,
        remainingDays: remainingDaysToNext,
        estimatedDate: estimatedNextDate,
        packageName,
        totalEstimatedCost: totalEstCost,
      },
      components,
      recommendedActions,
    };
  }

  // 2. Tự động áp dụng và đồng bộ Lịch nhắc thông minh vào MaintenanceSchedules
  async applyRecommendations(vehicleId: number, userId: number, role: string) {
    const health = await this.getVehicleHealth(vehicleId, userId, role);

    const createdSchedules: any[] = [];
    const urgentAndWarning = health.components.filter(c => c.status !== 'Good');

    for (const comp of urgentAndWarning) {
      const targetOdo = health.estimatedOdometer + Math.max(100, comp.remainingKm);
      const targetDate = new Date(Date.now() + Math.max(3, comp.remainingDays) * 86400000);

      // Kiểm tra xem đã có lịch nhắc cùng danh mục chưa hoàn thành chưa
      const existingCheck = await this.dbService.query(
        `SELECT ScheduleID FROM MaintenanceSchedules
         WHERE VehicleID = @vehicleId 
           AND CategoryName = @categoryName 
           AND Status = N'Chưa thực hiện'`,
        [
          { name: 'vehicleId', type: sql.Int, value: vehicleId },
          { name: 'categoryName', type: sql.NVarChar, value: comp.name },
        ]
      );

      if (existingCheck.recordset.length === 0) {
        const insertRes = await this.dbService.query(
          `INSERT INTO MaintenanceSchedules (VehicleID, CategoryName, TargetOdometer, TargetDate, AlertThresholdKM, Status, Notes)
           OUTPUT INSERTED.ScheduleID
           VALUES (@vehicleId, @categoryName, @targetOdometer, @targetDate, 500, N'Chưa thực hiện', @notes)`,
          [
            { name: 'vehicleId', type: sql.Int, value: vehicleId },
            { name: 'categoryName', type: sql.NVarChar, value: comp.name },
            { name: 'targetOdometer', type: sql.Int, value: targetOdo },
            { name: 'targetDate', type: sql.Date, value: targetDate },
            { name: 'notes', type: sql.NVarChar, value: `Trợ lý AI tự động khởi tạo (${comp.statusText})` },
          ]
        );
        createdSchedules.push({
          scheduleId: insertRes.recordset[0]?.ScheduleID,
          categoryName: comp.name,
          targetOdometer: targetOdo,
          targetDate: targetDate.toISOString().split('T')[0],
        });
      }
    }

    return {
      success: true,
      message: `Đã tự động tạo ${createdSchedules.length} lịch nhắc bảo dưỡng thông minh cho xe ${health.licensePlate}!`,
      createdSchedules,
    };
  }
}
