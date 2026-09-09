import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
    // Trích xuất email từ query string (?email=...)
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
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Khôi phục mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-2xl shadow-slate-300/70 border border-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#1e1b4b] text-white py-5 px-6 text-center rounded-t-[26px]">
          <h2 className="text-[18px] font-bold tracking-tight">Đặt lại mật khẩu</h2>
          <p className="text-slate-300 text-xs mt-1">Nhập mã OTP và thiết lập mật khẩu mới</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Địa chỉ Email</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Mail className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Mã xác thực OTP</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <KeyRound className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full bg-transparent text-slate-800 text-center font-bold tracking-widest text-[16px] outline-none placeholder-slate-400"
                  placeholder="123456"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Mật khẩu mới</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Lock className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Xác nhận mật khẩu</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Lock className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-[14.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang khôi phục...
                  </>
                ) : (
                  'Xác nhận Đặt lại Mật khẩu'
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 text-center border-t border-slate-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-bold text-[13.5px] text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

