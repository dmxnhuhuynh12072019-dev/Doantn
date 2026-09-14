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
          <h2 className="text-2xl font-bold text-white tracking-tight">Quên mật khẩu? 🔐</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Nhập email đã đăng ký để nhận mã OTP khôi phục tài khoản.
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:opacity-60 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang gửi OTP...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi mã OTP xác thực</span>
              </>
            )}
          </button>
        </form>

        {/* Back Link & Security Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 hover:underline transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang Đăng nhập
          </Link>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mã OTP có hiệu lực trong 5 phút</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
