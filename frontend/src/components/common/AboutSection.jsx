import aboutBannerBg from '../../assets/about_banner_bg.png';
import aboutWorkshop from '../../assets/about_workshop.png';

const AboutSection = () => {
  return (
    <section id="about" className="bg-white dark:bg-slate-900 transition-colors scroll-mt-20">
      
      {/* Top Banner with Car Lineup Background */}
      <div
        className="relative w-full h-56 sm:h-64 md:h-72 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${aboutBannerBg})` }}
      >
        {/* Dark mask overlay */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />
        
        {/* Banner Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black !text-white tracking-widest uppercase">
            Giới Thiệu
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm font-semibold tracking-wide">
            <a href="/user/dashboard" className="!text-zinc-300 hover:!text-white transition">
              TRANG CHỦ
            </a>
            <span className="!text-zinc-500">/</span>
            <span className="!text-indigo-400">GIỚI THIỆU</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Text Area */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <h3 className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base sm:text-lg tracking-widest uppercase">
                ACOH AUTOCARE
              </h3>
              <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                Trung tâm sửa chữa, bảo dưỡng ôtô chuyên nghiệp
              </h4>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              <p>
                Mona Media Cars được thành lập tháng 10/2013, Mona Media Cars đã quy tụ đội ngũ kỹ sư, kỹ thuật viên xuất thân từ Đại học Bách Khoa, Đại học Sư Phạm Kỹ Thuật, Đại học Giao Thông Vận Tải, Cao đẳng Cao Thắng....đã nhiều năm tham gia vào các hoạt động sản xuất kinh doanh, hậu mãi của các liên doanh lắp ráp ô tô tại Việt Nam. Tập thể nhân viên và lãnh đạo Mona Media Cars luôn theo sát tình hình thị trường ô tô, phấn đấu học hỏi và hoàn thiện mình từng bước nâng cao các kỹ năng cần thiết nhằm phục vụ quý khách ngày một tốt hơn, hoàn thiện hơn.
              </p>
              <p>
                Sau 5 năm trên mặt bằng diện tích 450m2 Mona Media Cars đã từng bước hoàn thiện và trang bị đầy đủ các thiết bị tiêu chuẩn, chuyên dùng để phục vụ sửa chữa cho tất cả các loại xe ô tô từ phổ thông đến cao cấp như Lexus, Acuara, BMW, Mercedes,....Sản phẩm và dịch vụ của chúng tôi bao gồm bảo dưỡng, sửa chữa, đồng sơn xe ô tô, các dịch vụ chăm sóc xe, cung cấp phụ tùng chính hãng và thay thế, nhận ký gửi, mua bán xe.
              </p>
            </div>
          </div>

          {/* Right: Image Area */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-all duration-500 aspect-video lg:aspect-[4/3] bg-slate-100 dark:bg-slate-800">
              <img
                src={aboutWorkshop}
                alt="Xưởng dịch vụ chuyên nghiệp"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </div>
      
    </section>
  );
};

export default AboutSection;
