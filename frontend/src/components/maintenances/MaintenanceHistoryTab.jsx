import { useState, useEffect } from 'react';
import * as maintenanceService from '../../services/maintenanceService';

const MaintenanceHistoryTab = ({ vehicleId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getHistory(vehicleId);
      setHistory(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử sửa chữa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchHistory();
    }
  }, [vehicleId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">Nhật ký sửa chữa & bảo dưỡng</h4>
        <p className="text-xs text-slate-500">Lịch sử chi tiết các lần bảo dưỡng, thay thế phụ tùng được Gara liên kết lưu trữ.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-750">
          <p className="text-sm text-slate-500">Chưa có lịch sử bảo dưỡng nào được ghi nhận cho xe này.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-700 ml-4 pl-6 space-y-6">
          {history.map((record) => (
            <div key={record.HistoryID} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 border-4 border-white dark:border-slate-900 ring-2 ring-indigo-600"></span>
              
              <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-750/70 p-5 shadow-sm space-y-3 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-50 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Ngày thực hiện</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                      {new Date(record.ExecutionDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left sm:text-right">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Số Odo</span>
                      <strong className="text-sm font-black text-slate-700 dark:text-white">
                        {record.ExecutionOdometer.toLocaleString()} km
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Chi phí</span>
                      <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(record.TotalCost)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Chi tiết sửa chữa</span>
                  <p className="text-sm text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {record.Details}
                  </p>
                </div>

                {record.GarageName && (
                  <div className="pt-2.5 border-t border-slate-50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-xxs text-slate-450 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 px-3 py-2 rounded-xl">
                    <span className="font-bold text-slate-600 dark:text-slate-400">
                      🔧 Gara thực hiện: {record.GarageName}
                    </span>
                    {record.GaragePhone && (
                      <span className="sm:text-right">
                        📞 Hotline: {record.GaragePhone} | 📍 {record.GarageAddress}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistoryTab;
