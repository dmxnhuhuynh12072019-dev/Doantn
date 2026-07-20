import { useState, useEffect } from 'react';

const LegalDocumentModal = ({ isOpen, onClose, onSave, vehicleId, document = null }) => {
  const [documentType, setDocumentType] = useState('Đăng kiểm');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [alertThresholdDays, setAlertThresholdDays] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    if (document) {
      setDocumentType(document.DocumentType);
      setIssueDate(formatDate(document.IssueDate));
      setExpiryDate(formatDate(document.ExpiryDate));
      setAlertThresholdDays(document.AlertThresholdDays || 30);
    } else {
      setDocumentType('Đăng kiểm');
      setIssueDate('');
      setExpiryDate('');
      setAlertThresholdDays(30);
    }
    setError('');
  }, [document, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!expiryDate) {
      setError('Vui lòng chọn ngày hết hạn');
      return;
    }

    if (issueDate && expiryDate && new Date(expiryDate) <= new Date(issueDate)) {
      setError('Ngày hết hạn phải lớn hơn ngày cấp');
      return;
    }

    const payload = {
      vehicleId,
      documentType,
      issueDate: issueDate || null,
      expiryDate,
      alertThresholdDays: parseInt(alertThresholdDays, 10),
    };

    setLoading(true);
    try {
      await onSave(document?.DocumentID || null, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Lưu thông tin giấy tờ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">
            {document ? 'Gia hạn / Chỉnh sửa giấy tờ' : 'Đăng ký giấy tờ / Bảo hiểm mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Loại giấy tờ
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              disabled={!!document} // Không cho đổi loại giấy tờ khi đang sửa
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition"
            >
              <option value="Đăng kiểm">Đăng kiểm</option>
              <option value="Bảo hiểm dân sự">Bảo hiểm dân sự (Bắt buộc)</option>
              <option value="Bảo hiểm vật chất">Bảo hiểm vật chất (Thân vỏ)</option>
            </select>
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Ngày cấp (Không bắt buộc)
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Ngày hết hạn (Bắt buộc)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Alert Threshold Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Ngưỡng cảnh báo trước khi hết hạn (Số ngày)
            </label>
            <input
              type="number"
              value={alertThresholdDays}
              onChange={(e) => setAlertThresholdDays(e.target.value)}
              required
              min={0}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Ví dụ: 30"
            />
          </div>

          {/* Action Buttons */}
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
              {document ? 'Lưu thay đổi' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LegalDocumentModal;
