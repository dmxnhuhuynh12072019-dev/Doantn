import { useState } from 'react';
import newsDrivingTips from '../../assets/news_driving_tips.png';
import newsLandCruiser from '../../assets/news_land_cruiser.png';
import newsUsedCar from '../../assets/news_used_car.png';
import newsSmallCars from '../../assets/news_small_cars.png';
import carRepairImg from '../../assets/car_repair.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import aboutWorkshopImg from '../../assets/about_workshop.png';

// Articles list matching sample screenshot
const ARTICLES_LIST = [
  {
    id: 1,
    isHero: true,
    category: 'academy',
    categoryLabel: 'Tầm nhìn ACOH',
    readTime: '3 phút đọc',
    title: 'TẦM NHÌN ACOH ACADEMY TRONG 5 NĂM TỚI (2026 - 2031)',
    subtitle: 'TẦM NHÌN ACOH ACADEMY',
    snippet: 'Trong 5 năm tới, ACOH Academy đặt mục tiêu xây dựng mạng lưới 100 điểm đào tạo thực chiến, cấp chứng chỉ cho 10.000 kỹ thuật viên ô tô chuyên nghiệp trên toàn quốc.',
    fullContent: `
TẦM NHÌN VÀ SỨ MỆNH PHÁT TRIỂN ACOH ACADEMY (2026 - 2031)

ACOH Academy cam kết xây dựng hệ sinh thái đào tạo nghề dịch vụ ô tô chuyên nghiệp, đồng hành cùng các Garage & Trung tâm trên toàn quốc để phát triển nguồn nhân lực chất lượng cao.

Mục tiêu trọng tâm:
1. Phủ sóng mạng lưới đào tạo tại 63 tỉnh/thành phố trên cả nước.
2. Liên kết & phát triển khoảng 100 Điểm Đào Tạo & Trung tâm thực hành kỹ thuật.
3. Đào tạo và cấp chứng chỉ cho 10.000 kỹ thuật viên ô tô lành nghề.
4. Chuyển giao công nghệ chẩn đoán điện ô tô thế hệ mới, đọc lỗi ECU và bảo dưỡng xe Hybrid/Electric Vehicle.
    `,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    fallbackImage: aboutWorkshopImg,
    date: '06/07/2026',
    author: 'ACOH Ban Biên Tập',
  },
  {
    id: 2,
    isHero: false,
    category: 'academy',
    categoryLabel: 'Mạng lưới Gara',
    readTime: '4 phút đọc',
    title: 'HƯỚNG TỚI MẠNG LƯỚI ĐÀO TẠO NGÀNH DỊCH VỤ Ô TÔ TOÀN QUỐC',
    subtitle: 'Mạng lưới kết nối Gara & Kỹ thuật viên',
    snippet: 'ACOH Academy xác định mục tiêu chuẩn hóa quy trình dịch vụ và chuyển giao công nghệ sửa chữa ô tô tiên tiến cho các xưởng đối tác.',
    fullContent: `
Chuẩn hóa quy trình dịch vụ ô tô là chìa khóa giúp các gara nâng cao uy tín và giữ chân khách hàng. ACOH Academy tự hào là đơn vị tiên phong kết nối các gara xưởng sửa chữa trên toàn quốc.
    `,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=80',
    fallbackImage: newsDrivingTips,
    date: '06/07/2026',
    author: 'Kỹ thuật ACOH',
  },
  {
    id: 3,
    isHero: false,
    category: 'garage',
    categoryLabel: 'Gara đối tác',
    readTime: '5 phút đọc',
    title: 'Vì sao garage nên tham gia Garage Đào Tạo ACOH?',
    subtitle: 'Giải pháp phát triển bền vững cho chủ xưởng',
    snippet: 'Garage Đào Tạo ACOH mang đến giải pháp tăng doanh thu, tối ưu quản lý kho phụ tùng và nâng cao tay nghề thợ.',
    fullContent: `
Tham gia chuỗi liên kết Garage Đào Tạo ACOH giúp các chủ xưởng tiếp cận lượng khách hàng lớn từ ứng dụng ACOH AutoCare, đồng thời nhận hỗ trợ thiết bị đọc lỗi chuyên sâu và đào tạo nhân sự miễn phí.
    `,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    fallbackImage: carRepairImg,
    date: '03/07/2026',
    author: 'Ban Gara Đối Tác',
  },
  {
    id: 4,
    isHero: false,
    category: 'garage',
    categoryLabel: 'Chuẩn hóa dịch vụ',
    readTime: '3 phút đọc',
    title: 'Hưởng ứng lời kêu gọi chuẩn hóa dịch vụ bảo dưỡng xe ô tô',
    subtitle: 'Minh bạch chi phí - Nâng tầm chất lượng',
    snippet: 'Hưởng ứng lời kêu gọi với nhân sự ngành ô tô nhằm đem lại trải nghiệm dịch vụ sửa chữa minh bạch, uy tín cho mọi chủ xe.',
    fullContent: `
Chương trình minh bạch giá phụ tùng và báo giá trước khi làm việc đã nhận được phản hồi rất tích cực từ hàng ngàn tài xế và chủ ô tô cá nhân tại TP.HCM và Hà Nội.
    `,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=80',
    fallbackImage: carBodyPaintImg,
    date: '01/07/2026',
    author: 'ACOH News',
  },
  {
    id: 5,
    isHero: false,
    category: 'safety',
    categoryLabel: 'Kinh nghiệm lái xe',
    readTime: '4 phút đọc',
    title: 'Những mẹo lái ô tô an toàn cơ bản & bảo dưỡng xe mùa mưa',
    subtitle: 'Kỹ năng lái xe an toàn',
    snippet: 'Sắp xếp thời gian, không phân tâm, kiểm tra hệ thống phanh và gạt mưa giúp chuyến đi của bạn luôn an toàn.',
    fullContent: `
Khi đi mưa hoặc ngập nước:
1. Luôn giữ khoảng cách an toàn gấp đôi so với đường khô ráo.
2. Kiểm tra độ mòn của gạt mưa và bổ sung nước rửa kính.
3. Không cố gắng khởi động lại máy nếu xe bị tắt máy trong vùng ngập sâu (tránh hiện tượng thủy kích).
    `,
    image: newsDrivingTips,
    fallbackImage: newsDrivingTips,
    date: '28/06/2026',
    author: 'Chuyên gia tư vấn',
  },
  {
    id: 6,
    isHero: false,
    category: 'tech',
    categoryLabel: 'Đánh giá kỹ thuật',
    readTime: '6 phút đọc',
    title: 'Thử nghiệm và đánh giá hệ thống phanh ABS / ESP thế hệ mới',
    subtitle: 'Đánh giá kỹ thuật ô tô',
    snippet: 'Hệ thống phanh chống bó cứng ABS kết hợp cân bằng điện tử ESP giúp ô tô giữ vững quỹ đạo khi phanh gấp.',
    fullContent: `
Hệ thống phanh ABS thế hệ mới giúp giảm quãng đường phanh từ 15% - 20% trên mặt đường trơn trượt, đảm bảo lái xe có thể đánh lái tránh chướng ngại vật một cách an toàn.
    `,
    image: newsLandCruiser,
    fallbackImage: newsLandCruiser,
    date: '20/06/2026',
    author: 'Đội ngũ Kỹ thuật',
  },
];

const newsCategories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'academy', label: 'Đào tạo & Tầm nhìn' },
  { id: 'garage', label: 'Gara đối tác' },
  { id: 'safety', label: 'Kinh nghiệm lái xe' },
  { id: 'tech', label: 'Kỹ thuật ô tô' },
];

const NewsPageSection = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filter articles based on search & category
  const filteredArticles = ARTICLES_LIST.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate Hero article and Secondary articles
  const heroArticle = filteredArticles.find((a) => a.isHero) || filteredArticles[0];
  const secondaryArticles = filteredArticles.filter((a) => a.id !== heroArticle?.id);
  const spotlightArticles = secondaryArticles.slice(0, 2);
  const remainingArticles = secondaryArticles.slice(2);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col pb-24 md:pb-12 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: UNIFIED ACOH BRAND GRADIENT HEADER                     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white px-4 sm:px-6 lg:px-8 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between border-b border-indigo-950/40">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onBack || (() => window.history.back())}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Screen Title */}
          <div>
            <h1 className="!text-white text-base sm:text-lg font-black tracking-tight !m-0 !p-0 leading-tight">
              Tin tức & Kiến thức ô tô
            </h1>
            <p className="hidden sm:block text-xs text-indigo-200/90 mt-0.5 font-medium">
              Cập nhật quy chuẩn kỹ thuật, cẩm nang chăm sóc xe và định hướng phát triển
            </p>
          </div>
        </div>

        {/* Brand Pill */}
        <span className="text-xxs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-indigo-100 shrink-0">
          ACOH AutoCare
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & CATEGORY FILTER BAR (Responsive Desktop max-w-7xl)             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 rounded-xl px-3.5 py-2 w-full md:w-auto md:min-w-[340px] lg:min-w-[400px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition">
            <svg className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm bài viết, mẹo lái xe, bảo dưỡng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1">
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5 md:pt-0">
            {newsCategories.map((cat) => {
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN NEWS CONTENT: Responsive max-w-7xl with Magazine Grid on Web       */}
      {/* ========================================================================= */}
      <div className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1">
        
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-2xs max-w-lg mx-auto mt-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-3">
              📰
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả".
            </p>
          </div>
        ) : (
          <>
            {/* FEATURED EDITORIAL SECTION (Desktop 2-column Magazine / Mobile stacked) */}
            {heroArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
                
                {/* Large Hero Card (Desktop: 7 cols) */}
                <div
                  onClick={() => setSelectedArticle(heroArticle)}
                  className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-lg transition duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 sm:h-64 lg:h-72 bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                    <img
                      src={heroArticle.image}
                      alt={heroArticle.title}
                      onError={(e) => { e.target.src = heroArticle.fallbackImage; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                      Nổi bật
                    </div>
                    {heroArticle.readTime && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        ⏱️ {heroArticle.readTime}
                      </div>
                    )}
                  </div>

                  {/* Content body */}
                  <div className="p-4 sm:p-5 lg:p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-[10px] uppercase tracking-wider">
                          {heroArticle.categoryLabel || 'Tin tức'}
                        </span>
                        <span>• {heroArticle.date}</span>
                      </div>

                      <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-snug tracking-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {heroArticle.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">{heroArticle.subtitle}</span>
                        {heroArticle.snippet}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-750 text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                      <span>✍️ {heroArticle.author}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Đọc toàn bộ →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Spotlight list on Desktop (5 cols) / Secondary on Mobile */}
                <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 justify-between">
                  {spotlightArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition duration-300 cursor-pointer flex gap-3.5 sm:gap-4 items-center group flex-1"
                    >
                      {/* Left Thumbnail Image */}
                      <div className="w-28 h-22 sm:w-36 sm:h-28 lg:w-32 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-100 dark:border-slate-700">
                        <img
                          src={article.image}
                          alt={article.title}
                          onError={(e) => { e.target.src = article.fallbackImage; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {article.categoryLabel || 'Tin tức'}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1 font-normal">
                          {article.snippet}
                        </p>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 pt-0.5">
                          <span>🕒 {article.date}</span>
                          <span>• {article.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* REMAINING ARTICLES: Responsive 3-Column Grid on Desktop / List on Mobile */}
            {remainingArticles.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-750">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Tất cả bài viết & Cẩm nang
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {filteredArticles.length} bài viết
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
                  {remainingArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 mb-3 border border-slate-100 dark:border-slate-700">
                          <img
                            src={article.image}
                            alt={article.title}
                            onError={(e) => { e.target.src = article.fallbackImage; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {article.categoryLabel || 'Tin tức'}
                          </div>
                        </div>

                        {/* Title & snippet */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {article.snippet}
                        </p>
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>🕒 {article.date}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                          Đọc tiếp →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. ARTICLE DETAIL POPUP MODAL (Enhanced Responsive Modal)                  */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl lg:max-w-4xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeIn">
            {/* Image Banner */}
            <div className="relative h-60 sm:h-72 lg:h-80 bg-slate-900">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                onError={(e) => { e.target.src = selectedArticle.fallbackImage; }}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Article Info */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 uppercase tracking-wider text-[10px]">
                  {selectedArticle.categoryLabel || 'Tin tức'}
                </span>
                <span>🕒 {selectedArticle.date}</span>
                <span>• {selectedArticle.author}</span>
              </div>

              <h2 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase leading-snug">
                {selectedArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold italic border-l-4 border-indigo-600 pl-3 py-1">
                {selectedArticle.subtitle}
              </p>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3 pt-2">
                {selectedArticle.fullContent}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer active:scale-95"
                >
                  Đóng bài viết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NewsPageSection;
