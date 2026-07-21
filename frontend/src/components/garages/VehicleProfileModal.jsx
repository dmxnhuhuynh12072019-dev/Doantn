import { useState, useEffect } from 'react';
import * as garageService from '../../services/garageService';

const VehicleProfileModal = ({ isOpen, onClose, vehicleId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await garageService.getVehicleProfile(vehicleId);
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin hồ sơ phương tiện.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && vehicleId) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isOpen, vehicleId]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            🚗 Hồ sơ định danh phương tiện
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-450 dark:text-slate-400 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium shrink-0">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-sm text-slate-500 font-semibold">Đang tải hồ sơ xe...</p>
          </div>
        ) : !profile ? (
          <div className="flex-1 text-center py-12 text-slate-400">
            Không tìm thấy thông tin phương tiện.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Vehicle Card Info */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-750 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Thông tin xe</span>
                  <h4 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                    {profile.vehicle.Brand} {profile.vehicle.Model}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Loại xe: {profile.vehicle.VehicleType} | Năm SX: {profile.vehicle.ManufactureYear || 'Không rõ'}
                  </p>
                </div>
                <div>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider mb-1.5">Biển số kiểm soát</span>
                  <span className="border-2 border-slate-800 dark:border-slate-400 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-xs shrink-0 whitespace-nowrap">
                    {profile.vehicle.LicensePlate}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Chủ sở hữu xe</span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                    {profile.vehicle.OwnerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    📞 {profile.vehicle.OwnerPhone || 'Chưa cung cấp'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ✉️ {profile.vehicle.OwnerEmail}
                  </p>
                </div>
                <div>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Số Odometer hiện tại</span>
                  <p className="text-xl font-black text-slate-800 dark:text-white">
                    {profile.vehicle.CurrentOdometer.toLocaleString()} <span className="text-xs font-normal text-slate-500">km</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Service History at Gara */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-805 dark:text-white">
                🔧 Nhật ký sửa chữa tại Gara của bạn ({profile.history.length})
              </h4>

              {profile.history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl bg-slate-50/10">
                  <span className="text-2xl mb-1 block">📝</span>
                  <p className="text-sm">Chưa có bản ghi lịch sử sửa chữa nào của xe tại xưởng bạn.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.history.map((record) => (
                    <div
                      key={record.HistoryID}
                      className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-750 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-2">
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-450 dark:text-slate-500 font-semibold block">Ngày bảo dưỡng</span>
                            <strong className="text-slate-700 dark:text-slate-200">
                              {new Date(record.ExecutionDate).toLocaleDateString()}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-450 dark:text-slate-500 font-semibold block">Số km (Odo)</span>
                            <strong className="text-slate-700 dark:text-slate-200">
                              {record.ExecutionOdometer.toLocaleString()} km
                            </strong>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xxs text-slate-450 dark:text-slate-500 block uppercase font-bold">Chi phí</span>
                          <strong className="text-base text-indigo-600 dark:text-indigo-400 font-black">
                            {formatCurrency(record.TotalCost)}
                          </strong>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xxs text-slate-450 dark:text-slate-500 block uppercase font-bold">Nội dung chi tiết</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          {record.Details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleProfileModal;
