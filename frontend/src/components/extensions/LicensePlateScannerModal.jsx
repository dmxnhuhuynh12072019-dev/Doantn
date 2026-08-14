import { useState, useRef } from 'react';
import * as extensionService from '../../services/extensionService';

const LicensePlateScannerModal = ({ isOpen, onClose, onSearchSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedPlate, setScannedPlate] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
      setScannedPlate('');
      // Tự động kích hoạt quét khi người dùng chọn ảnh
      triggerOcrScan(selectedFile);
    }
  };

  const selectMockImage = (plate) => {
    // Giả lập chọn một ảnh có tên tương ứng biển số
    const dummyFile = new File([''], `${plate}.jpg`, { type: 'image/jpeg' });
    setFile(dummyFile);
    setPreviewUrl(
      plate === '30E-922.91'
        ? 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80' // Mercedes car photo
        : plate === '59A-123.45'
        ? 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=500&auto=format&fit=crop&q=60' // Mock car image
        : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60' // Mock bike image
    );
    setError('');
    setScannedPlate('');
    triggerOcrScan(dummyFile);
  };

  const triggerOcrScan = async (fileToScan) => {
    setScanning(true);
    setError('');
    try {
      // Gọi service OCR backend
      const result = await extensionService.scanPlate(fileToScan);
      
      // Giả lập thời gian xử lý AI trong 1.5 giây để tăng trải nghiệm UX trực quan
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setScannedPlate(result.licensePlate);
    } catch (err) {
      setError(err.message || 'Lỗi nhận diện biển số xe. Vui lòng thử lại.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmitSearch = async (e) => {
    e.preventDefault();
    if (!scannedPlate.trim()) return;

    setScanning(true);
    setError('');

    try {
      // Gửi file giả lập hoặc thực tế lên server để lấy đầy đủ thông tin xe & lịch sử
      const finalFile = file || new File([''], `${scannedPlate.trim()}.jpg`, { type: 'image/jpeg' });
      const result = await extensionService.scanPlate(finalFile);
      
      if (result.vehicleProfile) {
        onSearchSuccess(result.vehicleProfile);
        onClose();
      } else {
        setError(result.message || 'Không tìm thấy xe này trong hệ thống.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi tìm kiếm phương tiện.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            📸 Quét biển số xe bằng AI (OCR)
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Giao diện quét / camera */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Plate Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-3">
                <span className="text-4xl block animate-bounce">📷</span>
                <p className="text-xs font-semibold">Bấm nút bên dưới để chụp ảnh hoặc tải ảnh biển số xe lên</p>
              </div>
            )}

            {/* AI Scanning overlay line */}
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_ease-in-out_infinite] z-20"></div>
            )}

            {/* Giao diện trạng thái đang nhận diện */}
            {scanning && (
              <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center gap-3 text-white z-10">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold tracking-wide animate-pulse">Trí tuệ nhân tạo (OCR) đang phân tích ảnh...</p>
              </div>
            )}

            {/* Flash button overlay */}
            <button
              type="button"
              onClick={() => setFlashOn(!flashOn)}
              className={`absolute top-4 right-4 p-2 rounded-xl text-xs font-black shadow-md border cursor-pointer z-10 transition ${
                flashOn 
                  ? 'bg-amber-500 border-amber-400 text-white shadow-amber-500/20' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-350'
              }`}
            >
              ⚡ Flash: {flashOn ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          {/* Các nút hành động tải ảnh */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              📤 Chọn ảnh từ máy
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Ảnh mẫu giả lập test nhanh */}
            <button
              type="button"
              onClick={() => selectMockImage('30E-922.91')}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
            >
              🚗 Dùng thử Mercedes (30E-922.91)
            </button>
            <button
              type="button"
              onClick={() => selectMockImage('69D1-666.66')}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
            >
              🏍️ Dùng thử Xe máy (69D1-666.66)
            </button>
            <button
              type="button"
              onClick={() => selectMockImage('59A-123.45')}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            >
              🚗 Dùng thử Ô tô (59A-123.45)
            </button>
            <button
              type="button"
              onClick={() => selectMockImage('59B-678.90')}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            >
              🏍️ Dùng thử Xe máy (59B-678.90)
            </button>
          </div>

          {/* Form kết quả nhận diện và tìm kiếm */}
          {scannedPlate && (
            <form onSubmit={handleSubmitSearch} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-450 uppercase block">
                  Biển số xe nhận diện được (cho phép sửa lại nếu mờ/sai lệch):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={scannedPlate}
                    onChange={(e) => setScannedPlate(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black tracking-wider text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Nhập biển số xe..."
                  />
                  <button
                    type="submit"
                    disabled={scanning}
                    className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    🔍 Tra cứu
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-950/40 text-center animate-shake">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* CSS Keyframes for Scan animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LicensePlateScannerModal;
