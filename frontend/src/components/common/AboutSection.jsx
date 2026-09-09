import { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Wrench,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  Users,
  MapPin,
  Star,
  Activity,
  FileText,
  Zap,
  TrendingUp,
  Target,
  Compass,
  HeartHandshake
} from 'lucide-react';

import aboutBannerBg from '../../assets/about_banner_bg.png';
import aboutWorkshop from '../../assets/about_workshop.png';
import carRepairImg from '../../assets/car_repair.png';
import carEngineCleaningImg from '../../assets/car_engine_cleaning.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carWashImg from '../../assets/car_wash.png';

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState('mission'); // 'mission' | 'vision' | 'values'

  // Statistics Data
  const stats = [
    { value: '10+', label: 'Năm Kinh Nghiệm', sub: 'Thành lập từ 2015', icon: Award, color: 'text-amber-500 bg-amber-500/10' },
    { value: '50.000+', label: 'Phương Tiện Chăm Sóc', sub: 'Ô tô & Xe máy toàn quốc', icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
    { value: '120+', label: 'Gara & Xưởng Đối Tác', sub: 'Mạng lưới liên kết 63 tỉnh', icon: MapPin, color: 'text-emerald-500 bg-emerald-500/10' },
    { value: '99.8%', label: 'Hài Lòng Tuyệt Đối', sub: 'Đánh giá 5 sao từ khách hàng', icon: Star, color: 'text-rose-500 bg-rose-500/10' },
  ];

  // Core Strengths
  const strengths = [
    {
      icon: Cpu,
      title: 'Công nghệ AI Thị giác (Vision AI)',
      desc: 'Bóc tách chuẩn xác biển số xe, sổ đăng kiểm, phân tích hồ sơ kỹ thuật trong tích tắc bằng mô hình Vision LLM hiện đại.',
      badge: 'Công Nghệ 4.0'
    },
    {
      icon: Activity,
      title: 'Trợ lý Bác Sĩ Xe AI Thông Minh',
      desc: 'Hệ thống tự động chấm điểm sức khỏe xe (Vehicle Health Score), cảnh báo chu kỳ thay dầu nhớt, má phanh và hạn đăng kiểm.',
      badge: 'Chẩn Đoán 24/7'
    },
    {
      icon: FileText,
      title: 'Sổ Bảo Dưỡng Điện Tử Minh Bạch',
      desc: 'Lưu trữ toàn bộ lịch sử sửa chữa, phụ tùng thay thế và hóa đơn chuẩn in ấn. Khách hàng dễ dàng tra cứu mọi lúc mọi nơi.',
      badge: 'Minh Bạch 100%'
    },
    {
      icon: ShieldCheck,
      title: 'Cam Kết Phụ Tùng Chính Hãng',
      desc: '100% dầu nhớt Castrol, Motul, Mobil và linh kiện OEM nhập khẩu có tem kiểm định, bảo hành kỹ thuật toàn diện từ 6 - 24 tháng.',
      badge: 'Bảo Hành Vàng'
    },
  ];

  // Facility Showcases
  const facilities = [
    {
      title: 'Khu Vực Chuẩn Đoán & Sửa Chữa Gầm Máy',
      desc: 'Hệ thống cầu nâng 2 trụ, 4 trụ thủy lực công suất lớn kết hợp thiết bị quét lỗi hộp đen OBD2 chuyên sâu cho mọi dòng xe châu Âu, Nhật, Hàn.',
      img: carRepairImg,
      tag: 'Kỹ thuật cao'
    },
    {
      title: 'Trung Tâm Bảo Dưỡng Động Cơ & Buồng Đốt',
      desc: 'Công nghệ nội soi dàn lạnh khử mùi, súc rửa kim phun xăng điện tử bằng sóng siêu âm và dung dịch làm sạch buồng đốt cao cấp.',
      img: carEngineCleaningImg,
      tag: 'Hiệu suất tối ưu'
    },
    {
      title: 'Phòng Sơn Sấy Hấp Chuẩn Châu Âu',
      desc: 'Phòng sơn sấy công nghệ hồng ngoại đối lưu, pha màu vi tính chuẩn xác 100% theo mã màu gốc của nhà sản xuất, bảo hành bong tróc 3 năm.',
      img: carBodyPaintImg,
      tag: 'Đồng sơn cao cấp'
    },
    {
      title: 'Khu Vực Detailing & Chăm Sóc Xe Chuyên Nghiệp',
      desc: 'Dịch vụ rửa xe không chạm, đánh bóng phủ Ceramic 9H, dán phim cách nhiệt 3M chính hãng và vệ sinh khoang lái diệt khuẩn bằng Ozone.',
      img: carWashImg,
      tag: 'Car Spa & Detailing'
    },
  ];

  // 5-Step Process
  const processSteps = [
    { step: '01', title: 'Tiếp Nhận & Quét AI OCR', desc: 'Nhận diện biển số xe tự động qua WebCam/Camera, kích hoạt hồ sơ phương tiện trong 1 giây.' },
    { step: '02', title: 'Khám Xe 20 Hạng Mục', desc: 'Kỹ thuật viên trưởng kiểm tra gầm, phanh, lốp, ắc quy, mức dầu nhớt và chẩn đoán mã lỗi OBD2.' },
    { step: '03', title: 'Báo Giá Minh Bạch', desc: 'Xuất bảng kê chi tiết vật tư phụ tùng và tiền công minh bạch trên ứng dụng để khách hàng duyệt trước.' },
    { step: '04', title: 'Thi Công Chuyên Nghiệp', desc: 'Đội ngũ kỹ sư tiến hành bảo dưỡng đúng quy chuẩn nhà máy, lưu vết phụ tùng thay thế.' },
    { step: '05', title: 'Nghiệm Thu & Bảo Hành', desc: 'Rửa xe sạch sẽ, bàn giao hóa đơn điện tử chuẩn mẫu và kích hoạt bảo hành điện tử trên ứng dụng.' },
  ];

  return (
    <section id="about" className="bg-slate-50 dark:bg-slate-950 transition-colors scroll-mt-20">
      
      {/* 1. Top Hero Banner */}
      <div
        className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${aboutBannerBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Hệ Sinh Thái Quản Lý Phương Tiện 4.0
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Giới Thiệu Về <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400">ACOH AutoCare</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-3 font-medium max-w-2xl leading-relaxed">
            Nền tảng công nghệ tiên phong kết nối chủ xe với mạng lưới xưởng dịch vụ chất lượng cao, mang lại trải nghiệm chăm sóc xe minh bạch, an tâm và thông minh.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs font-bold tracking-wider">
            <a href="/user/dashboard" className="text-zinc-400 hover:text-white transition">
              TRANG CHỦ
            </a>
            <span className="text-zinc-600">/</span>
            <span className="text-indigo-400 uppercase">VỀ CHÚNG TÔI</span>
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    Top 1
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {item.label}
                </div>
                <div className="text-xxs sm:text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {item.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Story & Brand Overview */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Experience Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 aspect-[4/3] group">
              <img
                src={aboutWorkshop}
                alt="ACOH AutoCare Workshop"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="inline-block px-3 py-1 bg-indigo-600 rounded-xl text-xxs font-black uppercase tracking-wider mb-2">
                  Xưởng Tiêu Chuẩn Quốc Tế
                </div>
                <h4 className="text-lg font-black leading-snug">
                  Quy mô xưởng 1.500m² trang bị 10 cầu nâng thủy lực & trạm chẩn đoán điện tử
                </h4>
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center gap-4 animate-bounce duration-1000">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/30">
                10+
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Năm Khẳng Định</p>
                <p className="text-xxs text-slate-500 dark:text-slate-400 font-semibold">Chất lượng & Uy tín dẫn đầu</p>
              </div>
            </div>
          </div>

          {/* Right Column: Text Story & Tabs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Về Chúng Tôi
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Tiên phong chuẩn hóa dịch vụ bảo dưỡng phương tiện tại Việt Nam
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              Được thành lập từ năm 2015 bởi đội ngũ kỹ sư cơ khí động lực học xuất thân từ Đại học Bách Khoa và các chuyên gia từng giữ vị trí quản lý dịch vụ tại các hãng xe danh tiếng như Toyota, BMW, Mercedes-Benz. <strong>ACOH AutoCare</strong> ra đời với sứ mệnh xóa bỏ nỗi lo bị “chặt chém”, phụ tùng trôi nổi và thông tin mập mờ khi mang xe đi bảo dưỡng.
            </p>

            {/* Mission, Vision, Core Values Tabs */}
            <div className="space-y-4 pt-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'mission'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-4 h-4" /> Sứ Mệnh
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'vision'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-4 h-4" /> Tầm Nhìn
                </button>
                <button
                  onClick={() => setActiveTab('values')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'values'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" /> Giá Trị Cốt Lõi
                </button>
              </div>

              {/* Tab Content Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium min-h-[110px] flex items-center">
                {activeTab === 'mission' && (
                  <p>
                    🎯 <strong>Sứ mệnh của ACOH:</strong> Ứng dụng công nghệ Trí tuệ nhân tạo (AI) và chuyển đổi số để xây dựng một môi trường chăm sóc xe minh bạch, tiết kiệm thời gian, bảo vệ quyền lợi tối đa cho mọi chủ sở hữu xe cơ giới tại Việt Nam.
                  </p>
                )}
                {activeTab === 'vision' && (
                  <p>
                    🚀 <strong>Tầm nhìn 2030:</strong> Trở thành hệ sinh thái quản lý vòng đời phương tiện số 1 Đông Nam Á, tích hợp liền mạch dịch vụ bảo dưỡng, cứu hộ khẩn cấp, bảo hiểm điện tử và thị trường phụ tùng chính hãng.
                  </p>
                )}
                {activeTab === 'values' && (
                  <p>
                    💎 <strong>Giá trị cốt lõi:</strong> <em>Minh bạch tuyệt đối (Transparency)</em> – <em>Công nghệ tiên phong (Innovation)</em> – <em>Kỹ thuật chuẩn xác (Precision)</em> – <em>Đồng hành tận tâm (Dedication)</em>.
                  </p>
                )}
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                'Phụ tùng chính hãng 100%',
                'Báo giá trước khi làm',
                'Bảo hành dịch vụ tới 2 năm',
                'Quét mã lỗi OBD2 miễn phí',
                'Cứu hộ khẩn cấp 24/7',
                'Theo dõi tiến độ trực tiếp qua App',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* 4. Technological Strengths (AI & Platform Features) */}
      <div className="bg-white dark:bg-slate-900/60 py-16 md:py-20 border-y border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Công Nghệ Đột Phá
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Sức mạnh công nghệ giúp ACOH dẫn đầu thị trường
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Chúng tôi kết hợp nền tảng phần mềm đám mây với mô hình Trí tuệ nhân tạo (Multimodal Vision AI) để tự động hóa hoàn toàn quy trình quản lý xe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strengths.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xxs font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 group-hover:gap-2 transition-all">
                    <span>Khám phá tính năng</span> →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Facilities & Workshop Showcase */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Cơ Sở Vật Chất & Trang Thiết Bị
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Trang bị máy móc hiện đại bậc nhất
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Tất cả các trạm dịch vụ đối tác trong hệ thống ACOH đều trải qua quy trình thẩm định 30 tiêu chí nghiêm ngặt về diện tích, tay nghề thợ và trang thiết bị.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-2xl transition duration-500 group"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={fac.img}
                  alt={fac.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xxs font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/10">
                  {fac.tag}
                </span>
              </div>
              <div className="p-6 space-y-2.5">
                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {fac.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {fac.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Standard 5-Step Service Process */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white py-16 md:py-24 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Quy Trình Chuyên Nghiệp
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              5 Bước dịch vụ chuẩn mực tại xưởng ACOH
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Quy trình khép kín giúp bạn tiết kiệm 50% thời gian chờ đợi và nắm bắt toàn bộ trạng thái xe theo thời gian thực.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {processSteps.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition-all duration-300 space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-indigo-400 font-mono group-hover:scale-110 transition">
                    {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition">
                  {item.title}
                </h4>
                <p className="text-xxs sm:text-xs text-slate-300 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Call To Action Banner */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-8 sm:p-12 md:p-16 text-white shadow-2xl shadow-indigo-600/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xxs font-black uppercase tracking-wider backdrop-blur-sm">
              🚀 Ưu Đãi Đặt Hẹn Hôm Nay
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Sẵn sàng chăm sóc xế yêu của bạn một cách tốt nhất?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              Đặt lịch trực tuyến ngay để được kiểm tra 20 hạng mục an toàn và quét mã lỗi động cơ OBD2 hoàn toàn miễn phí!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto shrink-0">
            <a
              href="/user/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-indigo-600 font-black text-sm hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" /> Đặt Lịch Gara Ngay
            </a>
            <a
              href="tel:0901234567"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-black text-sm transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Hotline: 1900 6868
            </a>
          </div>
        </div>
      </div>

    </section>
  );
};

export default AboutSection;
