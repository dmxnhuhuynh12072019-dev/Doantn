import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';
import carWashImg from '../../assets/car_wash.png';
import carRepairImg from '../../assets/car_repair.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carInsuranceImg from '../../assets/car_insurance.png';

const nearbyServices = [
  {
    id: 1,
    title: 'Rửa xe + hút bụi (xe 7 chỗ )',
    description: 'Rửa xe cơ bản + hút bụi (xe 7 chỗ )',
    price: '100.000đ',
    oldPrice: '120.000đ',
    discount: '-17%',
    garageName: 'XE2GO - CN Bình Dương',
    garageAddress: '559 Phạm Ngọc Thạch',
    garageTheme: 'amber',
    image: carWashImg,
  },
  {
    id: 2,
    title: 'Rửa xe + hút bụi xe 5 chỗ siêu sạch',
    description: 'Rửa xe + hút bụi xe 5 chỗ siêu sạch',
    price: '80.000đ',
    oldPrice: '100.000đ',
    discount: '-20%',
    garageName: 'XE2GO - CN Bình Dương',
    garageAddress: '559 Phạm Ngọc Thạch',
    garageTheme: 'amber',
    image: carWashImg,
  },
  {
    id: 3,
    title: 'Đăng kiểm hộ',
    description: 'Dịch vụ đăng kiểm hộ. Chúng tôi nhận xe tại nhà mang xe về xưởng d...',
    price: '800.000đ',
    oldPrice: '1.000.000đ',
    discount: '-20%',
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageTheme: 'blue',
    image: carInsuranceImg,
  },
  {
    id: 4,
    title: 'Sơn xe 7 chỗ',
    description: '🎨✨🎉 SIÊU ƯU ĐÃI SƠN XE Ô TÔ TẠI XE2GÔ 🎉',
    price: '7.000.000đ',
    oldPrice: '12.500.000đ',
    discount: '-44%',
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageTheme: 'blue',
    image: carBodyPaintImg,
  },
  {
    id: 5,
    title: 'Sơn ô tô 5 chỗ',
    description: '🎨✨🎉 SIÊU ƯU ĐÃI SƠN XE Ô TÔ TẠI XE2GÔ 🎉',
    price: '5.000.000đ',
    oldPrice: '9.500.000đ',
    discount: '-47%',
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageTheme: 'blue',
    image: carBodyPaintImg,
  },
  {
    id: 6,
    title: 'Vệ sinh kim phun',
    description: 'Vệ sinh kim phun ô tô là quy trình bảo dưỡng cần thiết, khuyến cáo thực hiện định kỳ...',
    price: '90.000đ',
    oldPrice: '100.000đ',
    discount: '-10%',
    garageName: 'VIỆN AUTO THẢO ĐIỀN',
    garageAddress: '9 đường 40',
    garageTheme: 'blue',
    image: carEngineCleaningImg,
  },
  {
    id: 7,
    title: 'Đánh xước kính lái size XL',
    description: 'Đánh xước kính lái size XL chuyên nghiệp, phục hồi độ trong và tăng tầm nhìn an toàn.',
    price: '2.000.000đ',
    oldPrice: '2.200.000đ',
    discount: '-9%',
    garageName: 'CÔNG TY TNHH TMDV KHA HOÀNG AUTO',
    garageAddress: '8 Nguyễn Thái Sơn',
    garageTheme: 'emerald',
    image: carWashImg,
  },
  {
    id: 8,
    title: 'Công tháp lắp táp lô xử lý lỗi Motor cửa gió điều hoà',
    description: 'Các bước tháo dỡ chính Quy trình thường đi từ ngoài vào trong kiểm tra mô tơ cửa gió...',
    price: '320.000đ',
    oldPrice: '380.000đ',
    discount: '-16%',
    garageName: 'GARAGE Ô TÔ TÂN BÌNH',
    garageAddress: '1073/23 CMT8, P.7, Q.Tân Bình',
    garageTheme: 'indigo',
    image: carRepairImg,
  },
];

const NewServicesSection = ({ onOpenAppointment, onSelectService, onViewAll }) => {
  return (
    <section className="py-2 sm:py-3 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dịch vụ quanh bạn
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
              Gần bạn nhất
            </span>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>Xem tất cả</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 2-Column Responsive Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {nearbyServices.map((service) => (
            <div
              key={service.id}
              onClick={() => (onSelectService ? onSelectService(service) : onOpenAppointment(service.title))}
              className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-700/80 transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              {/* Main Service Info (Top Row) */}
              <div className="flex gap-3 sm:gap-4">
                {/* Thumbnail Image + Discount Badge */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                  {service.discount && (
                    <span className="absolute top-0 left-0 bg-rose-500 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-br-lg shadow-xs z-10">
                      {service.discount}
                    </span>
                  )}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 leading-none">
                      {service.price}
                    </span>
                    {service.oldPrice && (
                      <span className="text-xs text-slate-400 line-through font-semibold leading-none">
                        {service.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Garage Partner Row (Bottom) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Garage Logo Badge */}
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 border ${
                      service.garageTheme === 'amber'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                        : service.garageTheme === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-100 dark:border-blue-900/40'
                    }`}
                  >
                    {service.garageTheme === 'amber' ? (
                      <span className="text-[9px] font-black tracking-tighter">XE2</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight truncate leading-tight">
                      {service.garageName}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                      📍 {service.garageAddress}
                    </p>
                  </div>
                </div>

                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewServicesSection;
