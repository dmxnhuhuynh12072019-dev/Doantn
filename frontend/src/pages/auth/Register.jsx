import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Home,
  Car
} from 'lucide-react';
import workshopImg from '../../assets/about_workshop.png';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(fullName, email, password, phoneNumber, 'User');
      setSuccess('Đăng ký tài khoản thành công! Hệ thống sẽ chuyển hướng về trang Đăng nhập sau 2 giây...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT COLUMN: Modern Showcase & Branding */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-slate-50/70 border-r border-slate-200/80 relative overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="space-y-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                  ACOH <span className="text-indigo-600 font-black">AutoCare</span>
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase block">Rescue &amp; Care Platform</span>
              </div>
            </Link>

            <div className="pt-2">
              <h2 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Gia nhập cộng đồng <span className="text-indigo-600">chủ xe thông thái</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Tạo tài khoản để theo dõi lịch sử bảo dưỡng, nhận cứu hộ tức thì và quản lý phương tiện mọi lúc mọi nơi.
              </p>
            </div>
          </div>

          {/* Benefit Cards */}
          <div className="my-5 space-y-3 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Quản lý hồ sơ xe thông minh</p>
                <p className="text-[11px] text-slate-500">Nhắc nhở hạn đăng kiểm &amp; thay dầu định kỳ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Cứu hộ khẩn cấp 24/7</p>
                <p className="text-[11px] text-slate-500">Định vị GPS và garage gần nhất hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="space-y-3 relative z-10 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đăng ký hoàn toàn miễn phí trong 30 giây</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <span>Đăng nhập</span>
                </Link>
                <div className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default transition">
                  <span>Đăng ký</span>
                </div>
              </div>

              <Link 
                to="/" 
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tạo tài khoản mới ✨
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Nhập thông tin cá nhân để bắt đầu trải nghiệm dịch vụ.
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  Họ và tên
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  Địa chỉ Email
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  Số điện thoại
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-bold text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký tài khoản</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
              >
                Đăng nhập ngay
              </Link>
            </p>

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật dữ liệu 100%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
