import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Mail, ArrowLeft } from 'lucide-react';

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
      setSuccess('Mã OTP khôi phục mật khẩu đã được gửi! Bạn sẽ được chuyển hướng để nhập mã OTP.');
      
      // Chuyển sang màn hình reset mật khẩu sau 2 giây và truyền email đi cùng
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-2xl shadow-slate-300/70 border border-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#1e1b4b] text-white py-5 px-6 text-center rounded-t-[26px]">
          <h2 className="text-[18px] font-bold tracking-tight">Quên mật khẩu</h2>
          <p className="text-slate-300 text-xs mt-1">Nhập email để nhận mã OTP xác thực</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1.5">Địa chỉ Email</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Mail className="w-5 h-5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-[14.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang gửi OTP...
                </>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
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

export default ForgotPassword;

