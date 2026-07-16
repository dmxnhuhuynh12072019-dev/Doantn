import { useState, useEffect } from 'react';

const VehicleFormModal = ({ isOpen, onClose, onSave, vehicle = null }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Ô tô');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [manufactureYear, setManufactureYear] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setLicensePlate(vehicle.LicensePlate || '');
      setVehicleType(vehicle.VehicleType || 'Ô tô');
      setBrand(vehicle.Brand || '');
      setModel(vehicle.Model || '');
      setManufactureYear(vehicle.ManufactureYear || '');
      // Format DATE from SQL Server (YYYY-MM-DDThh:mm:ss.sssZ) to YYYY-MM-DD
      setPurchaseDate(vehicle.PurchaseDate ? vehicle.PurchaseDate.split('T')[0] : '');
      setCurrentOdometer(vehicle.CurrentOdometer || '');
    } else {
      // Clear form for add mode
      setLicensePlate('');
      setVehicleType('Ô tô');
      setBrand('');
      setModel('');
      setManufactureYear('');
      setPurchaseDate('');
      setCurrentOdometer('');
    }
    setError('');
  }, [vehicle, isOpen]);

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
    };

    if (!vehicle) {
      data.licensePlate = licensePlate;
      data.vehicleType = vehicleType;
      data.currentOdometer = currentOdometer ? parseInt(currentOdometer, 10) : 0;
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            {vehicle ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">Ngày mua xe</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              {vehicle ? 'Lưu thay đổi' : 'Thêm phương tiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
