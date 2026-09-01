import { useState, useEffect } from 'react';
import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import carInsuranceImg from '../../assets/car_insurance.png';
import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';
import aboutWorkshopImg from '../../assets/about_workshop.png';
import newsTipsImg from '../../assets/news_driving_tips.png';
import newsUsedCarImg from '../../assets/news_used_car.png';

const serviceCategories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'maintenance', label: 'Bảo Dưỡng' },
  { id: 'care', label: 'Chăm Sóc' },
  { id: 'wash', label: 'Rửa xe' },
  { id: 'repair', label: 'Sửa chữa' },
  { id: 'paint', label: 'Đồng sơn' },
];

const allServicesData = [
  {
    id: 1,
    title: 'Sơn xe 7 chỗ',
    discount: '-44%',
    description: '🎨✨🎉 SIÊU ƯU ĐÃI SƠN XE Ô TÔ TẠI XE2GÔ 🎉',
    price: 7000000,
    oldPrice: 12500000,
    category: 'paint',
    image: carBodyPaintImg,
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageLogoText: 'TOÀN PHÚC',
    garageLogoBg: 'bg-teal-600',
  },
  {
    id: 2,
    title: 'Sơn ô tô 5 chỗ',
    discount: '-47%',
    description: '🎨✨🎉 SIÊU ƯU ĐÃI SƠN XE Ô TÔ TẠI XE2GÔ 🎉',
    price: 5000000,
    oldPrice: 9500000,
    category: 'paint',
    image: carBodyPaintImg,
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageLogoText: 'TOÀN PHÚC',
    garageLogoBg: 'bg-teal-600',
  },
  {
    id: 3,
    title: 'Rửa xe 7 chỗ',
    discount: '-17%',
    description: 'Rửa xe và hút bụi',
    price: 100000,
    oldPrice: 120000,
    category: 'wash',
    image: carWashImg,
    garageName: 'GARA Ô TÔ TOÀN PHÚC',
    garageAddress: '660 Phạm Ngọc Thạch, Bình Dương',
    garageLogoText: 'TOÀN PHÚC',
    garageLogoBg: 'bg-teal-600',
  },
  {
    id: 4,
    title: 'Công tháp lắp táp lô xử lý lỗi Motor cửa gió điều hoà',
    discount: '-16%',
    description: 'Các bước tháo dỡ chính... Quy trình thường đi từ ngoài vào trong...',
    price: 320000,
    oldPrice: 380000,
    category: 'repair',
    image: carRepairImg,
    garageName: 'VIỆN AUTO THẢO ĐIỀN',
    garageAddress: '9 đường 40',
    garageLogoText: 'VIEN AUTO',
    garageLogoBg: 'bg-blue-800',
  },
  {
    id: 5,
    title: 'Rửa xe + hút bụi (xe 7 chỗ )',
    discount: '-17%',
    description: 'Rửa xe cơ bản + hút bụi (xe 7 chỗ )',
    price: 100000,
    oldPrice: 120000,
    category: 'wash',
    image: carWashImg,
    garageName: 'XE2GO - CN Bình Dương',
    garageAddress: '559 Phạm Ngọc Thạch',
    garageLogoText: 'XE2GO',
    garageLogoBg: 'bg-amber-500',
  },
  {
    id: 6,
    title: 'Rửa xe + hút bụi xe 5 chỗ siêu sạch',
    discount: '-20%',
    description: 'Rửa xe + hút bụi xe 5 chỗ siêu sạch',
    price: 80000,
    oldPrice: 100000,
    category: 'wash',
    image: carWashImg,
    garageName: 'XE2GO - CN Bình Dương',
    garageAddress: '559 Phạm Ngọc Thạch',
    garageLogoText: 'XE2GO',
    garageLogoBg: 'bg-amber-500',
  },
  {
    id: 7,
    title: 'Vệ sinh kim phun',
    discount: '-10%',
    description: 'Vệ sinh kim phun ô tô là quy trình bảo dưỡng cần thiết, khuyến cáo định kỳ',
    price: 90000,
    oldPrice: 100000,
    category: 'maintenance',
    image: carEngineCleaningImg,
    garageName: 'VIỆN AUTO THẢO ĐIỀN',
    garageAddress: '9 đường 40',
    garageLogoText: 'VIEN AUTO',
    garageLogoBg: 'bg-blue-800',
  },
  {
    id: 8,
    title: 'Đánh xước kính lái size XL',
    discount: '-9%',
    description: 'Đánh xước kính lái size XL bảo vệ bề mặt chống lóa ban đêm',
    price: 2000000,
    oldPrice: 2200000,
    category: 'care',
    image: aboutWorkshopImg,
    garageName: 'CÔNG TY TNHH TMDV KHA HOÀNG AUTO',
    garageAddress: '8 Nguyễn Thái Sơn',
    garageLogoText: 'KHA HOANG',
    garageLogoBg: 'bg-emerald-600',
  },
  {
    id: 9,
    title: 'Đăng kiểm hộ & giao nhận xe tận nơi',
    discount: '-15%',
    description: 'Hỗ trợ chuẩn bị hồ sơ, kiểm định kỹ thuật và giao nhận xe tận nhà an tâm tuyệt đối',
    price: 350000,
    oldPrice: 400000,
    category: 'maintenance',
    image: carInsuranceImg,
    garageName: 'CÔNG TY TNHH TMDV KHA HOÀNG AUTO',
    garageAddress: '8 Nguyễn Thái Sơn',
    garageLogoText: 'KHA HOANG',
    garageLogoBg: 'bg-emerald-600',
  },
  {
    id: 10,
    title: 'Kiểm tra & Vệ sinh phanh thắng 4 bánh',
    discount: '-12%',
    description: 'Vệ sinh đĩa phanh, tra mỡ ắc thắng và kiểm tra độ mòn má phanh an toàn',
    price: 220000,
    oldPrice: 250000,
    category: 'maintenance',
    image: newsTipsImg,
    garageName: 'VIỆN AUTO THẢO ĐIỀN',
    garageAddress: '9 đường 40',
    garageLogoText: 'VIEN AUTO',
    garageLogoBg: 'bg-blue-800',
  },
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
};

const ServicesPageSection = ({ onOpenAppointment, onSelectService, onBack, selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price_asc', 'price_desc', 'discount'
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Filter and sort services
  const filteredServices = allServicesData
    .filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.garageName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'discount') {
        const discA = parseInt(a.discount || '0', 10);
        const discB = parseInt(b.discount || '0', 10);
        return discA - discB; // larger negative discount first
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-24 select-none">
      {/* 1. Header Bar: Unified ACOH Brand Gradient Header (1 Kiểu Đồng Bộ) */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between border-b border-indigo-950/40">
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
              Dịch vụ bảo dưỡng & Chăm sóc xe
            </h1>
            <p className="hidden sm:block text-xs text-indigo-200/90 mt-0.5 font-medium">
              Đặt hẹn nhanh chóng tại các trạm Gara đối tác uy tín với mức giá minh bạch
            </p>
          </div>
        </div>

        <span className="text-xxs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-indigo-100 shrink-0">
          ACOH AutoCare
        </span>
      </div>

      {/* 2. Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box & Filter Button Row */}
          <div className="flex items-center gap-2.5 w-full md:w-auto md:min-w-[340px] lg:min-w-[420px]">
            {/* Filter Button (Visible on mobile, optional drawer on desktop) */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-slate-200/60 dark:border-slate-600 cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Lọc</span>
            </button>

            {/* Search Input Box */}
            <div className="flex-1 flex items-center bg-slate-100/90 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition">
              <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm tên dịch vụ, Gara, từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills & Desktop Sort */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 overflow-x-auto no-scrollbar pt-0.5 md:pt-0">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {serviceCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="discount">Ưu đãi cao</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Service Cards Container: Responsive max-w-7xl with Grid on Desktop & List on Mobile */}
      <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Results summary header (Desktop only) */}
        <div className="hidden md:flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-750">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hiển thị <span className="text-indigo-600 dark:text-indigo-400 font-black">{filteredServices.length}</span> dịch vụ phù hợp
            </span>
            {activeCategory !== 'all' && (
              <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {serviceCategories.find(c => c.id === activeCategory)?.label}
              </span>
            )}
          </div>
          {searchQuery && (
            <span className="text-xs text-slate-400">
              Từ khóa: "{searchQuery}"
            </span>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-8 shadow-2xs max-w-lg mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white mb-1">
              Không tìm thấy dịch vụ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục "Tất cả".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => (onSelectService ? onSelectService(service) : onOpenAppointment(service.title))}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
              >
                {/* Top Section: Responsive Mobile (Horizontal) & Desktop (Vertical Banner) */}
                <div className="flex md:flex-col gap-3.5 sm:gap-4 items-start">
                  
                  {/* Thumbnail Image */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-full md:h-44 md:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-100 dark:border-slate-700">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {service.discount && (
                      <div className="absolute top-0 left-0 bg-rose-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-br-xl shadow-xs z-10">
                        {service.discount}
                      </div>
                    )}
                    {/* Category tag on desktop banner */}
                    <div className="hidden md:block absolute top-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {serviceCategories.find(c => c.id === service.category)?.label || 'Dịch vụ'}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 min-w-0 space-y-1.5 md:w-full">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-400 leading-snug line-clamp-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm sm:text-base md:text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                        {formatCurrency(service.price)}
                      </span>
                      {service.oldPrice && (
                        <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through">
                          {formatCurrency(service.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Garage Partner Strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Garage Logo Badge */}
                    <div className={`w-8 h-8 rounded-xl ${service.garageLogoBg} text-white flex items-center justify-center font-black text-[10px] uppercase tracking-tighter shrink-0 shadow-2xs`}>
                      {service.garageLogoText.split(' ')[0]}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {service.garageName}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        📍 {service.garageAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="hidden lg:inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      Đặt lịch
                    </span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet / Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowFilterDrawer(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Bộ lọc dịch vụ
              </h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sắp xếp theo giá */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider">
                Sắp xếp theo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'default', label: 'Mặc định' },
                  { id: 'discount', label: 'Khuyến mãi cao' },
                  { id: 'price_asc', label: 'Giá tăng dần' },
                  { id: 'price_desc', label: 'Giá giảm dần' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-left ${
                      sortBy === s.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => {
                  setSortBy('default');
                  setActiveCategory('all');
                  setSearchQuery('');
                  setShowFilterDrawer(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPageSection;
