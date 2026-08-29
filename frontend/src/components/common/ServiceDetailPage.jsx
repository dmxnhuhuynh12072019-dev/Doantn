import { useEffect } from 'react';

const formatCurrency = (val) => {
  if (!val) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
};

const ServiceDetailPage = ({ service, onBack, onBookAppointment }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!service) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-28 md:pb-16 select-none">
      {/* 1. Header Bar: Unified ACOH Brand Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="!text-white text-base sm:text-lg font-black tracking-tight !m-0 !p-0 leading-tight">
              Chi tiết dịch vụ
            </h1>
            <p className="hidden sm:block text-xs text-indigo-200/90 mt-0.5 font-medium truncate max-w-md">
              {service.title}
            </p>
          </div>
        </div>

        <span className="text-xxs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-indigo-100 shrink-0">
          ACOH AutoCare
        </span>
      </div>

      {/* 2. Main Content Container: 2-column on Desktop, single column on Mobile */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (Desktop: 7 cols) -> Image & Highlights & Garage */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4">
            {/* Banner Hero Image Card */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 shadow-xs">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {service.discount && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white font-black text-xs px-3.5 py-1.5 rounded-bl-2xl shadow-md">
                  {service.discount}
                </div>
              )}
            </div>

            {/* Garage Partner Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700 p-4 sm:p-5 flex items-center justify-between hover:shadow-xs transition">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0 shadow-2xs border border-blue-100 dark:border-blue-900/40">
                  🏪
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Xưởng thực hiện
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                    {service.garageName || 'Gara Đối Tác ACOH'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    📍 {service.garageAddress || 'Hệ thống trạm dịch vụ liên kết ACOH'}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                Đang hoạt động
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs">
                <span className="text-lg">✨</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Trang thiết bị hiện đại</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs">
                <span className="text-lg">🛡️</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bảo hành uy tín</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs">
                <span className="text-lg">⏱️</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bàn giao đúng hẹn</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs">
                <span className="text-lg">💳</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Minh bạch chi phí</span>
              </div>
            </div>
          </div>

          {/* Right Column (Desktop: 5 cols) -> Pricing, Details & Desktop Booking Action */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-150 dark:border-slate-700 shadow-xs space-y-4">
              
              {/* Title & Category */}
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
                  Dịch vụ tiêu chuẩn
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-2">
                  {service.title}
                </h2>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-750/70 border border-slate-100 dark:border-slate-700/80 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Chi phí trọn gói
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      {formatCurrency(service.price)}
                    </span>
                    {service.oldPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(service.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
                {service.discount && (
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-black shadow-xs">
                    {service.discount}
                  </span>
                )}
              </div>

              {/* Short Summary */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {service.description || 'Quy trình thực hiện chuyên nghiệp bởi đội ngũ kỹ thuật viên giàu kinh nghiệm với trang thiết bị hiện đại tiêu chuẩn.'}
              </p>

              {/* Detailed Description */}
              <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 space-y-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  Mô tả chi tiết
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {service.detailedDescription ||
                    service.description ||
                    'Quy trình chăm sóc và bảo dưỡng kỹ lưỡng, sử dụng hóa chất và linh kiện chính hãng, bảo đảm độ an toàn và nâng cao tuổi thọ của phương tiện.'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dịch vụ được kiểm định nghiêm ngặt trước khi bàn giao xe, cam kết thời gian thực hiện nhanh chóng và hỗ trợ sau dịch vụ 24/7.
                </p>
              </div>

              {/* Desktop Booking Action Button */}
              <div className="hidden md:block pt-3">
                <button
                  onClick={() => onBookAppointment && onBookAppointment(service)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 active:scale-[0.99] text-white font-black text-sm lg:text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Đặt lịch hẹn ngay</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Only Bottom Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-700 px-4 sm:px-6 py-3 z-50 shadow-2xl flex items-center justify-between">
        <div className="max-w-xl w-full mx-auto flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block leading-tight">
              Giá dịch vụ
            </span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {formatCurrency(service.price)}
            </span>
          </div>

          <button
            onClick={() => onBookAppointment && onBookAppointment(service)}
            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Đặt lịch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
