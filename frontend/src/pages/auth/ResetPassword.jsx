import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      setSuccess('Mật khẩu đã được khôi phục thành công! Đang chuyển hướng về trang Đăng nhập...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Khôi phục mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              ACOH <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">AutoCare</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Đặt lại mật khẩu 🛡️</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Nhập mã xác thực OTP và thiết lập mật khẩu mới an toàn.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1">
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
                className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                placeholder="name@company.com"
              />
            </div>
          </div>

          {/* OTP */}
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              Mã xác thực OTP
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full bg-slate-950/70 text-white text-xs sm:text-base font-bold tracking-widest text-center rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700 uppercase"
                placeholder="123456"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              Mật khẩu mới
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              Xác nhận mật khẩu
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-950/70 text-white text-xs sm:text-sm rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-500 hover:border-slate-700"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                'Xác nhận đặt lại mật khẩu'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
