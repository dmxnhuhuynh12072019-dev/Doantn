import { useState, useEffect } from 'react';
import * as vehicleService from '../../services/vehicleService';

const POPULAR_BRANDS = [
  'Toyota', 'Hyundai', 'Honda', 'Kia', 'Mazda', 'Ford', 'VinFast', 'Mitsubishi', 'Mercedes-Benz', 'BMW', 'Khác'
];

const IdentifyVehicleModal = ({
  isOpen,
  onClose,
  initialData = {},
  onIdentifiedSuccess,
}) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Ô tô');
  const [brand, setBrand] = useState('Toyota');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('45000');
  const [manufactureYear, setManufactureYear] = useState(new Date().getFullYear().toString());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLicensePlate(initialData.licensePlate || initialData.LicensePlate || '');
      setVehicleType(initialData.vehicleType || initialData.VehicleType || 'Ô tô');
      
      const b = initialData.brand || initialData.Brand;
      if (b && POPULAR_BRANDS.includes(b)) {
        setBrand(b);
        setCustomBrand('');
      } else if (b && b !== 'Ô tô') {
        setBrand('Khác');
        setCustomBrand(b);
      } else {
        setBrand('Toyota');
        setCustomBrand('');
      }

      setModel(initialData.model && initialData.model !== 'Chưa cập nhật model' ? initialData.model : '');
      const odo = initialData.currentOdometer ?? initialData.CurrentOdometer ?? 45000;
      setCurrentOdometer(odo > 0 ? odo.toString() : '45000');
      setCustomerName(initialData.ownerName && initialData.ownerName !== 'Chủ xe (Chờ định danh)' ? initialData.ownerName : '');
      setCustomerPhone(initialData.customerPhone || '');
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (openChecklistAfter = true) => {
    setError('');

    const cleanPlate = licensePlate.trim().toUpperCase();
    if (!cleanPlate) {
      setError('Vui lòng nhập biển số xe.');
      return;
    }

    const finalBrand = brand === 'Khác' ? customBrand.trim() : brand;
    if (!finalBrand) {
      setError('Vui lòng chọn hoặc nhập hãng xe.');
      return;
    }

    const cleanModel = model.trim();
    if (!cleanModel) {
      setError('Vui lòng nhập dòng xe / Model (Ví dụ: Vios, Accent, City, CX-5...).');
      return;
    }

    const parsedOdo = parseInt(currentOdometer.toString().replace(/,/g, ''), 10);
    if (isNaN(parsedOdo) || parsedOdo < 0) {
      setError('Số Kilomet (Odometer) không hợp lệ.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        licensePlate: cleanPlate,
        vehicleType,
        brand: finalBrand,
        model: cleanModel,
        currentOdometer: parsedOdo,
        manufactureYear: parseInt(manufactureYear, 10) || new Date().getFullYear(),
        autoGenerateSchedules: true,
      };

      const result = await vehicleService.createVehicle(payload);
      const newVehicleId = result.vehicleId || result.VehicleID || result.id;

      const createdVehicle = {
        VehicleID: newVehicleId,
        vehicleId: newVehicleId,
        LicensePlate: cleanPlate,
        licensePlate: cleanPlate,
        VehicleType: vehicleType,
        vehicleType: vehicleType,
        Brand: finalBrand,
        brand: finalBrand,
        Model: cleanModel,
        model: cleanModel,
        CurrentOdometer: parsedOdo,
        currentOdometer: parsedOdo,
        OwnerName: customerName.trim() || 'Khách hàng vãng lai',
        customerPhone: customerPhone.trim(),
        ManufactureYear: parseInt(manufactureYear, 10) || new Date().getFullYear(),
      };

      if (onIdentifiedSuccess) {
        onIdentifiedSuccess(createdVehicle, openChecklistAfter);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi định danh xe:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tạo hồ sơ định danh xe. Vui lòng thử lại.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-2xs border border-indigo-100 dark:border-indigo-900/40">
              📝
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Định danh & Tiếp nhận xe vào Gara
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Khởi tạo hồ sơ xe vãng lai để bắt đầu lập phiếu bảo dưỡng & sửa chữa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Biển số xe nổi bật */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                Biển số tiếp nhận
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Được bóc tách từ AI OCR hoặc tra cứu
              </p>
            </div>
            <div className="px-4 py-1.5 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-200 rounded-xl text-center shadow-xs">
              <span className="font-mono text-base font-black tracking-wider text-slate-900 dark:text-white">
                {licensePlate || 'CHƯA CÓ'}
              </span>
            </div>
          </div>



          {/* Hãng xe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hãng sản xuất <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBrand(b);
                    if (b !== 'Khác') setCustomBrand('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    brand === b
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {brand === 'Khác' && (
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Nhập tên hãng xe khác (VD: Audi, Lexus, Suzuki...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Dòng xe (Model) & Số Km tiếp nhận */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dòng xe / Model <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="VD: Vios 1.5G, Accent, CX-5..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số Km (Odometer) tiếp nhận <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  placeholder="VD: 45000"
                  className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ chủ xe (Tùy chọn) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>👤</span>
              <span>Thông tin liên hệ chủ xe (Tùy chọn ghi chú)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tên chủ xe (VD: Anh Cường)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Số điện thoại (VD: 0989...)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang lưu hồ sơ...</span>
              </>
            ) : (
              <>
                <span>🛠️</span>
                <span>Lưu xe & Lập phiếu bảo dưỡng</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default IdentifyVehicleModal;
