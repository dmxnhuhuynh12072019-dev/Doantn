import { useState, useEffect } from 'react';

const ScheduleModal = ({ isOpen, onClose, onSave, schedule = null, vehicleId }) => {
  const [categoryName, setCategoryName] = useState('');
  const [targetOdometer, setTargetOdometer] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [alertThresholdKM, setAlertThresholdKM] = useState('500');
  const [status, setStatus] = useState('Chưa thực hiện');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setCategoryName(schedule.CategoryName || '');
      setTargetOdometer(schedule.TargetOdometer !== null && schedule.TargetOdometer !== undefined ? schedule.TargetOdometer : '');
      setTargetDate(schedule.TargetDate ? schedule.TargetDate.split('T')[0] : '');
      setAlertThresholdKM(schedule.AlertThresholdKM !== undefined ? schedule.AlertThresholdKM.toString() : '500');
      setStatus(schedule.Status || 'Chưa thực hiện');
      setNotes(schedule.Notes || '');
    } else {
      setCategoryName('');
      setTargetOdometer('');
      setTargetDate('');
      setAlertThresholdKM('500');
      setStatus('Chưa thực hiện');
      setNotes('');
    }
    setError('');
  }, [schedule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!categoryName.trim()) {
      setError('Hạng mục bảo dưỡng không được để trống.');
      return;
    }

    if (!targetOdometer && !targetDate) {
      setError('Bạn phải nhập ít nhất Số km bảo dưỡng hoặc Ngày cần bảo dưỡng.');
      return;
    }

    setLoading(true);

    const data = {
      vehicleId,
      categoryName: categoryName.trim(),
      targetOdometer: targetOdometer ? parseInt(targetOdometer, 10) : undefined,
      targetDate: targetDate || undefined,
      alertThresholdKM: alertThresholdKM ? parseInt(alertThresholdKM, 10) : 500,
      notes: notes.trim() || undefined,
    };

    if (schedule) {
      data.status = status;
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            {schedule ? 'Cập nhật lịch nhắc' : 'Tạo lịch nhắc bảo dưỡng mới'}
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hạng mục cần nhắc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ví dụ: Thay nhớt động cơ, Đảo lốp..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Số km bảo dưỡng (đích)</label>
              <input
                type="number"
                value={targetOdometer}
                onChange={(e) => setTargetOdometer(e.target.value)}
                placeholder="Ví dụ: 40000"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ngày bảo dưỡng (đích)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ngưỡng báo trước (KM)</label>
              <input
                type="number"
                value={alertThresholdKM}
                onChange={(e) => setAlertThresholdKM(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {schedule && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="Chưa thực hiện">Chưa thực hiện</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ghi chú thêm</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Khuyên dùng nhớt tổng hợp, hãng đề xuất..."
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            ></textarea>
          </div>

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
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
              {schedule ? 'Lưu thay đổi' : 'Tạo lịch nhắc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
