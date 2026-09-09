import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';

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
      setSuccess('Đăng ký tài khoản thành công! Hệ thống sẽ chuyển hướng về trang Đăng nhập...');
      
      // Tự động chuyển hướng sau 2 giây
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-2xl shadow-slate-300/70 border border-slate-100 overflow-hidden">
        
        {/* Top Header Tabs */}
        <div className="grid grid-cols-2">
          {/* Inactive Tab: Đăng nhập */}
          <Link
            to="/login"
            className="bg-white text-slate-800 py-4 text-center font-bold text-[16px] hover:bg-slate-50 transition-colors flex items-center justify-center select-none"
          >
            Đăng nhập
          </Link>

          {/* Active Tab: Đăng ký */}
          <div className="relative bg-[#1e1b4b] text-white py-4 text-center font-bold text-[16px] rounded-tr-[26px] select-none">
            <span>Đăng ký</span>
            {/* Teal underline indicator */}
            <div className="absolute bottom-0 left-6 right-6 h-[4px] bg-[#14b8a6] rounded-t-full"></div>
          </div>
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
            {/* Full Name */}
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Họ và tên</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <User className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Email</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Mail className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Mật khẩu</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Lock className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Phone Number Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1">Số điện thoại</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Phone className="w-4.5 h-4.5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="09xx xxx xxx (Tùy chọn)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-[14.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[13.5px] text-slate-800 font-medium">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

