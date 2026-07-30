import React, { useState, useEffect } from 'react';
import { getMaintenanceCategories, saveMatrixChecklist } from '../../services/maintenanceService';

export default function PresetOdometerChecklist({ vehicle, isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [odometer, setOdometer] = useState(vehicle?.currentOdometer || 0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && vehicle) {
      setOdometer(vehicle.currentOdometer || 0);
      setNotes('');
      setError('');
      fetchCategories();
    }
  }, [isOpen, vehicle]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceCategories(vehicle?.vehicleType || 'Ô tô');
      setCategories(data);
      if (data.length > 0) {
        // Auto select the first category or nearest category matching current odometer
        const nearest = data.find(c => c.targetOdometer >= (vehicle?.currentOdometer || 0)) || data[0];
        handleSelectCategory(nearest);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải bộ khung mốc bảo dưỡng');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    // Pre-select items for this category
    const defaultIds = cat.items.map(i => i.itemId);
    setSelectedItemIds(defaultIds);
    if (cat.targetOdometer) {
      setOdometer(Math.max(vehicle?.currentOdometer || 0, cat.targetOdometer));
    }
  };

  const handleToggleItem = (itemId) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      setError('Vui lòng chọn ít nhất một hạng mục bảo dưỡng!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await saveMatrixChecklist({
        vehicleId: vehicle.vehicleID,
        odometer: Number(odometer),
        selectedItemIds,
        notes,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Lưu bảo dưỡng theo mốc km thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 relative">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              🛠️ Chuẩn hóa Khung Bảo Dưỡng Theo Mốc Km
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Phương tiện: <span className="text-blue-400 font-medium">{vehicle?.brand} {vehicle?.model} ({vehicle?.licensePlate})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl font-semibold leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 text-red-300 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse">
            Đang tải bộ khung bảo dưỡng chuẩn hóa...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Odometer & Milestone selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                1. Chọn Mốc Kilomet Bảo Dưỡng Chuẩn:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.categoryId === cat.categoryId;
                  return (
                    <button
                      key={cat.categoryId}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-md shadow-blue-900/20'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">{cat.targetOdometer.toLocaleString()} km</div>
                      <div className="text-[11px] text-slate-400 truncate">{cat.categoryName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Odometer input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Số Km Ghi Nhận Thực Tế (Odometer):
                </label>
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  min={0}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Mô Tả Cấp Bảo Dưỡng:
                </label>
                <div className="px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 truncate">
                  {selectedCategory?.description || 'Kiểm tra bảo dưỡng định kỳ'}
                </div>
              </div>
            </div>

            {/* Checklist of Maintenance Items */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                2. Tích Chọn Hạng Mục Thực Hiện:
              </label>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5 max-h-56 overflow-y-auto">
                {selectedCategory?.items?.length > 0 ? (
                  selectedCategory.items.map((item) => {
                    const checked = selectedItemIds.includes(item.itemId);
                    return (
                      <label
                        key={item.itemId}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? 'bg-blue-950/40 border-blue-800/80 text-slate-200'
                            : 'bg-slate-900/30 border-slate-800/50 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleItem(item.itemId)}
                          className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 text-xs">
                          <div className="font-semibold text-slate-200 flex items-center justify-between">
                            <span>{item.itemName}</span>
                            {item.isRequired && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                                Bắt buộc
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Chưa có hạng mục chi tiết cho mốc này.</p>
                )}
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                3. Ghi Chú Bảo Dưỡng Thêm:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Đã kiểm tra van, cảm biến oxy, sục rửa bình xăng mốc 75k km..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50"
              >
                {submitting ? 'Đang Lưu...' : '✓ Xác Nhận & Lưu Nhật Ký'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
