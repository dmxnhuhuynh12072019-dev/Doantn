import { useState, useEffect } from 'react';

const OdometerModal = ({ isOpen, onClose, onSave, vehicle = null }) => {
  const [odometer, setOdometer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setOdometer(vehicle.CurrentOdometer || 0);
    }
    setError('');
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const numericOdometer = parseInt(odometer, 10);

    if (isNaN(numericOdometer) || numericOdometer < 0) {
      setError('Số km không hợp lệ');
      return;
    }

    if (numericOdometer < vehicle.CurrentOdometer) {
      setError(`Số km mới không được nhỏ hơn số km hiện tại (${vehicle.CurrentOdometer} km)`);
      return;
    }

    setLoading(true);
    try {
      await onSave(vehicle.VehicleID, numericOdometer);
      onClose();
    } catch (err) {
      setError(err.message || 'Cập nhật số km thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Cập nhật Số Kilomet (Odometer)</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-450 dark:text-slate-400 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Cập nhật số kilomet đi được của xe <span className="font-bold text-slate-700 dark:text-slate-350">{vehicle.LicensePlate}</span>.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Số km hiện tại:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{vehicle.CurrentOdometer.toLocaleString()} km</span>
            </div>
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              required
              min={vehicle.CurrentOdometer}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Nhập số kilomet mới"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OdometerModal;
