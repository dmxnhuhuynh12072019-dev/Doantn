import { useState, useEffect, useRef } from 'react';

const PRESET_SERVICE_ITEMS = [
  { id: 'oil_castrol', name: 'Thay dầu Castrol Magnatec 10W-40 (4L)', price: 550000 },
  { id: 'oil_filter', name: 'Thay lọc nhớt', price: 150000 },
  { id: 'brake_clean', name: 'Vệ sinh má phanh trước & sau', price: 200000 },
  { id: 'inspection', name: 'Kiểm tra hệ thống phanh, đèn, lốp xe', price: 300000 },
  { id: 'air_filter', name: 'Thay lọc gió động cơ', price: 180000 },
  { id: 'ac_filter', name: 'Thay lọc gió điều hòa', price: 220000 },
  { id: 'spark_plugs', name: 'Thay bugi Iridium (4 cái)', price: 600000 },
  { id: 'coolant', name: 'Thay nước làm mát động cơ', price: 250000 },
  { id: 'brake_fluid', name: 'Thay dầu phanh DOT4', price: 190000 },
  { id: 'wheel_alignment', name: 'Cân mâm bấm chì & đảo lốp', price: 250000 },
];

const DEFAULT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&auto=format&fit=crop&q=60',
];

const CompleteAppointmentModal = ({ isOpen, onClose, onSave, appointment }) => {
  const [odometer, setOdometer] = useState('45680');
  const [completionDate, setCompletionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedItems, setSelectedItems] = useState([
    'Thay dầu Castrol Magnatec 10W-40 (4L)',
    'Thay lọc nhớt',
    'Vệ sinh má phanh trước & sau',
    'Kiểm tra hệ thống phanh, đèn, lốp xe',
  ]);
  const [customItemInput, setCustomItemInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [techNotes, setTechNotes] = useState('Má phanh trước mòn ~30%, lốp sau cần kiểm tra sau 5.000km tới.');
  
  // Pricing states
  const [serviceCost, setServiceCost] = useState(1200000);
  const [discount, setDiscount] = useState(0);
  const [isPaid, setIsPaid] = useState(true);
  
  // Evidence Images state
  const [evidenceImages, setEvidenceImages] = useState(DEFAULT_SAMPLE_IMAGES);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize or reset when modal opens with appointment data
  useEffect(() => {
    if (isOpen && appointment) {
      const currentOdo = appointment.CurrentOdometer || 45680;
      setOdometer(currentOdo.toString());
      
      const today = new Date().toISOString().split('T')[0];
      setCompletionDate(today);

      // Preload initial service items if appointment has notes or presets
      if (appointment.Notes && appointment.Notes.length > 5) {
        setTechNotes(appointment.Notes);
      } else {
        setTechNotes('Má phanh trước mòn ~30%, lốp sau cần kiểm tra sau 5.000km tới.');
      }
      
      let initialItems = [
        'Thay dầu Castrol Magnatec 10W-40 (4L)',
        'Thay lọc nhớt',
        'Vệ sinh má phanh trước & sau',
        'Kiểm tra hệ thống phanh, đèn, lốp xe',
      ];
      const rawDetails = appointment.Details || appointment.Notes || '';
      if (rawDetails.includes('[Hạng mục đã thực hiện:')) {
        const match = rawDetails.match(/\[Hạng mục đã thực hiện:\s*([^\]]+)\]/);
        if (match && match[1]) {
          const parsed = match[1].split(',').map(s => s.trim()).filter(Boolean);
          if (parsed.length > 0) initialItems = parsed;
        }
      }
      setSelectedItems(initialItems);

      if (appointment.TotalCost && Number(appointment.TotalCost) > 0) {
        setServiceCost(Number(appointment.TotalCost));
      } else {
        const sum = initialItems.reduce((acc, item) => {
          const matched = PRESET_SERVICE_ITEMS.find(p => p.name.toLowerCase() === item.toLowerCase());
          return acc + (matched ? matched.price : 250000);
        }, 0);
        setServiceCost(sum > 0 ? sum : 1200000);
      }

      setDiscount(0);
      setIsPaid(true);
      setError('');
    }
  }, [isOpen, appointment]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (!isOpen || !appointment) return null;

  // Format Currency
  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.max(0, amount)) + ' đ';
  };

  const finalTotal = Math.max(0, serviceCost - discount);

  // Toggle or add item
  const handleAddItem = (itemName, price = 0) => {
    if (!selectedItems.includes(itemName)) {
      setSelectedItems(prev => [...prev, itemName]);
      if (price > 0) {
        setServiceCost(prev => prev + price);
      }
    }
    setIsDropdownOpen(false);
    setCustomItemInput('');
  };

  const handleRemoveItem = (itemName) => {
    setSelectedItems(prev => prev.filter(i => i !== itemName));
    const matchedPreset = PRESET_SERVICE_ITEMS.find(p => p.name === itemName);
    if (matchedPreset) {
      setServiceCost(prev => Math.max(0, prev - matchedPreset.price));
    }
  };

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (customItemInput.trim()) {
      handleAddItem(customItemInput.trim());
    }
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEvidenceImages(prev => [...prev, uploadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setEvidenceImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedOdo = parseInt(odometer.toString().replace(/,/g, ''), 10);
    if (isNaN(parsedOdo) || parsedOdo < 0) {
      setError('Số Odo lúc bàn giao không hợp lệ.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Vui lòng chọn hoặc nhập ít nhất một hạng mục dịch vụ đã thực hiện.');
      return;
    }

    if (finalTotal < 0) {
      setError('Tổng chi phí thanh toán không hợp lệ.');
      return;
    }

    setLoading(true);

    // Build rich details string
    const itemsText = selectedItems.join(', ');
    const fullDetails = `[Hạng mục đã thực hiện: ${itemsText}] - [Ghi chú kỹ thuật: ${techNotes.trim() || 'Đã kiểm tra hoàn tất'}] - [Ngày hoàn tất: ${completionDate}]`;

    const data = {
      odometer: parsedOdo,
      totalCost: finalTotal,
      details: fullDetails,
    };

    try {
      await onSave(appointment.AppointmentID, data);
      onClose();
    } catch (err) {
      setError(err.message || 'Hoàn tất bảo dưỡng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const licensePlate = appointment.LicensePlate || '49A-078.95';
  const carModel = `${appointment.Brand || 'Honda'} ${appointment.Model || 'Vios'}`.trim();
  const manufactureYear = appointment.ManufactureYear || 2019;
  const lastMaintenance = appointment.LastMaintenanceDate
    ? new Date(appointment.LastMaintenanceDate).toLocaleDateString('vi-VN')
    : '02/02/2025';
  const previousOdo = appointment.CurrentOdometer
    ? Number(appointment.CurrentOdometer).toLocaleString() + ' km'
    : '40,120 km';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Modal Box matching sample layout */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* --- 1. MODAL HEADER --- */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-2xs border border-indigo-100 dark:border-indigo-900/40">
              🛠️
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Hoàn tất bảo dưỡng xe
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xe: <span className="font-bold text-indigo-600 dark:text-indigo-400">{carModel} ({licensePlate})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
            title="Đóng"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* --- 2. STEPPER PROGRESS BAR (Matching Sample 3 Steps) --- */}
        <div className="px-6 sm:px-12 py-4 bg-slate-50/60 dark:bg-slate-850/40 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="max-w-xl mx-auto flex items-center justify-between relative">
            {/* Connecting lines */}
            <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
              <div className="h-full bg-indigo-600 w-1/2"></div>
            </div>

            {/* Step 1: Thông tin dịch vụ */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-900">
                1
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 whitespace-nowrap">
                Thông tin dịch vụ
              </span>
            </div>

            {/* Step 2: Xác nhận chi phí */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-900">
                2
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 whitespace-nowrap">
                Xác nhận chi phí
              </span>
            </div>

            {/* Step 3: Hoàn tất */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                3
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 whitespace-nowrap">
                Hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* --- 3. MODAL BODY (Scrollable 2-Column Grid) --- */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-shake">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* === LEFT COLUMN: 1. THÔNG TIN DỊCH VỤ (Span 7) === */}
            <div className="lg:col-span-7 space-y-5">
              <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wide uppercase flex items-center gap-2">
                <span>1. Thông tin dịch vụ</span>
              </h4>

              {/* Row: Số Odo & Ngày hoàn tất */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Số Odo lúc bàn giao */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Số Odo lúc bàn giao <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      placeholder="45,680"
                      required
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-2xs"
                    />
                    <span className="absolute right-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
                      km
                    </span>
                  </div>
                </div>

                {/* Ngày hoàn tất */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ngày hoàn tất <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Các hạng mục đã thực hiện (Multi-Tag Selector with Dropdown) */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Các hạng mục đã thực hiện <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer flex items-center gap-1"
                  >
                    <span>+ Thêm hạng mục</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Tags Box */}
                <div
                  onClick={() => setIsDropdownOpen(true)}
                  className="min-h-[72px] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 flex flex-wrap gap-2 items-center cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 transition shadow-2xs"
                >
                  {selectedItems.length === 0 ? (
                    <span className="text-xs text-slate-400 italic px-2">
                      Nhấn vào đây để chọn hoặc thêm các hạng mục dịch vụ...
                    </span>
                  ) : (
                    selectedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs animate-in zoom-in-95 duration-100"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item);
                          }}
                          className="w-4 h-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Items Dropdown Popover */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-30 p-3 space-y-2 animate-in fade-in duration-150">
                    <form onSubmit={handleAddCustomItem} className="flex gap-2">
                      <input
                        type="text"
                        value={customItemInput}
                        onChange={(e) => setCustomItemInput(e.target.value)}
                        placeholder="Nhập tên hạng mục mới..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Thêm
                      </button>
                    </form>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750 pt-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Gợi ý hạng mục chuẩn:</p>
                      {PRESET_SERVICE_ITEMS.map((preset) => {
                        const isSelected = selectedItems.includes(preset.name);
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              if (isSelected) handleRemoveItem(preset.name);
                              else handleAddItem(preset.name, preset.price);
                            }}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-medium'
                            }`}
                          >
                            <span>{preset.name}</span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {formatVnd(preset.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú kỹ thuật */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ghi chú kỹ thuật
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {techNotes.length}/500
                  </span>
                </div>
                <textarea
                  value={techNotes}
                  maxLength={500}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Má phanh trước mòn ~30%, lốp sau cần kiểm tra sau 5.000km tới..."
                  rows="3"
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none leading-relaxed shadow-2xs"
                ></textarea>
              </div>

              {/* Hình ảnh minh chứng (Upload & Thumbnails) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Hình ảnh minh chứng <span className="text-slate-400 font-normal">ℹ️</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  {/* Upload Drop Zone Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:col-span-1 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[90px]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <svg className="w-6 h-6 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                      Kéo thả hình ảnh
                    </span>
                    <span className="text-[9px] text-indigo-600 font-black mt-0.5">
                      Chọn ảnh
                    </span>
                  </div>

                  {/* Thumbnail Gallery Preview */}
                  <div className="sm:col-span-3 flex gap-2.5 overflow-x-auto pb-1">
                    {evidenceImages.map((imgSrc, idx) => (
                      <div key={idx} className="relative w-22 h-22 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs group">
                        <img
                          src={imgSrc}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white text-xs flex items-center justify-center transition cursor-pointer"
                          title="Xóa ảnh"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">
                  Định dạng: JPG, PNG (Tối đa 5MB/ảnh)
                </p>
              </div>
            </div>

            {/* === RIGHT COLUMN: 2. XÁC NHẬN CHI PHÍ & THÔNG TIN XE (Span 5) === */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card 1: 2. Xác nhận chi phí */}
              <div className="bg-slate-50/80 dark:bg-slate-850/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
                <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                  2. Xác nhận chi phí
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Tổng chi phí dịch vụ
                    </span>
                    <input
                      type="number"
                      value={serviceCost}
                      onChange={(e) => setServiceCost(Number(e.target.value))}
                      className="w-32 text-right px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Giảm giá
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">-</span>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-28 text-right px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-750 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tổng tiền thanh toán
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {formatVnd(finalTotal)}
                  </span>
                </div>

                {/* Paid Status Box */}
                <div
                  onClick={() => setIsPaid(!isPaid)}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition ${
                    isPaid
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <span>{isPaid ? 'ℹ️' : '⏳'}</span>
                    <span>{isPaid ? 'Đã thanh toán đầy đủ' : 'Chưa thanh toán (Thu tiền mặt)'}</span>
                  </div>
                  <span className="text-[10px] underline font-medium">Đổi</span>
                </div>
              </div>

              {/* Card 2: Thông tin xe */}
              <div className="bg-slate-50/80 dark:bg-slate-850/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Thông tin xe
                </h4>

                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-750/60">
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Biển số</span>
                    <span className="font-black px-2 py-0.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {licensePlate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Dòng xe</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{carModel}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Năm sản xuất</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{manufactureYear}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Lần bảo dưỡng gần nhất</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lastMaintenance}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Số Odo lần trước</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{previousOdo}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* --- 4. BOTTOM ACTION FOOTER BAR --- */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Green confirmation alert banner */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold w-full sm:w-auto">
              <span className="text-base">🛡️</span>
              <span className="leading-tight">
                Bằng việc hoàn tất, bạn xác nhận các thông tin trên là chính xác và dịch vụ đã được thực hiện đầy đủ.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Quay lại
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>✓</span>
                )}
                <span>Hoàn tất bảo dưỡng</span>
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default CompleteAppointmentModal;
