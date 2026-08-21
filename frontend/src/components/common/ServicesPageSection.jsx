import { useState, useEffect } from 'react';
import aboutBannerBg from '../../assets/about_banner_bg.png';
import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import carInsuranceImg from '../../assets/car_insurance.png';
import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';
import aboutWorkshopImg from '../../assets/about_workshop.png';
import newsTipsImg from '../../assets/news_driving_tips.png';
import newsSmallCarsImg from '../../assets/news_small_cars.png';
import newsUsedCarImg from '../../assets/news_used_car.png';

const serviceCategories = [
  { id: 'all', label: 'TẤT CẢ DỊCH VỤ' },
  { id: 'maintenance', label: 'Bảo dưỡng -Sửa chữa' },
  { id: 'care', label: 'Chăm sóc – Trang trí nội ngoại thất' },
  { id: 'paint', label: 'Làm đồng – Sơn màu – Dặm vá' },
];

const initialServices = [
  // Page 1 Services
  {
    id: 1,
    title: 'Bảo hiểm Ôtô',
    category: 'maintenance',
    snippet: 'Phạm vi bảo vệ toàn diện, chi phí hợp lý và dịch vụ giải quyết nhanh chóng giúp bạn an tâm trên mọi chặng đường.',
    image: carInsuranceImg,
    date: '28 Th1',
  },
  {
    id: 2,
    title: 'Dịch vụ đồng sơn',
    category: 'paint',
    snippet: 'Tiếp Nhận Xe khi tiếp nhận xe, cần kiểm tra kỹ bề mặt, vệ sinh sạch sẽ và phục hồi nguyên trạng sơn nguyên bản.',
    image: carBodyPaintImg,
    date: '28 Th1',
  },
  {
    id: 3,
    title: 'Bảo dưỡng, sửa chữa xe ô tô',
    category: 'maintenance',
    snippet: 'Điền đầy đủ thông tin về xe của khách hàng, thông tin liên lạc, lịch hẹn định kỳ giúp tối ưu hiệu năng vận hành.',
    image: carRepairImg,
    date: '28 Th1',
  },
  {
    id: 4,
    title: 'Dịch vụ rửa xe hơi ô tô',
    category: 'care',
    snippet: 'Làm sạch toàn diện ngoại thất và nội thất bằng công nghệ rửa xe hiện đại, hóa chất an toàn và sấy khô chuyên nghiệp.',
    image: carWashImg,
    date: '28 Th1',
  },
  {
    id: 5,
    title: 'Dịch vụ vệ sinh khoang máy',
    category: 'care',
    snippet: 'Làm sạch bụi bẩn, dầu mỡ bám trên động cơ bằng luồng hơi nước nóng áp lực cao, giúp động cơ tản nhiệt tốt hơn.',
    image: carEngineCleaningImg,
    date: '25 Th1',
  },
  {
    id: 6,
    title: 'Chăm sóc ngoại thất ô tô',
    category: 'care',
    snippet: 'Đánh bóng, hiệu chỉnh sơn xe, phủ Ceramic bảo vệ bề mặt sơn luôn sáng bóng như mới và kháng bụi bẩn tối đa.',
    image: aboutWorkshopImg,
    date: '25 Th1',
  },
  // Page 2 Services (New added items matching sample image)
  {
    id: 7,
    title: 'Dịch vụ sơn, dặm, toàn thân xe',
    category: 'paint',
    snippet: 'Cũng như Đồng, thợ sơn của chúng tôi sẽ làm hài lòng những khách hàng kỹ tính nhất với phòng sơn sấy hiện đại tiêu chuẩn.',
    image: carBodyPaintImg,
    date: '25 Th1',
  },
  {
    id: 8,
    title: 'QUY TRÌNH SƠN SỬA CHỮA Ô TÔ',
    category: 'paint',
    snippet: 'Tiếp Nhận Xe Khi tiếp nhận xe, anh em thợ sơn cần kiểm tra kỹ bề mặt, chuẩn bị bề mặt và pha màu sơn vi tính chuẩn xác.',
    image: carRepairImg,
    date: '25 Th1',
  },
  {
    id: 9,
    title: 'Dịch vụ vệ sinh hệ thống phanh thắng',
    category: 'maintenance',
    snippet: 'Nếu Quý khách kiểm tra hệ thống phanh/thắng quá lâu đối với kỳ thay, hãy tiến hành vệ sinh đĩa phanh và má phanh ngay.',
    image: carEngineCleaningImg,
    date: '25 Th1',
  },
  {
    id: 10,
    title: 'Kiểm tra lốp',
    category: 'maintenance',
    snippet: 'Lốp cũng như những đôi giày để mềm êm ái. Nếu chúng ta đi ngàn km mà không kiểm tra áp suất hay độ mòn lốp sẽ rất nguy hiểm.',
    image: newsTipsImg,
    date: '25 Th1',
  },
  {
    id: 11,
    title: 'Kiểm tra bình điện ắc-quy',
    category: 'maintenance',
    snippet: 'Kiểm tra ắc-quy Dàn giải trí âm thanh-hình ảnh, hay bộ đài radio sẽ không thể khởi động nếu bình điện hết điện cực đột ngột.',
    image: newsSmallCarsImg,
    date: '25 Th1',
  },
  {
    id: 12,
    title: 'Quy trình bảo dưỡng xe ô tô',
    category: 'maintenance',
    snippet: 'Quy trình bảo dưỡng xe ô tô vô cùng cần thiết để bảo đảm chiếc xe của bạn luôn vận hành trơn tru và kéo dài tuổi thọ.',
    image: newsUsedCarImg,
    date: '25 Th1',
  },
];

const ITEMS_PER_PAGE = 6;

const ServicesPageSection = ({ onOpenAppointment, selectedCategory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    } else {
      setActiveCategory('all');
    }
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);
  
  // Filter services based on search & category
  const filteredServices = initialServices.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

  const displayedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section id="services" className="bg-white dark:bg-slate-900 transition-colors pb-16">
      
      {/* Top Banner */}
      <div
        className="relative w-full h-56 sm:h-64 md:h-72 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${aboutBannerBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black !text-white tracking-widest uppercase">
            Dịch Vụ
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm font-semibold tracking-wide">
            <a href="/user/dashboard" className="!text-zinc-300 hover:!text-white transition">
              TRANG CHỦ
            </a>
            <span className="!text-zinc-500">/</span>
            <span className="!text-indigo-400">DỊCH VỤ</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sidebar (Search & Recent Services List) */}
          <div className="space-y-8">
            
            {/* Service Categories Widget */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/60 pb-2">
                Danh mục dịch vụ
              </h4>
              <div className="flex flex-col space-y-1.5">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {activeCategory === cat.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/60 pb-2">
                Tìm kiếm dịch vụ
              </h4>
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <span className="text-slate-400 shrink-0 text-sm">🔍</span>
              </div>
            </div>

            {/* Recent Services List widget */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/60 pb-2">
                Bài viết mới
              </h4>
              <ul className="space-y-4">
                {initialServices.slice(0, 5).map((service) => (
                  <li
                    key={service.id}
                    onClick={() => setSearchQuery(service.title)}
                    className="flex items-center gap-3.5 group cursor-pointer"
                  >
                    {/* Circle Thumbnail */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={service.image}
                        alt={service.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = carRepairImg;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Text Title */}
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {service.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Dynamic Cards Grid */}
          <div className="lg:col-span-3">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold text-sm">
                Không tìm thấy dịch vụ nào phù hợp với tìm kiếm của bạn.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedServices.map((service) => (
                    <article
                      key={service.id}
                      onClick={() => onOpenAppointment && onOpenAppointment(service.title)}
                      className="group flex flex-col bg-white dark:bg-slate-850 rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-150/60 dark:border-slate-750/70 transition-all duration-300 cursor-pointer relative"
                    >
                      {/* Date circle badge on top-left of image */}
                      <div className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center font-black text-[10px] uppercase shadow-md leading-none">
                        <span>{service.date.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold mt-0.5">{service.date.split(' ')[1]}</span>
                      </div>

                      {/* Card Image Header */}
                      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img
                          src={service.image}
                          alt={service.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = carRepairImg;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Card Content body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h3 className="text-slate-850 dark:text-white font-extrabold text-sm leading-snug tracking-wide uppercase transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {service.title}
                          </h3>
                          {/* Decorative separator line */}
                          <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-700/80 group-hover:bg-indigo-500 transition-colors" />
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                            {service.snippet}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xxs font-bold text-indigo-600 dark:text-indigo-400">
                          <span>Đăng ký đặt hẹn →</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination Controls matching sample screenshot: < 1 2 > */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2.5 mt-12">
                    {/* Prev Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition ${
                        currentPage === 1
                          ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                      }`}
                      title="Trang trước"
                    >
                      &lt;
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition ${
                        currentPage === totalPages
                          ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                      }`}
                      title="Trang tiếp"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

    </section>
  );
};

export default ServicesPageSection;
