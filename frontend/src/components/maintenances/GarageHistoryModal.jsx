import { useState, useEffect } from 'react';
import * as maintenanceService from '../../services/maintenanceService';

const GarageHistoryModal = ({ isOpen, onClose, onSave }) => {
  const [licensePlateInput, setLicensePlateInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedVehicle, setSearchedVehicle] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Form inputs
  const [executionDate, setExecutionDate] = useState('');
  const [executionOdometer, setExecutionOdometer] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [details, setDetails] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLicensePlateInput('');
      setSearchedVehicle(null);
      setSearchError('');
      setExecutionDate(new Date().toISOString().split('T')[0]);
      setExecutionOdometer('');
      setTotalCost('');
      setDetails('');
      setAppointmentId('');
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchVehicle = async (e) => {
    e.preventDefault();
    if (!licensePlateInput.trim()) return;

    setSearching(true);
    setSearchError('');
    setSearchedVehicle(null);

    try {
      const data = await maintenanceService.searchVehicle(licensePlateInput.trim());
      setSearchedVehicle(data);
      setExecutionOdometer(data.CurrentOdometer.toString());
    } catch (err) {
      setSearchError(err.message || 'Không tìm thấy phương tiện nào có biển số xe này.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!searchedVehicle) {
      setSubmitError('Vui lòng tìm và chọn phương tiện trước khi lưu.');
      return;
    }

    if (!details.trim()) {
      setSubmitError('Vui lòng nhập chi tiết hạng mục dịch vụ.');
      return;
    }

    setLoading(true);

    const payload = {
      vehicleId: searchedVehicle.VehicleID,
      executionDate,
      executionOdometer: parseInt(executionOdometer, 10),
      totalCost: parseFloat(totalCost),
      details: details.trim(),
      appointmentId: appointmentId ? parseInt(appointmentId, 10) : undefined,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Ghi sổ lịch sử thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            🔧 Ghi sổ bảo dưỡng dịch vụ
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

        {/* Bước 1: Tìm kiếm xe */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-750">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Tìm phương tiện khách hàng
          </label>
          <form onSubmit={handleSearchVehicle} className="flex gap-2">
            <input
              type="text"
              value={licensePlateInput}
              onChange={(e) => setLicensePlateInput(e.target.value)}
              placeholder="Nhập biển số xe (Ví dụ: 59A-123.45)"
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {searching ? 'Đang tìm...' : 'Tìm xe'}
            </button>
          </form>

          {searchError && (
            <p className="mt-2 text-xs font-semibold text-rose-500">{searchError}</p>
          )}

          {searchedVehicle && (
            <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {searchedVehicle.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                </span>
                <span className="px-2 py-0.5 border border-slate-800 dark:border-slate-400 rounded-md text-xs font-black tracking-wide text-slate-800 dark:text-white">
                  {searchedVehicle.LicensePlate}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                {searchedVehicle.Brand} {searchedVehicle.Model}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-450">
                Chỉ số km hiện tại: <strong>{searchedVehicle.CurrentOdometer.toLocaleString()} km</strong>
              </p>
            </div>
          )}
        </div>

        {/* Form nhập liệu */}
        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
                Số Odo lúc sửa <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={executionOdometer}
                onChange={(e) => setExecutionOdometer(e.target.value)}
                required
                min="0"
                placeholder="Số km hiện tại"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
                Tổng chi phí (VND) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                required
                min="0"
                placeholder="Ví dụ: 1500000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
                Ngày bảo dưỡng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
                Mã lịch hẹn (Tùy chọn)
              </label>
              <input
                type="number"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="ID lịch đặt hẹn"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
              Nội dung dịch vụ thực hiện <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ví dụ: Thay nhớt Castrol Magnatec, Thay lọc nhớt động cơ, bảo dưỡng phanh..."
              required
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm"
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              Ghi nhận lịch sử
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GarageHistoryModal;
