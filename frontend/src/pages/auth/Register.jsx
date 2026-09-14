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
  UserPlus,
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT COLUMN: Modern Showcase & Branding */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-r border-slate-800/80 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="space-y-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  ACOH <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300 font-black">AutoCare</span>
                </span>
                <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase block">Rescue & Care Platform</span>
              </div>
            </Link>

            <div className="pt-3">
              <h2 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug">
                Gia nhập cộng đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-300 to-purple-400">chủ xe thông thái</span>
              </h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Tạo tài khoản để theo dõi lịch sử bảo dưỡng, nhận cứu hộ tức thì và quản lý phương tiện mọi lúc mọi nơi.
              </p>
            </div>
          </div>

          {/* Benefit Cards */}
          <div className="my-6 space-y-3 relative z-10">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Quản lý hồ sơ xe thông minh</p>
                <p className="text-[11px] text-slate-400">Nhắc nhở hạn đăng kiểm &amp; thay dầu định kỳ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cứu hộ khẩn cấp 24/7</p>
                <p className="text-[11px] text-slate-400">Định vị GPS và garage gần nhất hỗ trợ</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="space-y-3 relative z-10 border-t border-slate-800/80 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đăng ký hoàn toàn miễn phí trong 30 giây</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-slate-900/60 backdrop-blur-md">
          <div>
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <span>Đăng nhập</span>
                </Link>
                <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/30 flex items-center gap-1.5 cursor-default transition">
                  <span>Đăng ký</span>
                </div>
              </div>

              <Link 
                to="/" 
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition font-medium px-3 py-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Tạo tài khoản mới ✨
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Nhập thông tin cá nhân để bắt đầu trải nghiệm dịch vụ.
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Họ và tên
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Địa chỉ Email
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 border border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Số điện thoại <span className="text-slate-500 font-normal">(Tùy chọn)</span>
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-teal-500 via-indigo-600 to-indigo-700 hover:from-teal-400 hover:via-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-teal-500/25 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Đăng ký tài khoản</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-bold text-teal-400 hover:text-teal-300 hover:underline ml-1"
              >
                Đăng nhập ngay
              </Link>
            </p>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chính sách bảo mật ACOH</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
