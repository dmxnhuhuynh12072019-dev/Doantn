import React, { useState, useEffect } from 'react';
import { getMaintenanceCategories } from '../../services/maintenanceService';
import PresetOdometerChecklist from './PresetOdometerChecklist';

export default function MaintenanceMatrixView({ vehicle, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  useEffect(() => {
    if (vehicle) {
      fetchCategories();
    }
  }, [vehicle]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceCategories(vehicle?.vehicleType || 'Ô tô');
      setCategories(data);
    } catch (err) {
      console.error('Không thể tải bộ khung mốc bảo dưỡng:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentOdo = vehicle?.currentOdometer || 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 text-slate-100 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-bold text-slate-100">Ma Trận Khung Bảo Dưỡng Chuẩn</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50">
              Module 1 Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Số Km hiện tại: <span className="font-semibold text-blue-400">{currentOdo.toLocaleString()} km</span> • Các mốc kiểm tra định kỳ đã được chuẩn hóa.
          </p>
        </div>

        <button
          onClick={() => setIsChecklistOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5"
        >
          <span>📋</span> Tích Chọn Bảo Dưỡng Theo Mốc Km
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Đang nạp ma trận bảo dưỡng...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const isPassed = currentOdo >= cat.targetOdometer;
            const isNext = !isPassed && (categories.find(c => c.targetOdometer > currentOdo)?.categoryId === cat.categoryId);

            return (
              <div
                key={cat.categoryId}
                className={`p-4 rounded-xl border transition-all ${
                  isPassed
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : isNext
                    ? 'bg-blue-950/40 border-blue-600/60 text-blue-200 ring-2 ring-blue-500/20'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold tracking-tight">
                    {cat.targetOdometer.toLocaleString()} KM
                  </span>
                  {isPassed ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      ✓ Đã qua mốc
                    </span>
                  ) : isNext ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-500/60 animate-pulse">
                      ⚡ Mốc sắp tới
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Chờ đạt
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-slate-200 mb-1">{cat.categoryName}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{cat.description}</p>

                {/* Main Items list snippet */}
                <div className="space-y-1 border-t border-slate-800/60 pt-2">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hạng mục kiểm tra:</div>
                  {cat.items?.slice(0, 3).map((item) => (
                    <div key={item.itemId} className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                      <span className="text-blue-400 text-[9px]">▪</span>
                      <span className="truncate">{item.itemName}</span>
                    </div>
                  ))}
                  {cat.items?.length > 3 && (
                    <div className="text-[10px] text-slate-400 italic">+ {cat.items.length - 3} hạng mục khác...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preset Checklist Modal */}
      {vehicle && (
        <PresetOdometerChecklist
          vehicle={vehicle}
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            fetchCategories();
          }}
        />
      )}
    </div>
  );
}
