import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Khôi phục mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 shadow-2xl rounded-3xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Đặt lại mật khẩu</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Nhập mã OTP đã nhận được và thiết lập mật khẩu mới</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mã xác thực OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-white text-center font-bold tracking-widest text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
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
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link to="/login" className="font-bold text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
