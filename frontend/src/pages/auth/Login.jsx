import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Home,
  UserCheck
} from 'lucide-react';
import workshopImg from '../../assets/about_workshop.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Chuyển hướng người dùng dựa trên vai trò (Role)
      switch (user.role) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'Garage':
          navigate('/garage/dashboard');
          break;
        case 'User':
        default:
          navigate('/user/dashboard');
          break;
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
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
        
        {/* LEFT COLUMN: Modern Showcase & Branding (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-r border-slate-800/80 relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

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
                Nền tảng cứu hộ &amp; chăm sóc xe <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">thông minh 24/7</span>
              </h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Kết nối nhanh chóng với mạng lưới garage uy tín, đặt lịch bảo dưỡng và nhận hỗ trợ cứu hộ khẩn cấp mọi lúc mọi nơi.
              </p>
            </div>
          </div>

          {/* Featured Visual Glass Card */}
          <div className="my-6 relative z-10">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl group">
              <img 
                src={workshopImg} 
                alt="ACOH Workshop" 
                className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Đội ngũ sẵn sàng trực tuyến</p>
                    <p className="text-[11px] text-slate-400">Phản hồi cứu hộ &lt; 15 phút</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 text-xs font-bold gap-1 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                  <span>★</span> 4.9/5
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Highlights & Stats */}
          <div className="space-y-3 relative z-10 border-t border-slate-800/80 pt-5">
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Garage chuẩn chất lượng</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Bảo mật dữ liệu 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Đặt lịch hẹn chuẩn xác</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Minh bạch chi phí</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-slate-900/60 backdrop-blur-md">
          
          <div>
            {/* Top Navigation Bar: Tabs & Back to Home */}
            <div className="flex items-center justify-between gap-4 mb-8">
              {/* Segmented Pill Tabs */}
              <div className="inline-flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-default transition">
                  <span>Đăng nhập</span>
                </div>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>

              {/* Back to Home Button */}
              <Link 
                to="/" 
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition font-medium px-3 py-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                Chào mừng trở lại <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Vui lòng điền thông tin tài khoản để truy cập hệ thống ACOH.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Địa chỉ Email
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-11 py-3 sm:py-3.5 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                    placeholder="••••••••••••"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label 
                  className="flex items-center gap-2.5 cursor-pointer select-none group"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-gradient-to-tr from-indigo-600 to-teal-400 text-white shadow-sm shadow-indigo-500/50' 
                        : 'border border-slate-700 bg-slate-950/80 group-hover:border-slate-500'
                    }`}
                  >
                    {rememberMe && (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập ngay</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Fill Helper Dropdown */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition py-1"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Bạn muốn thử nghiệm nhanh bằng tài khoản mẫu?
                </span>
                <span className="text-[11px] text-indigo-400 font-semibold underline">
                  {showDemoAccounts ? 'Đóng' : 'Xem gợi ý'}
                </span>
              </button>

              {showDemoAccounts && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@acoh.com', '123456')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-left transition hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-indigo-400">🛡️ Quản trị (Admin)</span>
                    <span className="block text-[10px] text-slate-400 truncate">admin@acoh.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('garage@acoh.com', '123456')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 text-left transition hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-teal-400">🔧 Đối tác Garage</span>
                    <span className="block text-[10px] text-slate-400 truncate">garage@acoh.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('user@acoh.com', '123456')}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 text-left transition hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-purple-400">🚗 Khách hàng</span>
                    <span className="block text-[10px] text-slate-400 truncate">user@acoh.com</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer: Security Note & Register CTA */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline ml-1"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bảo mật mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
