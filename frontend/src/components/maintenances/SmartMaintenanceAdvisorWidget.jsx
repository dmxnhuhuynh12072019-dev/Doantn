import { useState, useEffect } from 'react';
import { getVehicleHealth, applyAdvisorRecommendations } from '../../services/maintenanceService';
import { useModal } from '../../context/ModalContext';

const SmartMaintenanceAdvisorWidget = ({
  vehicleId,
  vehicles = [],
  onSelectVehicle,
  onOpenBookingModal,
}) => {
  const { toast } = useModal();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchHealth = async (vId) => {
    if (!vId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getVehicleHealth(vId);
      setHealthData(data);
    } catch (err) {
      console.warn('Cannot fetch vehicle health:', err);
      setError(err.message || 'Chưa thể tải báo cáo sức khỏe xe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchHealth(vehicleId);
    }
  }, [vehicleId]);

  const handleApplyReminders = async () => {
    if (!vehicleId) return;
    setApplying(true);
    try {
      const res = await applyAdvisorRecommendations(vehicleId);
      toast.success(res.message || 'Đã tự động khởi tạo lịch nhắc bảo dưỡng thông minh!');
      fetchHealth(vehicleId);
    } catch (err) {
      toast.error(err.message || 'Không thể đồng bộ lịch nhắc.');
    } finally {
      setApplying(false);
    }
  };

  const handleConsultAI = (topic = '') => {
    const event = new CustomEvent('open-acoh-ai-chat', {
      detail: { prompt: topic || `Tư vấn tình trạng sức khỏe xe ${healthData?.licensePlate}` }
    });
    window.dispatchEvent(event);
  };

  const handleBookWithItems = (action) => {
    if (onOpenBookingModal && healthData) {
      onOpenBookingModal({
        vehicleId: healthData.vehicleId,
        licensePlate: healthData.licensePlate,
        brand: healthData.vehicleName,
        suggestedPackage: action?.title || healthData.nextService.packageName,
        suggestedNotes: `[Trợ lý AI khuyến nghị] ${action?.reason || 'Bảo dưỡng định kỳ mốc ' + healthData.nextService.targetOdometer.toLocaleString() + ' km'}.\nHạng mục: ${action?.suggestedItems?.join(', ') || 'Kiểm tra toàn diện'}`,
      });
    }
  };

  if (!vehicleId && (!vehicles || vehicles.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-700 p-3.5 sm:p-7 shadow-xs relative overflow-hidden transition-all">
      
      {/* Top Header & Vehicle Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 sm:pb-5 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-indigo-600/20 shrink-0">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 tracking-wider">
                  ACOH AI Car Doctor
                </span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 leading-tight">
                Trợ Lý Sức Khỏe & Nhắc Lịch Xe
              </h3>
            </div>
          </div>
        </div>

        {/* Vehicle Selector Pills with horizontal touch scroll */}
        {vehicles && vehicles.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0 pt-1 sm:pt-0">
            {vehicles.map((v) => (
              <button
                key={v.VehicleID}
                onClick={() => onSelectVehicle && onSelectVehicle(v.VehicleID)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 ${
                  v.VehicleID === vehicleId
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-650'
                }`}
              >
                {v.LicensePlate}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 sm:py-16 flex flex-col justify-center items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-3 sm:border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Đang phân tích dữ liệu xe...</span>
        </div>
      ) : error ? (
        <div className="py-6 sm:py-8 text-center text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 rounded-xl sm:rounded-2xl p-4 mt-3">
          {error}
        </div>
      ) : healthData ? (
        <div className="space-y-4 sm:space-y-6 pt-3.5 sm:pt-5">
          
          {/* Main Gauges & AI Predictions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-stretch">
            
            {/* Health Score Circular Gauge (Compact on Mobile) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/70 dark:border-slate-700 flex flex-row lg:flex-col items-center justify-between lg:justify-center text-left lg:text-center shadow-2xs relative gap-4">
              
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3.2"
                    className="dark:stroke-slate-700"
                  />
                  {/* Health Score Dynamic Fill */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={healthData.healthTierColor}
                    strokeWidth="3.6"
                    strokeDasharray={`${(healthData.healthScore / 100) * 88} 88`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                    {healthData.healthScore}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Sức khỏe
                  </span>
                </div>
              </div>

              <div className="flex-1 lg:flex-initial flex flex-col items-start lg:items-center">
                <span
                  className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wide"
                  style={{
                    backgroundColor: `${healthData.healthTierColor}20`,
                    color: healthData.healthTierColor,
                    border: `1px solid ${healthData.healthTierColor}40`,
                  }}
                >
                  {healthData.healthTierText}
                </span>

                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium mt-1.5 sm:mt-3 leading-relaxed">
                  {healthData.summaryQuote}
                </p>
              </div>
            </div>

            {/* AI Insights & Next Milestone Card */}
            <div className="lg:col-span-8 bg-slate-50/80 dark:bg-slate-850/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between space-y-3.5 sm:space-y-4">
              
              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm">⚡</span>
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Dự Báo Hành Trình AI
                    </h4>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700">
                    Xe: <strong className="text-slate-800 dark:text-white">{healthData.licensePlate}</strong>
                  </span>
                </div>

                {/* 3 Metric Mini Cards (Responsive 3 cols or mobile 2+1 grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-100 dark:border-slate-700 shadow-2xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Odo ước tính</span>
                    <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {healthData.estimatedOdometer.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">km</span>
                    </p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      + Tự cập nhật
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-100 dark:border-slate-700 shadow-2xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vận tốc tích lũy</span>
                    <p className="text-sm sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ~{healthData.dailyAverageKm} <span className="text-[10px] text-slate-400 font-bold">km/ngày</span>
                    </p>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                      Tần suất cá nhân
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-100 dark:border-slate-700 shadow-2xs">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mốc bảo dưỡng tới</span>
                    <p className="text-sm sm:text-lg font-black text-amber-500 dark:text-amber-400 mt-0.5">
                      {healthData.nextService.targetOdometer.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">km</span>
                    </p>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                      Còn {healthData.nextService.remainingKm.toLocaleString()} km (~{healthData.nextService.remainingDays} ngày)
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Recommended Service Alert Box */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-xs sm:text-sm">📅</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase text-amber-300">
                      Gợi ý mốc tiếp theo
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-black text-white leading-tight">
                    {healthData.nextService.packageName}
                  </h5>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                    Dự kiến: <strong className="text-white">{new Date(healthData.nextService.estimatedDate).toLocaleDateString('vi-VN')}</strong> • Chi phí: <strong className="text-emerald-300">{new Intl.NumberFormat('vi-VN').format(healthData.nextService.totalEstimatedCost)} đ</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={() => handleConsultAI(`Tôi muốn tìm hiểu về ${healthData.nextService.packageName}`)}
                    className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    title="Hỏi Bác sĩ AI"
                  >
                    <span>💬</span>
                    <span>Hỏi AI</span>
                  </button>
                  <button
                    onClick={() => handleBookWithItems({ title: healthData.nextService.packageName, reason: 'Bảo dưỡng định kỳ mốc ' + healthData.nextService.targetOdometer.toLocaleString() + ' km' })}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-black transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>📅</span>
                    <span>Đặt lịch</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Component Health Matrix Grid (Optimized 2 cols on mobile, 5 on desktop) */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2.5 sm:mb-3">
              <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>🔍</span>
                <span>Tình Trạng 5 Hạng Mục Kỹ Thuật</span>
              </h4>
              <button
                onClick={handleApplyReminders}
                disabled={applying}
                className="text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <span>{applying ? 'Đang đồng bộ...' : '✨ Tạo lịch nhắc tự động'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3.5">
              {healthData.components.map((comp, idx) => {
                const isUrgent = comp.status === 'Urgent';
                const isWarning = comp.status === 'Warning';
                const isLastOnMobileOdd = idx === healthData.components.length - 1; // 5th item spans full width on mobile

                return (
                  <div
                    key={comp.id}
                    className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border transition-all flex flex-col justify-between space-y-2 sm:space-y-3 ${
                      isLastOnMobileOdd ? 'col-span-2 lg:col-span-1' : 'col-span-1'
                    } ${
                      isUrgent
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                        : isWarning
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl sm:text-2xl">{comp.icon}</span>
                        <span
                          className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md ${
                            isUrgent
                              ? 'bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300'
                              : isWarning
                              ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {comp.status === 'Urgent' ? 'Cấp bách' : comp.status === 'Warning' ? 'Lưu ý' : 'Tốt'}
                        </span>
                      </div>

                      <h5 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white leading-tight line-clamp-1 sm:line-clamp-2">
                        {comp.name}
                      </h5>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Chu kỳ {comp.intervalKm.toLocaleString()} km
                      </span>
                    </div>

                    <div className="space-y-1 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Đã chạy:</span>
                        <span className="text-slate-900 dark:text-white">{comp.kmUsed.toLocaleString()} km</span>
                      </div>
                      <div className="w-full h-1 sm:h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (comp.kmUsed / comp.intervalKm) * 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-[9px] sm:text-[10px] font-bold mt-0.5 line-clamp-1 ${isUrgent ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        {comp.statusText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Urgent Warnings Banner */}
          {healthData.recommendedActions && healthData.recommendedActions.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-amber-200 dark:border-amber-900/50 space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-black uppercase">
                <span>⚠️</span>
                <span>Khuyến nghị xử lý từ Bác sĩ xe AI:</span>
              </div>
              
              <div className="space-y-2">
                {healthData.recommendedActions.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <h5 className="text-xs sm:text-xs font-black text-slate-900 dark:text-white">
                        {act.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Lý do: <strong className="text-amber-600 dark:text-amber-400">{act.reason}</strong>
                      </p>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block">
                        Hạng mục: {act.suggestedItems.join(', ')} • Dự toán: <strong className="text-indigo-600 dark:text-indigo-400">{new Intl.NumberFormat('vi-VN').format(act.estimatedCost)} đ</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookWithItems(act)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    >
                      <span>📅</span>
                      <span>Đặt hẹn Gara</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};

export default SmartMaintenanceAdvisorWidget;
