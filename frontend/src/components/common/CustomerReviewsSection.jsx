import customerAvatar from '../../assets/customer_avatar.png';

const CustomerReviewsSection = () => {
  return (
    <section className="relative py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800 overflow-hidden transition-colors">
      {/* World Map Dotted Pattern Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] dark:opacity-[0.08]">
        <svg className="w-full max-w-5xl h-full" fill="currentColor" viewBox="0 0 1000 500">
          {/* Simplified global continents layout for clean aesthetics */}
          <path d="M150,150 Q180,100 250,120 T350,160 Q400,200 350,280 T200,320 Z M450,220 Q520,180 580,240 T700,220 Q750,270 720,350 T500,420 Z M750,120 Q820,80 900,140 T920,260 Q850,300 800,250 Z M120,380 Q150,350 200,410 T250,440 Q180,480 140,430 Z" />
          <circle cx="100" cy="180" r="8" />
          <circle cx="180" cy="220" r="12" />
          <circle cx="280" cy="240" r="10" />
          <circle cx="320" cy="120" r="15" />
          <circle cx="520" cy="280" r="14" />
          <circle cx="620" cy="160" r="18" />
          <circle cx="680" cy="320" r="10" />
          <circle cx="820" cy="180" r="16" />
          <circle cx="880" cy="280" r="12" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase mb-8">
          Khách Hàng Nhận Xét
        </h2>

        {/* Quote Message */}
        <p className="text-sm sm:text-base md:text-lg text-slate-650 dark:text-slate-300 font-medium leading-relaxed max-w-3xl mb-8 italic">
          “Tôi thực sự hài lòng vì dịch vụ ở đây giúp tôi tiết kiệm rất nhiều thời gian. Chi phí sửa chữa & thay thế phụ tùng rất hợp lý. Nhân viên, thợ máy ở đây rất nhiệt tình, tư vấn rõ ràng, báo giá cụ thể, minh bạch”
        </p>

        {/* Customer Profile */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar Circle */}
          <div className="w-24 h-24 sm:w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 hover:scale-105 transition-transform duration-500">
            <img
              src={customerAvatar}
              alt="Khách hàng"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              Khách Hàng
            </h4>
            <p className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-450">
              24 tuổi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsSection;
