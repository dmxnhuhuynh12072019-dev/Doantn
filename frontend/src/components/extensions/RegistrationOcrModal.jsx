import { useState, useRef } from 'react';
import * as extensionService from '../../services/extensionService';

const RegistrationOcrModal = ({ isOpen, onClose, onApplyData }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Form extracted states
  const [formData, setFormData] = useState({
    documentNumber: '',
    licensePlate: '',
    chassisNumber: '',
    engineNumber: '',
    issueDate: '',
    expiryDate: '',
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processImageFile(selectedFile);
    }
  };

  const processImageFile = (fileToScan, customPreviewUrl = null) => {
    setFile(fileToScan);
    setPreviewUrl(customPreviewUrl || URL.createObjectURL(fileToScan));
    setError('');
    setConfidenceScore(null);
    setWarnings([]);
    triggerOcrScan(fileToScan);
  };

  const selectMockRegistrationImage = (docNo, plate, expDate) => {
    const dummyFile = new File([''], `${docNo}_${plate}.jpg`, { type: 'image/jpeg' });
    const mockPreview = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80';
    processImageFile(dummyFile, mockPreview);
  };

  const triggerOcrScan = async (fileToScan) => {
    setScanning(true);
    setError('');
    try {
      // Gọi service OCR backend
      const result = await extensionService.scanRegistration(fileToScan);

      // Giả lập hiệu ứng quét AI 1.2s
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (result.success && result.extractedData) {
        setFormData({
          documentNumber: result.extractedData.documentNumber || '',
          licensePlate: result.extractedData.licensePlate || '',
          chassisNumber: result.extractedData.chassisNumber || '',
          engineNumber: result.extractedData.engineNumber || '',
          issueDate: result.extractedData.issueDate || '',
          expiryDate: result.extractedData.expiryDate || '',
        });
        setConfidenceScore(result.confidenceScore || 0.94);
        setWarnings(result.warnings || []);
      } else {
        setError('Không thể trích xuất dữ liệu từ tệp này.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi bóc tách Sổ Đăng Kiểm bằng AI.');
    } finally {
      setScanning(false);
    }
  };

  const handleChangeField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmApply = (e) => {
    e.preventDefault();
    if (!formData.expiryDate) {
      setError('Vui lòng kiểm tra lại Ngày hết hạn đăng kiểm');
      return;
    }
    if (onApplyData) {
      onApplyData(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white">
                Bóc tách Sổ Đăng Kiểm bằng AI OCR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động bóc tách Số quản lý, Số khung, Hạn hiệu lực và tự điền vào Form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Top upload & scan area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Image Preview & Scanner Frame */}
            <div className="md:col-span-5 relative aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center group shadow-inner">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Registration Certificate Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Bounding box simulation markers */}
                  {!scanning && confidenceScore && (
                    <div className="absolute inset-2 border-2 border-dashed border-emerald-400/70 rounded-xl pointer-events-none flex items-start justify-end p-2">
                      <span className="bg-emerald-500 text-white text-xxs font-black px-2 py-0.5 rounded shadow">
                        AI Detected
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 text-slate-400 space-y-2">
                  <span className="text-3xl block animate-bounce">📑</span>
                  <p className="text-xs font-semibold">Tải lên ảnh mặt trong Sổ Đăng Kiểm</p>
                </div>
              )}

              {/* AI Scan line animation */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-[scan_1.8s_ease-in-out_infinite] z-20"></div>
              )}

              {/* Scanning indicator overlay */}
              {scanning && (
                <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center gap-2 text-white z-10">
                  <div className="w-9 h-9 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold tracking-wide animate-pulse">AI Vision đang đọc Sổ Đăng Kiểm...</p>
                </div>
              )}
            </div>

            {/* Upload actions & Mock samples */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  1. Chọn ảnh từ máy tính hoặc điện thoại:
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Tải tệp ảnh Sổ Đăng Kiểm
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  Hoặc chọn nhanh ảnh mẫu để thử nghiệm AI OCR:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectMockRegistrationImage('KC-9876543', '30H-123.45', '2026-12-15')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-650 transition text-left"
                  >
                    🚗 Sổ Đăng Kiểm (30H-123.45)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMockRegistrationImage('KD-5544332', '59A-999.88', '2027-06-30')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-650 transition text-left"
                  >
                    🚙 Sổ Đăng Kiểm (59A-999.88)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OCR Result form & Confidence Rating */}
          {confidenceScore !== null && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/25 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      Bóc tách AI hoàn tất
                    </h4>
                    <p className="text-xxs text-emerald-600 dark:text-emerald-400">
                      Vui lòng rà soát lại thông tin bên dưới trước khi bấm "Áp dụng vào Giấy tờ Xe"
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xxs font-black bg-emerald-600 text-white shadow-sm">
                  Độ tin cậy: {Math.round(confidenceScore * 100)}%
                </span>
              </div>

              {warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{warnings.join(', ')}</span>
                </div>
              )}

              <form onSubmit={handleConfirmApply} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Số quản lý / GCN đăng kiểm:
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) => handleChangeField('documentNumber', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="VD: KC-9876543"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Biển số đăng ký:
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => handleChangeField('licensePlate', e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      placeholder="VD: 30H-123.45"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Số khung (VIN):
                    </label>
                    <input
                      type="text"
                      value={formData.chassisNumber}
                      onChange={(e) => handleChangeField('chassisNumber', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      placeholder="VD: RLHFD184000123456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Số máy:
                    </label>
                    <input
                      type="text"
                      value={formData.engineNumber}
                      onChange={(e) => handleChangeField('engineNumber', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      placeholder="VD: 1NZ-FE98765"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Ngày kiểm định / Ngày cấp:
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleChangeField('issueDate', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                      Hạn hiệu lực đăng kiểm (Bắt buộc):
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => handleChangeField('expiryDate', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-white text-xs font-black focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    ✨ Áp dụng vào Giấy tờ Xe
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-950/40 text-center animate-shake">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default RegistrationOcrModal;
