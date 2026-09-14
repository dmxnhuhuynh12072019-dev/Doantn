import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ArrowLeft, Send, ShieldCheck, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('Mã OTP khôi phục mật khẩu đã được gửi! Bạn sẽ được chuyển hướng để nhập mã OTP...');
      
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu khôi phục mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              ACOH <span className="text-indigo-600">AutoCare</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quên mật khẩu? 🔐</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Nhập email đã đăng ký để nhận mã OTP khôi phục tài khoản.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-700">
              Địa chỉ Email của bạn
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang gửi mã OTP...</span>
              </>
            ) : (
              <>
                <span>Gửi mã xác thực OTP</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Đăng nhập
          </Link>

          <div className="flex items-center gap-1 text-slate-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mã hóa SSL</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
