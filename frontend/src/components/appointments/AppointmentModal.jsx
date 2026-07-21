import { useState, useEffect } from 'react';
import * as garageService from '../../services/garageService';

const AppointmentModal = ({ isOpen, onClose, onSave, vehicle }) => {
  const [garages, setGarages] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loadingGarages, setLoadingGarages] = useState(false);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Set default appointment date to tomorrow at 09:00
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    // Format YYYY-MM-DDTHH:MM
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchGarages = async () => {
      setLoadingGarages(true);
      setError('');
      try {
        const data = await garageService.getGarages();
        setGarages(data);
        if (data.length > 0) {
          setSelectedGarageId(data[0].GarageID.toString());
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách Gara liên kết');
      } finally {
        setLoadingGarages(false);
      }
    };

    if (isOpen) {
      fetchGarages();
      setAppointmentDate(getDefaultDateTime());
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedGarageId) {
      setError('Vui lòng chọn một Gara đối tác.');
      return;
    }

    if (!appointmentDate) {
      setError('Vui lòng chọn thời gian đặt hẹn.');
      return;
    }

    // Check if appointment date is in the past
    if (new Date(appointmentDate) < new Date()) {
      setError('Thời gian đặt hẹn không thể ở trong quá khứ.');
      return;
    }

    setSubmitLoading(true);
    const data = {
      garageId: parseInt(selectedGarageId, 10),
      vehicleId: vehicle.VehicleID,
      appointmentDate: new Date(appointmentDate).toISOString(),
      notes: notes.trim() || undefined,
    };

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Đặt lịch hẹn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitLoading(false);
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
              📅 Đặt lịch sửa chữa
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Phương tiện: <strong className="text-slate-600 dark:text-slate-350">{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate})</strong>
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
          <div>
            <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
              Chọn Gara đối tác <span className="text-rose-500">*</span>
            </label>
            {loadingGarages ? (
              <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
            ) : (
              <select
                value={selectedGarageId}
                onChange={(e) => setSelectedGarageId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium"
              >
                {garages.length === 0 ? (
                  <option value="">Không có gara nào hoạt động</option>
                ) : (
                  garages.map((g) => (
                    <option key={g.GarageID} value={g.GarageID}>
                      {g.GarageName} — {g.Address} ({g.Rating} ⭐)
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
              Chọn ngày giờ hẹn <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-750 dark:text-slate-300 mb-1">
              Ghi chú cho Gara (Hạng mục cần sửa chữa, hiện tượng lỗi...)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Tôi muốn thay nhớt định kỳ và kiểm tra tiếng kêu lạ dưới gầm xe..."
              rows="3"
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
              disabled={submitLoading || garages.length === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {submitLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
