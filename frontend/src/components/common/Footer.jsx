import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import newsDrivingTips from '../../assets/news_driving_tips.png';
import newsLandCruiser from '../../assets/news_land_cruiser.png';
import newsUsedCar from '../../assets/news_used_car.png';

const thumbnails = [
  carWashImg,
  carBodyPaintImg,
  carRepairImg,
  newsDrivingTips,
  newsLandCruiser,
  newsUsedCar,
];

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#18181b] border-t border-zinc-800 text-zinc-400 transition-colors scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Row: Newsletter, Logo, Hotline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 items-center border-b border-zinc-800">
          
          {/* Newsletter signup */}
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase">Đăng ký thông tin</span>
            <div className="flex items-center mt-1 max-w-sm">
              <input
                type="email"
                placeholder="Email ..."
                className="bg-zinc-900 border border-zinc-800 text-white text-xs px-4 py-3 rounded-l-xl focus:outline-none focus:border-rose-600 transition w-full"
              />
              <button className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-3 rounded-r-xl transition uppercase shrink-0">
                Đăng ký
              </button>
            </div>
          </div>

          {/* Logo with purple car icon */}
          <div className="flex items-center justify-center gap-2.5 text-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md border border-indigo-500 shrink-0">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11l2-5h12l2 5M4 11h16M4 11v6h16v-6" />
              </svg>
            </div>
            <span className="text-white font-black tracking-widest text-base sm:text-lg uppercase">
              ACOH <span className="text-indigo-400">AutoCare</span>
            </span>
          </div>

          {/* Hotline info */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right gap-1 justify-center">
            <span className="text-zinc-400 font-bold text-xs tracking-wider uppercase">Hotline (24/7):</span>
            <a href="tel:0313728397" className="text-rose-500 font-black text-xl sm:text-2xl md:text-3xl hover:text-rose-400 transition tracking-tight">
              (+84) 313-728-397
            </a>
          </div>

        </div>

        {/* Bottom Row: Detailed Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          
          {/* Column 1: Intro */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm tracking-wider uppercase">
              ACOH <span className="text-indigo-400">AutoCare</span>
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Chuyên sửa chữa, bảo trì, nâng cấp các loại ôtô từ phổ thông đến hạng sang của các hãng xe nổi tiếng trên thế giới.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-zinc-400 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition" title="Facebook">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition" title="Instagram">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition" title="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Menu Links */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm tracking-wider uppercase">
              Menu
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-3">
                <a href="/user/dashboard" className="hover:text-white transition">Trang chủ</a>
                <a href="#services" className="hover:text-white transition">Dịch vụ</a>
                <a href="#contact" className="hover:text-white transition">Liên hệ</a>
              </div>
              <div className="flex flex-col gap-3">
                <a href="#about" className="hover:text-white transition">Giới thiệu</a>
                <a href="#news" className="hover:text-white transition">Tin tức</a>
              </div>
            </div>
          </div>

          {/* Column 3: Photo Gallery */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm tracking-wider uppercase">
              Hình ảnh
            </h4>
            <div className="grid grid-cols-3 gap-2 max-w-[240px]">
              {thumbnails.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Address */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm tracking-wider uppercase">
              Địa chỉ liên hệ
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 shrink-0">📍</span>
                <span className="leading-relaxed">1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-rose-500 shrink-0">📞</span>
                <span>(+84) 313-728-397</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-rose-500 shrink-0">✉️</span>
                <a href="mailto:info@themona.global" className="hover:text-white transition">
                  info@themona.global
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Mini Copyright Bar */}
      <div className="bg-zinc-950 py-4 border-t border-zinc-900 text-center text-xxs font-semibold text-zinc-500 tracking-wider">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} ACOH AutoCare. Thiết kế bởi Mona Media. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
