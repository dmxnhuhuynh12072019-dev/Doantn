import { useState } from 'react';

const AppointmentDetailViewModal = ({
  isOpen,
  onClose,
  appointment,
  onOpenInvoice,
  onOpenReview,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen || !appointment) return null;

  const formatVnd = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Number(amount) || 0) + ' đ';
  };

  const status = appointment.Status || 'Chờ xác nhận';
  const isCompleted = status === 'Hoàn thành';
  const licensePlate = appointment.LicensePlate || 'Chưa cập nhật';
  const carName = `${appointment.Brand || ''} ${appointment.Model || ''}`.trim() || 'Phương tiện';
  const garageName = appointment.GarageName || 'Gara đối tác ACOH';
  const apptDate = appointment.AppointmentDate
    ? new Date(appointment.AppointmentDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Chưa xác định';
  const executionDate = appointment.ExecutionDate
    ? new Date(appointment.ExecutionDate).toLocaleDateString('vi-VN')
    : apptDate;
  const odo = appointment.ExecutionOdometer || appointment.CurrentOdometer || 0;
  const totalCost = Number(appointment.TotalCost || 0);

  // Parse details string into itemized parts and technical notes
  const rawDetails = appointment.Details || appointment.Notes || '';
  let itemsList = [];
  let techNotes = '';

  if (rawDetails.includes('[Hạng mục đã thực hiện:')) {
    const matchItems = rawDetails.match(/\[Hạng mục đã thực hiện:\s*([^\]]+)\]/);
    if (matchItems && matchItems[1]) {
      itemsList = matchItems[1].split(',').map(s => s.trim()).filter(Boolean);
    }
    const matchNotes = rawDetails.match(/\[Ghi chú kỹ thuật:\s*([^\]]+)\]/);
    if (matchNotes && matchNotes[1]) {
      techNotes = matchNotes[1].trim();
    }
  }

  if (itemsList.length === 0) {
    if (rawDetails) {
      itemsList = rawDetails.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    } else {
      itemsList = [
        'Thay dầu Castrol Magnatec 10W-40 (4L)',
        'Thay lọc nhớt',
        'Vệ sinh má phanh trước & sau',
        'Kiểm tra hệ thống phanh, đèn, lốp xe',
      ];
    }
  }

  // Sample proof images
  const sampleImages = [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=60',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-2xs border border-indigo-100 dark:border-indigo-900/40">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Chi tiết dịch vụ & Sửa chữa xe
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    status === 'Hoàn thành'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : status === 'Đang sửa chữa' || status === 'Đang thực hiện'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                      : status === 'Đã cọc'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {status === 'Đã cọc' ? '💳 Đã cọc giữ chỗ' : status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mã lịch hẹn: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{appointment.AppointmentID}</span> • Ngày tiếp nhận: {apptDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Card 1: Thông tin xe & Gara thực hiện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Phương tiện */}
            <div className="bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                🚗 Phương tiện tiếp nhận
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {carName}
              </h4>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p>Biển số: <strong className="font-bold text-slate-900 dark:text-white">{licensePlate}</strong></p>
                <p>Số Odometer bàn giao: <strong className="text-indigo-600 dark:text-indigo-400">{odo.toLocaleString()} km</strong></p>
                <p>Loại phương tiện: {appointment.VehicleType || 'Ô tô con'}</p>
              </div>
            </div>

            {/* Gara Đối Tác */}
            <div className="bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                🏢 Gara thực hiện
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {garageName}
              </h4>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p>📍 Địa chỉ: {appointment.GarageAddress || 'Tứ Dân – Khoái Châu – Hưng Yên'}</p>
                <p>📞 Hotline: <strong className="text-slate-900 dark:text-white">{appointment.GaragePhone || '0945 561 535'}</strong></p>
                <p>✉️ Email: {appointment.GarageEmail || 'support@gara.vn'}</p>
              </div>
            </div>

          </div>

          {/* Card 2: Danh sách các hạng mục đã sửa chữa / làm dịch vụ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <span>🛠️ Các hạng mục dịch vụ & Phụ tùng đã làm</span>
              </h4>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                {itemsList.length} hạng mục
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-750 overflow-hidden shadow-2xs">
              {itemsList.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-750/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item}</p>
                      <p className="text-[11px] text-slate-400 font-medium">Bảo dưỡng định kỳ & kiểm định kỹ thuật</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                    <span>✓</span>
                    <span>Đã hoàn thành</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Ghi chú kỹ thuật & Đánh giá hiện trạng */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-4.5 border border-amber-200/70 dark:border-amber-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <span>📋</span>
              <span>Ghi chú kỹ thuật & Tình trạng bàn giao:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              {techNotes || appointment.Notes || 'Má phanh trước mòn ~30%, hệ thống điện và áp suất lốp bình thường. Khuyến nghị kiểm tra lốp và thay dầu định kỳ sau 5.000km tiếp theo.'}
            </p>
          </div>

          {/* Card 4: Hình ảnh minh chứng thực tế */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>📷 Hình ảnh minh chứng bảo dưỡng</span>
              <span className="text-[10px] text-slate-400 font-normal">(Nhấn vào ảnh để xem to)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {sampleImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group shadow-2xs hover:shadow-md transition"
                >
                  <img
                    src={img}
                    alt={`Proof ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    🔍 Xem ảnh
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Tổng chi phí thanh toán */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-lg">
            <div>
              <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block">
                Tổng chi phí bảo dưỡng
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Ngày hoàn tất: {executionDate}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                {formatVnd(totalCost > 0 ? totalCost : 1200000)}
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {isCompleted ? '✓ Đã thanh toán đầy đủ' : 'Thanh toán tại quầy khi nhận xe'}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cần hỗ trợ kỹ thuật? Hotline: <strong className="text-slate-700 dark:text-slate-200">{appointment.GaragePhone || '0945 561 535'}</strong>
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenInvoice) onOpenInvoice(appointment.AppointmentID);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🧾</span>
              <span>Xem & In hóa đơn</span>
            </button>

            {isCompleted && onOpenReview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReview(appointment);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 transition cursor-pointer"
              >
                ⭐ Đánh giá Gara
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged proof"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white font-bold text-xl flex items-center justify-center transition cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentDetailViewModal;
