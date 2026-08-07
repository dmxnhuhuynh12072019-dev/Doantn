import { useState, useEffect } from 'react';
import * as vehicleService from '../../services/vehicleService';

const VehicleFormModal = ({ isOpen, onClose, onSave, vehicle = null }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Ô tô');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [manufactureYear, setManufactureYear] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [isCommercial, setIsCommercial] = useState(false);
  const [htxCode, setHtxCode] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  
  // Module 4 State: Auto Preset Generator
  const [autoGenerateSchedules, setAutoGenerateSchedules] = useState(true);
  const [presetPreviews, setPresetPreviews] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setLicensePlate(vehicle.LicensePlate || '');
      setVehicleType(vehicle.VehicleType || 'Ô tô');
      setBrand(vehicle.Brand || '');
      setModel(vehicle.Model || '');
      setManufactureYear(vehicle.ManufactureYear || '');
      setPurchaseDate(vehicle.PurchaseDate ? vehicle.PurchaseDate.split('T')[0] : '');
      setCurrentOdometer(vehicle.CurrentOdometer || '');
      setIsCommercial(!!vehicle.IsCommercial);
      setHtxCode(vehicle.HTXCode || '');
      setBadgeNumber(vehicle.BadgeNumber || '');
      setAutoGenerateSchedules(false);
    } else {
      // Clear form for add mode
      setLicensePlate('');
      setVehicleType('Ô tô');
      setBrand('');
      setModel('');
      setManufactureYear('');
      setPurchaseDate('');
      setCurrentOdometer('10000');
      setIsCommercial(false);
      setHtxCode('');
      setBadgeNumber('');
      setAutoGenerateSchedules(true);
    }
    setError('');
  }, [vehicle, isOpen]);

  // Load preset schedule preview when specs change in Add Mode
  useEffect(() => {
    if (!vehicle && isOpen && autoGenerateSchedules) {
      const fetchPreview = async () => {
        setLoadingPresets(true);
        try {
          const odo = parseInt(currentOdometer, 10) || 0;
          const data = await vehicleService.previewPresetSchedules({
            vehicleType,
            currentOdometer: odo,
            purchaseDate: purchaseDate || undefined,
          });
          setPresetPreviews(data || []);
        } catch {
          setPresetPreviews([]);
        } finally {
          setLoadingPresets(false);
        }
      };

      const timer = setTimeout(() => {
        fetchPreview();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [vehicle, isOpen, vehicleType, currentOdometer, purchaseDate, autoGenerateSchedules]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = {
      brand,
      model,
      manufactureYear: manufactureYear ? parseInt(manufactureYear, 10) : undefined,
      purchaseDate: purchaseDate || undefined,
      isCommercial,
      htxCode: isCommercial ? htxCode : undefined,
      badgeNumber: isCommercial ? badgeNumber : undefined,
    };

    if (!vehicle) {
      data.licensePlate = licensePlate;
      data.vehicleType = vehicleType;
      data.currentOdometer = currentOdometer ? parseInt(currentOdometer, 10) : 0;
      data.autoGenerateSchedules = autoGenerateSchedules;
    }

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">
              {vehicle ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {vehicle ? 'Cập nhật thông tin chi tiết xe' : 'Đăng ký xe để quản lý lịch bảo dưỡng & nhắc nhở tự động'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-400 transition cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Loại phương tiện</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                disabled={!!vehicle}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition"
              >
                <option value="Ô tô">🚗 Ô tô</option>
                <option value="Xe máy">🏍️ Xe máy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Biển số xe</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
                disabled={!!vehicle}
                placeholder="Ví dụ: 59A-123.45"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition font-mono uppercase font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Hãng sản xuất</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="Ví dụ: Toyota, Honda"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Dòng xe (Model)</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="Ví dụ: Vios, Civic, SH"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Năm sản xuất</label>
              <input
                type="number"
                value={manufactureYear}
                onChange={(e) => setManufactureYear(e.target.value)}
                placeholder="Ví dụ: 2020"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Ngày mua xe</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {!vehicle && (
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Số kilomet hiện tại (Odometer)</label>
              <input
                type="number"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                required
                min="0"
                placeholder="Ví dụ: 12000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
              />
            </div>
          )}

          {/* Module 4: Tùy chọn Tự động khởi tạo Lịch bảo dưỡng mẫu */}
          {!vehicle && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateSchedules}
                  onChange={(e) => setAutoGenerateSchedules(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                />
                <div>
                  <span className="text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    ⚡ Tự động khởi tạo trọn bộ lịch bảo dưỡng mẫu theo mốc km
                  </span>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300/80 mt-0.5">
                    Hệ thống sẽ dựa trên mốc Odometer ({parseInt(currentOdometer, 10) || 0} km) và Loại xe ({vehicleType}) để tự động sinh sẵn các mốc thay nhớt, bảo dưỡng phanh & đăng kiểm.
                  </p>
                </div>
              </label>

              {autoGenerateSchedules && (
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xxs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                      Xem trước {presetPreviews.length} mốc lịch tự động sẽ tạo:
                    </span>
                    {loadingPresets && (
                      <span className="text-xxs text-indigo-600 animate-pulse">Đang tính toán...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {presetPreviews.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-xs flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-base">{item.itemType === 'Legal' ? '📜' : '🔧'}</span>
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.categoryName}</p>
                            <p className="text-xxs text-slate-500 dark:text-slate-400">
                              {item.targetOdometer > 0 ? `Mốc ${item.targetOdometer.toLocaleString('vi-VN')} km` : `Hạn: ${item.targetDate}`}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xxs font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {item.itemType === 'Legal' ? 'Giấy tờ' : 'Mốc km'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mở rộng: Xe kinh doanh dịch vụ */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isCommercial}
                onChange={(e) => setIsCommercial(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                🚕 Đây là Xe chạy dịch vụ (Grab, Be, Xe hợp đồng...)
              </span>
            </label>

            {isCommercial && (
              <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in zoom-in-95 duration-150">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mã Hợp tác xã (HTX)</label>
                  <input
                    type="text"
                    value={htxCode}
                    onChange={(e) => setHtxCode(e.target.value)}
                    placeholder="VD: HTX-SAIGON-01"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Số phù hiệu xe</label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="VD: PH-889911"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              {vehicle ? 'Lưu thay đổi' : 'Thêm phương tiện & Khởi tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
