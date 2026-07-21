import { useState, useEffect } from 'react';

const CompleteAppointmentModal = ({ isOpen, onClose, onSave, appointment }) => {
  const [odometer, setOdometer] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [details, setDetails] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      // Pre-fill odometer with vehicle's current odometer
      setOdometer(appointment.CurrentOdometer ? appointment.CurrentOdometer.toString() : '');
      setTotalCost('');
      setDetails('');
      setError('');
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!odometer || parseInt(odometer, 10) < 0) {
      setError('Số kilomet không hợp lệ.');
      return;
    }

    if (appointment.CurrentOdometer && parseInt(odometer, 10) < appointment.CurrentOdometer) {
      setError(`Số kilomet không thể nhỏ hơn số Odo hiện tại của xe (${appointment.CurrentOdometer.toLocaleString()} km).`);
      return;
    }

    if (!totalCost || parseFloat(totalCost) < 0) {
      setError('Tổng chi phí không hợp lệ.');
      return;
    }

    if (!details.trim()) {
      setError('Vui lòng điền nội dung chi tiết dịch vụ đã thực hiện.');
      return;
    }

    setLoading(true);
    const data = {
      odometer: parseInt(odometer, 10),
      totalCost: parseFloat(totalCost),
      details: details.trim(),
    };

    try {
      await onSave(appointment.AppointmentID, data);
      onClose();
    } catch (err) {
      setError(err.message || 'Hoàn tất lịch hẹn bảo dưỡng thất bại.');
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
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              🔧 Hoàn tất bảo dưỡng xe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
              Xe: <strong className="text-slate-700 dark:text-slate-350">{appointment.Brand} {appointment.Model} ({appointment.LicensePlate})</strong>
            </p>
          </div>
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
              <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
                Số Odo lúc bàn giao <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
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

          <div>
            <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
              Chi tiết các hạng mục sửa chữa/linh kiện thay thế <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Nhập chi tiết dịch vụ đã thực hiện. Ví dụ: Thay dầu Castrol Magnatec, Thay lọc nhớt dầu, vệ sinh má phanh..."
              required
              rows="4"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm leading-relaxed"
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
              Hoàn thành bảo dưỡng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteAppointmentModal;
