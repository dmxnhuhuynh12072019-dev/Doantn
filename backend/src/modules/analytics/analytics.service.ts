import { Injectable, ForbiddenException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private dbService: DatabaseService) {}

  private async getGarageIdByUserId(userId: number): Promise<number> {
    const result = await this.dbService.query(
      'SELECT GarageID FROM Garages WHERE UserID = @userId',
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    if (result.recordset.length === 0) {
      throw new ForbiddenException('Tài khoản này chưa được liên kết với Gara nào.');
    }

    return result.recordset[0].GarageID;
  }

  async getGarageDashboard(userId: number) {
    const garageId = await this.getGarageIdByUserId(userId);

    // 1. Tổng doanh thu dịch vụ
    const revenueResult = await this.dbService.query(
      'SELECT ISNULL(SUM(TotalCost), 0) AS TotalRevenue FROM MaintenanceHistory WHERE GarageID = @garageId',
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    const totalRevenue = revenueResult.recordset[0].TotalRevenue;

    // 2. Tổng số xe đã bảo dưỡng tại gara (đầu xe độc bản)
    const vehiclesResult = await this.dbService.query(
      'SELECT COUNT(DISTINCT VehicleID) AS TotalVehicles FROM MaintenanceHistory WHERE GarageID = @garageId',
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    const totalVehicles = vehiclesResult.recordset[0].TotalVehicles;

    // 3. Doanh thu dịch vụ theo tháng trong năm hiện tại (Biểu đồ đường)
    const monthlyResult = await this.dbService.query(
      `SELECT MONTH(ExecutionDate) AS Month, ISNULL(SUM(TotalCost), 0) AS Revenue 
       FROM MaintenanceHistory 
       WHERE GarageID = @garageId AND YEAR(ExecutionDate) = YEAR(GETDATE()) 
       GROUP BY MONTH(ExecutionDate) 
       ORDER BY Month ASC`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    
    // Khởi tạo mảng 12 tháng với doanh thu = 0
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({ month: `Tháng ${i + 1}`, revenue: 0 }));
    monthlyResult.recordset.forEach(row => {
      monthlyRevenue[row.Month - 1].revenue = row.Revenue;
    });

    // 4. Lượng xe sửa chữa trong 15 ngày qua (Biểu đồ cột)
    const dailyResult = await this.dbService.query(
      `SELECT CAST(ExecutionDate AS DATE) AS Date, COUNT(*) AS Count 
       FROM MaintenanceHistory 
       WHERE GarageID = @garageId AND ExecutionDate >= DATEADD(day, -14, GETDATE()) 
       GROUP BY CAST(ExecutionDate AS DATE) 
       ORDER BY Date ASC`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );

    // Tạo mảng 15 ngày qua để map dữ liệu biểu đồ
    const dailyVisits: any[] = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const match = dailyResult.recordset.find(row => {
        const rowDate = new Date(row.Date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });
      dailyVisits.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: match ? match.Count : 0
      });
    }

    // 5. Danh sách 5 khách hàng thân thiết (xe đến bảo dưỡng nhiều lần nhất)
    const customerResult = await this.dbService.query(
      `SELECT TOP 5 v.LicensePlate, v.Brand, v.Model, u.FullName AS OwnerName, COUNT(*) AS VisitCount
       FROM MaintenanceHistory h
       JOIN Vehicles v ON h.VehicleID = v.VehicleID
       JOIN Users u ON v.UserID = u.UserID
       WHERE h.GarageID = @garageId
       GROUP BY v.LicensePlate, v.Brand, v.Model, u.FullName
       ORDER BY VisitCount DESC`,
      [{ name: 'garageId', type: sql.Int, value: garageId }]
    );
    const frequentCustomers = customerResult.recordset;

    return {
      totalRevenue,
      totalVehicles,
      monthlyRevenue,
      dailyVisits,
      frequentCustomers,
    };
  }

  // Lấy dữ liệu báo cáo chi tiêu cá nhân dành cho Chủ xe (User)
  async getUserExpenses(userId: number) {
    // 1. Tổng chi tiêu bảo dưỡng tích lũy
    const totalResult = await this.dbService.query(
      `SELECT ISNULL(SUM(h.TotalCost), 0) AS TotalCost 
       FROM MaintenanceHistory h 
       JOIN Vehicles v ON h.VehicleID = v.VehicleID 
       WHERE v.UserID = @userId`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    const totalCost = totalResult.recordset[0].TotalCost;

    // 2. Thống kê chi phí theo từng đầu xe
    const byVehicleResult = await this.dbService.query(
      `SELECT v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType, ISNULL(SUM(h.TotalCost), 0) AS TotalCost
       FROM Vehicles v
       LEFT JOIN MaintenanceHistory h ON v.VehicleID = h.VehicleID
       WHERE v.UserID = @userId
       GROUP BY v.VehicleID, v.LicensePlate, v.Brand, v.Model, v.VehicleType
       ORDER BY TotalCost DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    const expensesByVehicle = byVehicleResult.recordset;

    // 3. Thống kê chi phí theo tháng trong năm hiện tại
    const monthlyResult = await this.dbService.query(
      `SELECT MONTH(h.ExecutionDate) AS Month, ISNULL(SUM(h.TotalCost), 0) AS Cost
       FROM MaintenanceHistory h
       JOIN Vehicles v ON h.VehicleID = v.VehicleID
       WHERE v.UserID = @userId AND YEAR(h.ExecutionDate) = YEAR(GETDATE())
       GROUP BY MONTH(h.ExecutionDate)
       ORDER BY Month ASC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );

    const monthlyCost = Array.from({ length: 12 }, (_, i) => ({ month: `Tháng ${i + 1}`, cost: 0 }));
    monthlyResult.recordset.forEach(row => {
      monthlyCost[row.Month - 1].cost = row.Cost;
    });

    // 4. Lấy danh sách nhật ký bảo dưỡng có phí gần đây nhất
    const recentHistoryResult = await this.dbService.query(
      `SELECT TOP 5 h.*, v.LicensePlate, v.Brand, v.Model, g.GarageName
       FROM MaintenanceHistory h
       JOIN Vehicles v ON h.VehicleID = v.VehicleID
       LEFT JOIN Garages g ON h.GarageID = g.GarageID
       WHERE v.UserID = @userId
       ORDER BY h.ExecutionDate DESC, h.HistoryID DESC`,
      [{ name: 'userId', type: sql.Int, value: userId }]
    );
    const recentHistory = recentHistoryResult.recordset;

    return {
      totalCost,
      expensesByVehicle,
      monthlyCost,
      recentHistory,
    };
  }
}
