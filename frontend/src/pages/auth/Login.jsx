import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState('User');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-2xl shadow-slate-300/70 border border-slate-100 overflow-hidden">
        
        {/* Top Header Tabs */}
        <div className="grid grid-cols-2">
          {/* Active Tab: Đăng nhập */}
          <div className="relative bg-[#1e1b4b] text-white py-4 text-center font-bold text-[16px] rounded-tl-[26px] select-none">
            <span>Đăng nhập</span>
            {/* Teal underline indicator */}
            <div className="absolute bottom-0 left-6 right-6 h-[4px] bg-[#14b8a6] rounded-t-full"></div>
          </div>

          {/* Inactive Tab: Đăng ký */}
          <Link
            to="/register"
            className="bg-white text-slate-800 py-4 text-center font-bold text-[16px] hover:bg-slate-50 transition-colors flex items-center justify-center select-none"
          >
            Đăng ký
          </Link>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1.5">Email</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Mail className="w-5 h-5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
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
              <label className="block text-[13.5px] font-bold text-slate-800 mb-1.5">Mật khẩu</label>
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
                <Lock className="w-5 h-5 text-slate-400 mr-2.5 shrink-0 stroke-[1.8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-800 text-[14px] outline-none placeholder-slate-400"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 shrink-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    rememberMe ? 'bg-[#14b8a6] text-white' : 'border border-slate-300 bg-white'
                  }`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-slate-800">Ghi nhớ đăng nhập</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
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
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-800 tracking-wider uppercase absolute whitespace-nowrap">
              HOẶC TIẾP TỤC VỚI VAI TRÒ
            </span>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* User Role Card */}
            <div
              onClick={() => handleRoleSelect('User')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-full aspect-[1/0.95] flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                  selectedRole === 'User'
                    ? 'border-2 border-[#14b8a6] bg-teal-50/20 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* User Icon */}
                <div className="w-10 h-10 flex items-center justify-center text-[#14b8a6]">
                  <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                <span className="font-bold text-[13.5px] text-slate-800 mt-1">User</span>
              </div>
              {/* Radio indicator */}
              <div
                className={`w-4.5 h-4.5 rounded-full mt-2.5 flex items-center justify-center transition-all ${
                  selectedRole === 'User'
                    ? 'border-2 border-[#14b8a6]'
                    : 'border-2 border-slate-300'
                }`}
              >
                {selectedRole === 'User' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></div>
                )}
              </div>
            </div>

            {/* Garage Role Card */}
            <div
              onClick={() => handleRoleSelect('Garage')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-full aspect-[1/0.95] flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                  selectedRole === 'Garage'
                    ? 'border-2 border-indigo-600 bg-indigo-50/20 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* Garage Icon */}
                <div className="w-10 h-10 flex items-center justify-center text-indigo-600">
                  <svg className="w-8 h-8 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
                    {/* Roof & frame */}
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10L12 4l9 6v10a1 1 0 01-1 1h-2a1 1 0 01-1-1v-4H7v4a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
                    {/* Garage lines */}
                    <path strokeLinecap="round" d="M7 10h10" />
                    <path strokeLinecap="round" d="M7 12.5h10" />
                    {/* Small Car silhouette inside */}
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 17.5h7m-6.5-2.5h6l1 2.5h-8l1-2.5z" />
                  </svg>
                </div>
                <span className="font-bold text-[13.5px] text-slate-800 mt-1">Garage</span>
              </div>
              {/* Radio indicator */}
              <div
                className={`w-4.5 h-4.5 rounded-full mt-2.5 flex items-center justify-center transition-all ${
                  selectedRole === 'Garage'
                    ? 'border-2 border-indigo-600'
                    : 'border-2 border-slate-300'
                }`}
              >
                {selectedRole === 'Garage' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                )}
              </div>
            </div>

            {/* Admin Role Card */}
            <div
              onClick={() => handleRoleSelect('Admin')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-full aspect-[1/0.95] flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                  selectedRole === 'Admin'
                    ? 'border-2 border-purple-700 bg-purple-50/20 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* Admin Shield Icon */}
                <div className="w-10 h-10 flex items-center justify-center text-purple-700">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 4a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm4 10.5c0 1.2-1.8 2.2-4 2.2s-4-1-4-2.2v-.8c0-1.3 2.7-2 4-2s4 .7 4 2v.8z" />
                  </svg>
                </div>
                <span className="font-bold text-[13.5px] text-slate-800 mt-1">Admin</span>
              </div>
              {/* Radio indicator */}
              <div
                className={`w-4.5 h-4.5 rounded-full mt-2.5 flex items-center justify-center transition-all ${
                  selectedRole === 'Admin'
                    ? 'border-2 border-purple-700'
                    : 'border-2 border-slate-300'
                }`}
              >
                {selectedRole === 'Admin' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-700"></div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="pt-3 text-center">
            <p className="text-[13.5px] text-slate-800 font-medium">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

