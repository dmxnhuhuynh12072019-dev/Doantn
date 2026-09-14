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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main White Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT COLUMN: Modern Showcase & Branding (Hidden on small screens) */}
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
                Nền tảng cứu hộ &amp; chăm sóc xe <span className="text-indigo-600">thông minh 24/7</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Kết nối nhanh chóng với mạng lưới garage uy tín, đặt lịch bảo dưỡng và nhận hỗ trợ cứu hộ khẩn cấp mọi lúc mọi nơi.
              </p>
            </div>
          </div>

          {/* Featured Visual Card */}
          <div className="my-5 relative z-10">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
              <img 
                src={workshopImg} 
                alt="ACOH Workshop" 
                className="w-full h-40 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-white/95 backdrop-blur-md rounded-xl border border-white/60 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Đội ngũ sẵn sàng trực tuyến</p>
                    <p className="text-[10px] text-slate-500">Phản hồi cứu hộ &lt; 15 phút</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-600 text-xs font-bold gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <span>★</span> 4.9/5
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Highlights & Stats */}
          <div className="space-y-2.5 relative z-10 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garage chuẩn chất lượng</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Bảo mật dữ liệu 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Đặt lịch hẹn chuẩn xác</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Minh bạch chi phí</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-white">
          
          <div>
            {/* Top Navigation Bar: Tabs & Back to Home */}
            <div className="flex items-center justify-between gap-4 mb-7">
              {/* Segmented Pill Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                <div className="px-5 py-2 rounded-xl bg-white text-indigo-700 font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-default transition">
                  <span>Đăng nhập</span>
                </div>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>

              {/* Back to Home Button */}
              <Link 
                to="/" 
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Chào mừng trở lại <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Vui lòng điền thông tin tài khoản để truy cập hệ thống ACOH.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
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
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
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
                    className="w-full bg-slate-50/60 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-2xl pl-11 pr-11 py-3 sm:py-3.5 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 font-medium"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors p-1 cursor-pointer"
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
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'border border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                  >
                    {rememberMe && (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
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
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 transition py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Bạn muốn thử nghiệm nhanh bằng tài khoản mẫu?
                </span>
                <span className="text-[11px] text-indigo-600 font-bold underline">
                  {showDemoAccounts ? 'Đóng' : 'Xem gợi ý'}
                </span>
              </button>

              {showDemoAccounts && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@acoh.com', '123456')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-indigo-700">🛡️ Quản trị (Admin)</span>
                    <span className="block text-[10px] text-slate-500 truncate mt-0.5">admin@acoh.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('garage@acoh.com', '123456')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-teal-700">🔧 Đối tác Garage</span>
                    <span className="block text-[10px] text-slate-500 truncate mt-0.5">garage@acoh.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('user@acoh.com', '123456')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-purple-700">🚗 Khách hàng</span>
                    <span className="block text-[10px] text-slate-500 truncate mt-0.5">user@acoh.com</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer: Security Note & Register CTA */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline ml-1"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
