import { useState, useRef, useEffect } from 'react';
import * as extensionService from '../../services/extensionService';

const LicensePlateScannerModal = ({ isOpen, onClose, onSearchSuccess }) => {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedPlate, setScannedPlate] = useState('');
  const [error, setError] = useState('');
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera when modal closes or unmounts
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setError('');
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Lỗi mở camera:', err);
      setIsCameraActive(false);
      setError('Không thể mở Camera/WebCam trên thiết bị. Vui lòng cấp quyền truy cập hoặc tải tệp ảnh từ máy.');
    }
  };

  useEffect(() => {
    if (isOpen && activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode]);

  if (!isOpen) return null;

  // Chụp ảnh từ Camera WebCam
  const captureCameraSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Không thể chụp hình từ camera.');
          return;
        }
        const capturedFile = new File([blob], `webcam_car_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(capturedFile);
        setFile(capturedFile);
        setPreviewUrl(url);
        stopCamera();
        triggerOcrScan(capturedFile);
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError('');
      setScannedPlate('');
      triggerOcrScan(selectedFile);
    }
  };

  const triggerOcrScan = async (fileToScan) => {
    setScanning(true);
    setError('');
    setScannedPlate('');
    try {
      const result = await extensionService.scanPlate(fileToScan);
      if (result && result.licensePlate) {
        setScannedPlate(result.licensePlate.toUpperCase());
        if (result.vehicleProfile) {
          // If profile found directly
        }
      } else {
        setError(result?.message || 'Không tự động nhận diện được biển số từ ảnh. Vui lòng nhập biển số thủ công bên dưới.');
      }
    } catch (err) {
      console.error('Lỗi AI OCR scanPlate:', err);
      setError('Lỗi kết nối dịch vụ AI OCR. Vui lòng nhập biển số ô tô thủ công.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmitSearch = async (e) => {
    e.preventDefault();
    if (!scannedPlate.trim()) {
      setError('Vui lòng nhập biển số ô tô trước khi tra cứu.');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const finalFile = file || new File([''], `${scannedPlate.trim()}.jpg`, { type: 'image/jpeg' });
      const result = await extensionService.scanPlate(finalFile);

      if (result && result.vehicleProfile) {
        onSearchSuccess(result.vehicleProfile);
        onClose();
      } else {
        // Safe creation for new vehicle profile
        onSearchSuccess({
          vehicleId: null,
          licensePlate: scannedPlate.trim().toUpperCase(),
          vehicleType: 'Ô tô',
          brand: 'Ô tô',
          model: 'Chưa cập nhật model',
          manufactureYear: new Date().getFullYear(),
          customerName: 'Chủ xe (Chờ định danh)',
          customerPhone: '',
        });
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Lỗi tra cứu phương tiện.');
    } finally {
      setScanning(false);
    }
  };

  const handleRetake = () => {
    setFile(null);
    setPreviewUrl(null);
    setScannedPlate('');
    setError('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              📸 Quét & Nhận diện Biển số Xe (AI OCR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Sử dụng WebCam trực tiếp hoặc tải tệp ảnh xe để nhận diện tự động
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveMode('camera');
              handleRetake();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            📷 Chụp qua WebCam / Camera
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('upload');
              stopCamera();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            📤 Tải ảnh từ máy tính
          </button>
        </div>

        <div className="space-y-5">
          {/* CAMERA MODE VIEW */}
          {activeMode === 'camera' && !previewUrl && (
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive && (
                <div className="text-center p-6 text-slate-400 space-y-3">
                  <span className="text-4xl block">📹</span>
                  <p className="text-xs font-semibold">Đang kết nối Camera / WebCam...</p>
                </div>
              )}

              {/* Camera Controls Overlay */}
              {isCameraActive && (
                <>
                  <div className="absolute inset-0 border-2 border-dashed border-indigo-400/40 pointer-events-none rounded-2xl flex items-center justify-center">
                    <div className="w-3/4 h-1/2 border-2 border-indigo-400 rounded-xl relative">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xxs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Căn biển số xe vào đây
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10 px-4">
                    <button
                      type="button"
                      onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                      className="p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700 transition cursor-pointer text-xs"
                      title="Đổi camera trước/sau"
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      onClick={captureCameraSnapshot}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-indigo-500/30 transition cursor-pointer flex items-center gap-2"
                    >
                      📸 Chụp ảnh biển số xe
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* UPLOAD MODE VIEW OR PREVIEW */}
          {(activeMode === 'upload' || previewUrl) && (
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center group">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Plate Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer z-20"
                  >
                    🔄 Chụp / Chọn lại
                  </button>
                </>
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-4">
                  <span className="text-5xl block animate-bounce">📤</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-300">Tải ảnh chụp biển số xe (Ô tô / Xe máy) rõ ràng</p>
                    <p className="text-xxs text-slate-500">Hỗ trợ các định dạng JPG, PNG, WEBP</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer inline-flex items-center gap-2"
                  >
                    📁 Chọn tệp ảnh từ máy
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              {/* AI Scanning overlay line */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_ease-in-out_infinite] z-20" />
              )}

              {/* Giao diện trạng thái đang nhận diện */}
              {scanning && (
                <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center gap-3 text-white z-10">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold tracking-wide animate-pulse">AI OCR đang bóc tách biển số xe thực tế...</p>
                </div>
              )}
            </div>
          )}

          {/* Form kết quả nhận diện và tìm kiếm */}
          <form onSubmit={handleSubmitSearch} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase block flex items-center justify-between">
                <span>Biển số xe bóc tách được (Có thể tự chỉnh sửa):</span>
                {scannedPlate && <span className="text-emerald-500 text-xxs font-bold">✓ Bóc tách thành công</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={scannedPlate}
                  onChange={(e) => setScannedPlate(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black tracking-wider text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Ví dụ: 69-D1 666.66, 30G-567.89..."
                />
                <button
                  type="submit"
                  disabled={scanning || !scannedPlate.trim()}
                  className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  🔍 Tra cứu Hồ sơ
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center">
              💡 {error}
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
      `}</style>
    </div>
  );
};

export default LicensePlateScannerModal;
