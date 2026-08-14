import { useState } from 'react';
import aboutBannerBg from '../../assets/about_banner_bg.png';
import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import carInsuranceImg from '../../assets/car_insurance.png';
import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';

const initialServices = [
  {
    id: 1,
    title: 'Bảo hiểm Ôtô',
    snippet: 'Phạm vi bảo vệ toàn diện, chi phí hợp lý và dịch vụ giải quyết nhanh chóng giúp bạn an tâm trên mọi chặng đường.',
    image: carInsuranceImg,
    date: '28 Th1',
  },
  {
    id: 2,
    title: 'Dịch vụ đồng sơn',
    snippet: 'Tiếp Nhận Xe khi tiếp nhận xe, cần kiểm tra kỹ bề mặt, vệ sinh sạch sẽ và phục hồi nguyên trạng sơn nguyên bản.',
    image: carBodyPaintImg,
    date: '28 Th1',
  },
  {
    id: 3,
    title: 'Bảo dưỡng, sửa chữa xe ô tô',
    snippet: 'Điền đầy đủ thông tin về xe của khách hàng, thông tin liên lạc, lịch hẹn định kỳ giúp tối ưu hiệu năng vận hành.',
    image: carRepairImg,
    date: '28 Th1',
  },
  {
    id: 4,
    title: 'Dịch vụ rửa xe hơi ô tô',
    snippet: 'Làm sạch toàn diện ngoại thất và nội thất bằng công nghệ rửa xe hiện đại, hóa chất an toàn và sấy khô chuyên nghiệp.',
    image: carWashImg,
    date: '28 Th1',
  },
  {
    id: 5,
    title: 'Dịch vụ vệ sinh khoang máy',
    snippet: 'Làm sạch bụi bẩn, dầu mỡ bám trên động cơ bằng luồng hơi nước nóng áp lực cao, giúp động cơ tản nhiệt tốt hơn.',
    image: carEngineCleaningImg,
    date: '25 Th1',
  },
  {
    id: 6,
    title: 'Chăm sóc ngoại thất ô tô',
    snippet: 'Đánh bóng, hiệu chỉnh sơn xe, phủ Ceramic bảo vệ bề mặt sơn luôn sáng bóng như mới và kháng bụi bẩn tối đa.',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    date: '25 Th1',
  },
];

const ServicesPageSection = ({ onOpenAppointment }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter services based on search
  const filteredServices = initialServices.filter((service) =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-white dark:bg-slate-900 transition-colors pb-16">
      
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
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
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
            )}
          </div>

        </div>
      </div>

    </section>
  );
};

export default ServicesPageSection;
