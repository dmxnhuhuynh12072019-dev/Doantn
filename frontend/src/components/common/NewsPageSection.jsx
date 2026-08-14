import { useState } from 'react';
import aboutBannerBg from '../../assets/about_banner_bg.png';
import newsDrivingTips from '../../assets/news_driving_tips.png';
import newsLandCruiser from '../../assets/news_land_cruiser.png';
import newsUsedCar from '../../assets/news_used_car.png';
import newsSmallCars from '../../assets/news_small_cars.png';
import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import carInsuranceImg from '../../assets/car_insurance.png';
import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';

const recentArticles = [
  { id: 1, title: 'Bảo hiểm Ôtô', image: carInsuranceImg },
  { id: 2, title: 'Dịch vụ đồng sơn', image: carBodyPaintImg },
  { id: 3, title: 'Bảo dưỡng, sửa chữa xe ô tô', image: carRepairImg },
  { id: 4, title: 'Dịch vụ rửa xe hơi ô tô', image: carWashImg },
  { id: 5, title: 'Dịch vụ vệ sinh khoang máy', image: carEngineCleaningImg },
];

const newsArticles = [
  {
    id: 1,
    title: 'Những mẹo lái ô tô an toàn cơ bản',
    snippet: 'Sắp xếp thời gian, không phân tâm, sử dụng GPS, là những thói quen cũng như kỹ năng cơ bản hàng đầu giúp bạn và gia đình luôn được an toàn trên mọi nẻo đường.',
    image: newsDrivingTips,
    date: '24 Th1',
  },
  {
    id: 2,
    title: 'Thử nghiệm và đánh giá Toyota Land Cruiser 2018',
    snippet: 'Toyota Land Cruiser 2018 có khả năng off-road tốt và độ tin cậy cao trong phân khúc xe SUV cỡ lớn tại thị trường thế giới nói chung và Việt Nam nói riêng.',
    image: newsLandCruiser,
    date: '24 Th1',
  },
  {
    id: 3,
    title: 'Những điều cần lưu ý khi mua xe đã qua sử dụng',
    snippet: 'Việc mua lại ô tô cũ để tiết kiệm chi phí không còn quá xa lạ đối với người tiêu dùng hiện nay. Tuy nhiên, để chọn được chiếc xe tốt bạn cần trang bị kỹ năng...',
    image: newsUsedCar,
    date: '24 Th1',
  },
  {
    id: 4,
    title: 'Những mẫu xe cỡ nhỏ mới đáng mua nhất 2019',
    snippet: 'Ford Focus, Mazda 3, Honda Civic và Chevrolet Bolt phiên bản 2018 đều nằm trong danh sách những dòng xe hatchback/sedan đô thị nhỏ gọn, tiết kiệm nhiên liệu...',
    image: newsSmallCars,
    date: '24 Th1',
  },
];

const NewsPageSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter news articles based on search
  const filteredNews = newsArticles.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            Tin Tức
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm font-semibold tracking-wide">
            <a href="/user/dashboard" className="!text-zinc-300 hover:!text-white transition">
              TRANG CHỦ
            </a>
            <span className="!text-zinc-500">/</span>
            <span className="!text-indigo-400">TIN TỨC</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sidebar (Search & Recent Articles List) */}
          <div className="space-y-8">
            
            {/* Search Input Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/60 pb-2">
                Tìm kiếm bài viết
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

            {/* Recent Services List widget (Matches screenshot sidebar) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/60 pb-2">
                Bài viết mới
              </h4>
              <ul className="space-y-4">
                {recentArticles.map((article) => (
                  <li
                    key={article.id}
                    onClick={() => setSearchQuery(article.title)}
                    className="flex items-center gap-3.5 group cursor-pointer"
                  >
                    {/* Circle Thumbnail */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                    {/* Text Title */}
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Dynamic News Cards Grid */}
          <div className="lg:col-span-3">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold text-sm">
                Không tìm thấy bài viết tin tức nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <article
                    key={item.id}
                    className="group flex flex-col bg-white dark:bg-slate-850 rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-150/60 dark:border-slate-750/70 transition-all duration-300 cursor-pointer relative"
                  >
                    {/* Date circle badge on top-left of image */}
                    <div className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center font-black text-[10px] uppercase shadow-md leading-none">
                      <span>{item.date.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold mt-0.5">{item.date.split(' ')[1]}</span>
                    </div>

                    {/* Card Image Header */}
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h3 className="text-slate-850 dark:text-white font-extrabold text-sm leading-snug tracking-wide uppercase transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                          {item.title}
                        </h3>
                        {/* Decorative separator line */}
                        <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-700/80 group-hover:bg-indigo-500 transition-colors" />
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {item.snippet}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xxs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>Đọc chi tiết →</span>
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

export default NewsPageSection;
