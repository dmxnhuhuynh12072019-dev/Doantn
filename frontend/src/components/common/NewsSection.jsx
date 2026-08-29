import { useRef, useState } from 'react';
import newsDrivingTips from '../../assets/news_driving_tips.png';
import newsLandCruiser from '../../assets/news_land_cruiser.png';
import newsUsedCar from '../../assets/news_used_car.png';
import newsSmallCars from '../../assets/news_small_cars.png';

const newsList = [
  {
    id: 1,
    title: 'TẦM NHÌN DATXE ACADEMY TRONG 5 NĂM TỚI',
    date: '06/07/2026',
    category: 'Tin tức xe',
    categoryTheme: 'blue',
    image: newsDrivingTips,
  },
  {
    id: 2,
    title: 'HƯỚNG TỚI SỰ PHÁT TRIỂN BỀN VỮNG NGÀNH DỊCH VỤ Ô TÔ',
    date: '06/07/2026',
    category: 'Tin tức xe',
    categoryTheme: 'blue',
    image: newsLandCruiser,
  },
  {
    id: 3,
    title: 'NHỮNG MẸO LÁI Ô TÔ AN TOÀN & BẢO VỆ ĐỘNG CƠ MÙA MƯA',
    date: '05/07/2026',
    category: 'Kinh nghiệm',
    categoryTheme: 'emerald',
    image: newsUsedCar,
  },
  {
    id: 4,
    title: 'QUY TRÌNH CHĂM SÓC XE ĐẠT CHUẨN QUỐC TẾ TẠI ACOH',
    date: '02/07/2026',
    category: 'Cẩm nang xe',
    categoryTheme: 'purple',
    image: newsSmallCars,
  },
];

const NewsSection = ({ onViewAll }) => {
  const scrollRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragged, setIsDragged] = useState(false);

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 5) {
      setIsDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section id="news" className="py-4 sm:py-6 bg-transparent scroll-mt-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tin tức nổi bật
            </h2>
            {/* Desktop / Tablet Scroll buttons */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                onClick={handleScrollLeft}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Trượt sang trái"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleScrollRight}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Trượt sang phải"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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

        {/* Drag-to-Scroll Horizontal Carousel Container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-3.5 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar cursor-grab active:cursor-grabbing ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: isMouseDown ? 'auto' : 'smooth' }}
        >
          {newsList.map((news) => (
            <article
              key={news.id}
              onClick={() => {
                if (!isDragged && onViewAll) {
                  onViewAll();
                }
              }}
              className="w-[280px] sm:w-[320px] shrink-0 bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-700/80 transition-all duration-300 flex flex-col justify-between group select-none"
            >
              {/* Thumbnail Image Container with fully rounded top */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 pointer-events-none rounded-t-3xl">
                <img
                  src={news.image}
                  alt={news.title}
                  draggable="false"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Card Body with generous padding */}
              <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-3 pointer-events-none">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug tracking-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {news.title}
                </h3>

                {/* Footer Metadata */}
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-50 dark:border-slate-750">
                  <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {news.date}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 ${
                      news.categoryTheme === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300'
                        : news.categoryTheme === 'purple'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300'
                    }`}
                  >
                    {news.category}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
