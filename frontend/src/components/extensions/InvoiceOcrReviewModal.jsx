import { useState, useRef } from 'react';
import * as extensionService from '../../services/extensionService';
import * as maintenanceService from '../../services/maintenanceService';

const InvoiceOcrReviewModal = ({ isOpen, onClose, vehicleId, onSaveSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Form Extracted States
  const [garageName, setGarageName] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [executionOdometer, setExecutionOdometer] = useState(15000);
  const [items, setItems] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processInvoiceFile(selectedFile);
    }
  };

  const processInvoiceFile = (fileToScan, customPreviewUrl = null) => {
    setFile(fileToScan);
    setPreviewUrl(customPreviewUrl || URL.createObjectURL(fileToScan));
    setError('');
    setConfidenceScore(null);
    setWarnings([]);
    triggerOcrScan(fileToScan);
  };

  const selectMockInvoiceImage = (type) => {
    const dummyFile = new File([''], `${type}_invoice.jpg`, { type: 'image/jpeg' });
    const mockPreview = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
    processInvoiceFile(dummyFile, mockPreview);
  };

  const triggerOcrScan = async (fileToScan) => {
    setScanning(true);
    setError('');
    try {
      const result = await extensionService.scanInvoice(fileToScan);

      // Giả lập hiệu ứng quét AI 1.3s
      await new Promise(resolve => setTimeout(resolve, 1300));

      if (result.success && result.extractedData) {
        const data = result.extractedData;
        setGarageName(data.garageName || '');
        setExecutionDate(data.executionDate || new Date().toISOString().substring(0, 10));
        setExecutionOdometer(data.executionOdometer || 15000);
        setItems(data.items || []);
        setConfidenceScore(result.confidenceScore || 0.93);
        setWarnings(result.warnings || []);
      } else {
        setError('Không thể bóc tách dữ liệu hóa đơn này.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi bóc tách hóa đơn sửa xe bằng AI.');
    } finally {
      setScanning(false);
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems(prev => [...prev, { id: newId, item: '', cost: 0 }]);
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' đ';
  };

  const handleSubmitSave = async (e) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Vui lòng chọn phương tiện để lưu nhật ký');
      return;
    }

    if (items.length === 0) {
      setError('Cần ít nhất 1 dòng hạng mục sửa chữa/bảo dưỡng');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        vehicleId,
        garageName,
        executionDate: executionDate || new Date().toISOString().substring(0, 10),
        executionOdometer: parseInt(executionOdometer, 10) || 0,
        totalCost: calculateTotalCost(),
        items: items.map(i => ({ item: i.item, cost: Number(i.cost) || 0 })),
      };

      await maintenanceService.batchImportInvoice(payload);

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Lưu hóa đơn vào nhật ký thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-xl">
              🧾
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white">
                Số hóa Hóa đơn / Phiếu bảo dưỡng bằng AI OCR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động đọc danh sách phụ tùng, chi phí và thông tin Gara từ ảnh hóa đơn cũ
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
          {/* Top 2-Column Split View */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column 1: Image Scanner & Mock Samples */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Invoice Preview"
                      className="w-full h-full object-cover"
                    />
                    {!scanning && confidenceScore && (
                      <div className="absolute inset-2 border-2 border-dashed border-indigo-400/70 rounded-xl pointer-events-none flex items-start justify-end p-2">
                        <span className="bg-indigo-600 text-white text-xxs font-black px-2 py-0.5 rounded shadow">
                          AI Table OCR
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4 text-slate-400 space-y-2">
                    <span className="text-4xl block animate-bounce">🧾</span>
                    <p className="text-xs font-semibold">Tải lên ảnh chụp hóa đơn / phiếu sửa xe</p>
                  </div>
                )}

                {/* Scanning laser animation */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-indigo-400 shadow-[0_0_15px_#6366f1] animate-[scan_1.8s_ease-in-out_infinite] z-20"></div>
                )}

                {scanning && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-white z-10">
                    <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold tracking-wide animate-pulse">AI OCR đang trích xuất bảng giá...</p>
                  </div>
                )}
              </div>

              {/* Upload actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Chọn ảnh hóa đơn từ máy
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="pt-2">
                  <span className="text-xxs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Ảnh hóa đơn mẫu thử nghiệm nhanh:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectMockInvoiceImage('full')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-xxs font-semibold border border-slate-200 dark:border-slate-650 transition text-left"
                    >
                      🚗 Hóa đơn Bảo dưỡng tổng hợp (1.130.000đ)
                    </button>
                    <button
                      type="button"
                      onClick={() => selectMockInvoiceImage('oil')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 rounded-xl text-xxs font-semibold border border-slate-200 dark:border-slate-650 transition text-left"
                    >
                      🚙 Phiếu thay dầu máy & lọc dầu (700.000đ)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Extracted Information & Editable Table */}
            <div className="md:col-span-7 space-y-4">
              {confidenceScore !== null && (
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <div>
                      <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                        Trích xuất bảng hóa đơn hoàn tất
                      </h4>
                      <p className="text-xxs text-indigo-700 dark:text-indigo-400">
                        Bạn có thể chỉnh sửa lại tên dịch vụ & chi phí bên dưới
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xxs font-black bg-indigo-600 text-white shadow-sm">
                    AI Rating: {Math.round(confidenceScore * 100)}%
                  </span>
                </div>
              )}

              {/* Form Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <div className="sm:col-span-3">
                  <label className="block text-xxs font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Tên Gara thực hiện:
                  </label>
                  <input
                    type="text"
                    value={garageName}
                    onChange={(e) => setGarageName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: Gara Ô Tô AutoCare Service"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Ngày thực hiện:
                  </label>
                  <input
                    type="date"
                    value={executionDate}
                    onChange={(e) => setExecutionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xxs font-black uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Số Odometer bàn giao (km):
                  </label>
                  <input
                    type="number"
                    value={executionOdometer}
                    onChange={(e) => setExecutionOdometer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: 15000"
                  />
                </div>
              </div>

              {/* Editable Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Danh sách hạng mục & Chi phí (Editable Table):
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xxs font-bold transition flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                  >
                    + Thêm dòng
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-350 font-bold uppercase text-xxs">
                      <tr>
                        <th className="p-3">Hạng mục / Phụ tùng / Dịch vụ</th>
                        <th className="p-3 w-36 text-right">Chi phí (VND)</th>
                        <th className="p-3 w-10 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-750 bg-white dark:bg-slate-800">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-slate-400 text-xs">
                            Chưa có hạng mục nào. Bấm "Tải tệp ảnh" hoặc "Thêm dòng" để bắt đầu.
                          </td>
                        </tr>
                      ) : (
                        items.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.item}
                                onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Nhập tên phụ tùng/công làm..."
                              />
                            </td>
                            <td className="p-2 text-right">
                              <input
                                type="number"
                                value={row.cost}
                                onChange={(e) => handleItemChange(row.id, 'cost', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(row.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Xóa dòng này"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-indigo-50/50 dark:bg-indigo-950/20 font-black text-xs">
                      <tr>
                        <td className="p-3 text-slate-700 dark:text-slate-300">TỔNG CỘNG THANH TOÁN:</td>
                        <td className="p-3 text-right text-indigo-600 dark:text-indigo-400 text-sm">
                          {formatCurrency(calculateTotalCost())}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={saving || items.length === 0}
                  onClick={handleSubmitSave}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  ✨ Xác nhận lưu vào Nhật ký bảo dưỡng
                </button>
              </div>
            </div>
          </div>

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

export default InvoiceOcrReviewModal;
