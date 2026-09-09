import { useState, useEffect, useRef } from 'react';
import promoCarsPerfectImg from '../../assets/banner/promo_cars_perfect_banner.jpg';
import slide1 from '../../assets/banner/slide1.png';
import slide2 from '../../assets/banner/slide2.png';
import slide3 from '../../assets/banner/slide3.png';

const fallbackImages = [
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1920&q=80'
];

const bannerSlides = [
  {
    id: 1,
    isCustomPromo: true,
    image: promoCarsPerfectImg,
    fallback: fallbackImages[0],
    discount: '49%',
    mainTitle: 'Giảm đến',
    subTitle: 'Nhiều sản phẩm dành cho xe bạn.'
  },
  {
    id: 2,
    image: slide1,
    fallback: fallbackImages[0],
    badge: '⚡ DỊCH VỤ CHUYÊN NGHIỆP',
    titleLine1: { white: 'TRUNG TÂM ', red: 'BẢO DƯỠNG SỬA CHỮA' },
    titleLine2: { white: 'ÔTÔ ', red: 'CHUYÊN NGHIỆP' },
    description: 'Chuyên sửa chữa, bảo trì, nâng cấp các loại ô tô từ phổ thông đến hạng sang của các hãng xe nổi tiếng trên thế giới.'
  },
  {
    id: 3,
    image: slide2,
    fallback: fallbackImages[1],
    badge: '⭐ CHĂM SÓC TOÀN DIỆN',
    titleLine1: { white: 'HỆ THỐNG ', red: 'CHĂM SÓC BẢO DƯỠNG' },
    titleLine2: { white: 'XE HƠI ', red: 'TOÀN DIỆN' },
    description: 'Đội ngũ kỹ thuật viên giàu kinh nghiệm, trang thiết bị chẩn đoán hiện đại, cam kết linh kiện chính hãng 100%.'
  },
  {
    id: 4,
    image: slide3,
    fallback: fallbackImages[2],
    badge: '🛡️ CỨU HỘ 24/7',
    titleLine1: { white: 'CỨU HỘ & DỊCH VỤ ', red: 'BẢO HIỂM ĐỊNH KỲ' },
    titleLine2: { white: 'NHANH CHÓNG ', red: 'UY TÍN 24/7' },
    description: 'Hỗ trợ nhắc lịch tự động theo km, tối ưu chi phí bảo trì và gia tăng tuổi thọ phương tiện của bạn.'
  }
];

const BannerSlider = ({ onOpenAppointment, onOpenContact }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timerRef = useRef(null);

  // Auto slide effect
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerSlides.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  // Touch handlers for mobile horizontal swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleContactClick = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      window.location.href = 'tel:0313728397';
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none group bg-slate-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider track */}
      <div
        className="flex transition-transform duration-700 ease-in-out w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[560px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannerSlides.map((slide) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative flex items-center justify-center"
          >
            {slide.isCustomPromo ? (
              <div 
                className="w-full h-full relative overflow-hidden flex flex-col justify-between items-center py-4 sm:py-6 md:py-8 px-4 sm:px-8 cursor-pointer select-none"
                onClick={onOpenAppointment}
              >
                {/* Full-width Seamless Gradient Image Background with 5 Cars shifted slightly upward */}
                <img
                  src={slide.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = slide.fallback;
                  }}
                  alt="5 cars promotional banner"
                  className="absolute inset-0 w-full h-full object-cover object-[center_65%] pointer-events-none select-none transition-transform duration-700 group-hover:scale-[1.01]"
                />

                {/* Top Centered Typography */}
                <div className="relative z-10 text-center flex flex-col items-center pt-1.5 sm:pt-2.5">
                  <div className="flex items-baseline justify-center gap-2 sm:gap-3.5">
                    <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight drop-shadow-xs">
                      {slide.mainTitle}
                    </span>
                    <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-950 tracking-tighter drop-shadow-sm font-sans">
                      {slide.discount}
                    </span>
                  </div>
                  <h3 className="mt-0.5 sm:mt-1.5 text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-xs">
                    {slide.subTitle}
                  </h3>
                </div>

                {/* Bottom Bar: App Download Badges placed at bottom floor level */}
                <div className="relative z-10 w-full max-w-6xl flex items-end justify-end gap-3 px-4 sm:px-8 pb-1 sm:pb-2 mt-auto">
                  {/* Right: App Store & Google Play Badges */}
                  <div className="flex flex-row items-center gap-2 sm:gap-2.5 ml-auto">
                    {/* App Store */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 hover:bg-white text-slate-900 border border-slate-300 px-2.5 sm:px-3 py-1 rounded-md shadow-xs transition hover:scale-105 cursor-pointer">
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.67-.99 1.74-.85 2.76 1.01.08 2.05-.51 2.57-1.26z"/>
                      </svg>
                      <div className="text-left leading-none">
                        <div className="text-[7.5px] sm:text-[8px] text-slate-500 font-medium">Download on the</div>
                        <div className="text-[9.5px] sm:text-[11px] font-bold text-slate-900">App Store</div>
                      </div>
                    </div>

                    {/* Google Play */}
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 hover:bg-white text-slate-900 border border-slate-300 px-2.5 sm:px-3 py-1 rounded-md shadow-xs transition hover:scale-105 cursor-pointer">
                      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.383-.61-.926-.61-1.536V3.35c0-.61.242-1.153.61-1.536zm11.233 11.235l2.453 2.454-12.062 6.96 9.609-9.414zm0-2.098L5.233 1.541l12.062 6.96-2.453 2.45zm1.464 1.049l3.52 2.031c.717.414.717 1.086 0 1.5l-3.52 2.031-2.109-2.109 2.109-1.453z"/>
                      </svg>
                      <div className="text-left leading-none">
                        <div className="text-[7.5px] sm:text-[8px] text-slate-500 font-medium">Available on the</div>
                        <div className="text-[9.5px] sm:text-[11px] font-bold text-slate-900">Google Play</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Background Image with Fallback */}
                <img
                  src={slide.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = slide.fallback;
                  }}
                  alt="Garage Banner"
                  className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90"
                />

                {/* Dark gradient vignette for subtle background contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40"></div>

                {/* Centered Dark Semi-Transparent Content Box */}
                <div className="relative z-10 bg-[#1c1c1c]/85 backdrop-blur-xs border border-white/10 px-6 py-6 sm:px-10 sm:py-9 md:px-14 md:py-11 max-w-2xl w-full text-center shadow-2xl rounded-sm sm:rounded-md transition-all duration-500 transform translate-y-0 text-white">
                  {/* Main Headline */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide leading-tight sm:leading-snug text-white drop-shadow-md">
                    <div>
                      <span className="text-white">{slide.titleLine1.white}</span>
                      <span className="text-[#ff3b30] font-black">{slide.titleLine1.red}</span>
                    </div>
                    <div>
                      <span className="text-white">{slide.titleLine2.white}</span>
                      <span className="text-[#ff3b30] font-black">{slide.titleLine2.red}</span>
                    </div>
                  </h2>

                  {/* Subtitle / Description */}
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white font-medium leading-relaxed max-w-xl mx-auto drop-shadow-xs">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                      onClick={onOpenAppointment}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ff4d4d] hover:bg-[#ff3333] active:bg-[#e62e2e] text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded sm:rounded-md shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white">ĐẶT HẸN</span>
                    </button>

                    <button
                      onClick={handleContactClick}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#3b5998] hover:bg-[#2d4373] active:bg-[#24365d] text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded sm:rounded-md shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-white">LIÊN HỆ</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Left Chevron Button (<) */}
      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/70 bg-black/40 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 backdrop-blur-xs"
        aria-label="Previous Slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Chevron Button (>) */}
      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/70 bg-black/40 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 backdrop-blur-xs"
        aria-label="Next Slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2.5">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === currentIndex
                ? 'w-3 h-3 bg-white scale-110 shadow-md ring-2 ring-white/40'
                : 'w-3 h-3 border border-white/80 bg-transparent hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default BannerSlider;
