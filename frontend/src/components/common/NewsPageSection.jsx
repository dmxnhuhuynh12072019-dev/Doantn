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

const NewsPageSection = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filter articles based on search
  const filteredArticles = ARTICLES_LIST.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate Hero article and Secondary articles
  const heroArticle = filteredArticles.find((a) => a.isHero) || filteredArticles[0];
  const secondaryArticles = filteredArticles.filter((a) => a.id !== heroArticle?.id);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col pb-24 md:pb-8 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: DARK BLUE GRADIENT MATCHING SAMPLE SCREENSHOT           */}
      {/* ========================================================================= */}
      <div className="bg-[#003882] dark:bg-slate-950 text-white px-4 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between border-b border-blue-900/50">
        <div className="flex items-center gap-3">
          {/* Back Button (Returns to Home / Dashboard) */}
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
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight !m-0 !p-0">
            Tin tức
          </h1>
        </div>

        {/* Brand Pill */}
        <span className="text-xxs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-blue-100">
          ACOH AutoCare
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH INPUT BAR MATCHING SAMPLE SCREENSHOT                            */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 max-w-3xl w-full mx-auto">
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500 transition">
          <svg className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm bài viết..."
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
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN NEWS CONTENT GRID MATCHING SAMPLE SCREENSHOT                       */}
      {/* ========================================================================= */}
      <div className="max-w-3xl w-full mx-auto px-3.5 sm:px-4 space-y-4 flex-1">
        
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-2xs mt-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-3">
              📰
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Thử tìm kiếm với từ khóa khác như "bảo dưỡng", "quy trình", "lái xe"...
            </p>
          </div>
        ) : (
          <>
            {/* HERO FEATURED ARTICLE (Big Top Card matching sample image) */}
            {heroArticle && (
              <div
                onClick={() => setSelectedArticle(heroArticle)}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition duration-200 cursor-pointer group"
              >
                {/* Banner Image */}
                <div className="relative h-48 sm:h-56 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={heroArticle.image}
                    alt={heroArticle.title}
                    onError={(e) => { e.target.src = heroArticle.fallbackImage; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#003882] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                    Nổi bật
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 space-y-1.5">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug tracking-tight uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {heroArticle.title}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed line-clamp-2 font-normal">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">{heroArticle.subtitle}</span>
                    {heroArticle.snippet}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{heroArticle.date}</span>
                    <span>• {heroArticle.author}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECONDARY ARTICLES LIST (Horizontal layout matching sample image) */}
            <div className="space-y-3">
              {secondaryArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition duration-200 cursor-pointer flex gap-3.5 items-center group"
                >
                  {/* Left Thumbnail Image */}
                  <div className="w-28 h-22 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-100 dark:border-slate-700">
                    <img
                      src={article.image}
                      alt={article.title}
                      onError={(e) => { e.target.src = article.fallbackImage; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1 font-normal">
                      {article.snippet}
                    </p>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 pt-0.5">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. ARTICLE DETAIL POPUP MODAL                                              */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeIn">
            {/* Image Banner */}
            <div className="relative h-56 sm:h-64 bg-slate-900">
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
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <span>🕒 {selectedArticle.date}</span>
                <span>• {selectedArticle.author}</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase leading-snug">
                {selectedArticle.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold italic border-l-4 border-indigo-600 pl-3 py-1">
                {selectedArticle.subtitle}
              </p>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                {selectedArticle.fullContent}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
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
