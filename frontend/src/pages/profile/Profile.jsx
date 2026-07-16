import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // State thông tin hồ sơ
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // State đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleBackToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
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
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await updateProfile(fullName, phoneNumber);
      setProfileSuccess('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err) {
      setProfileError(err.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập kế tiếp.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* Header bar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Thiết lập tài khoản</h1>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
          >
            Đăng xuất
          </button>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Cập nhật thông tin hồ sơ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Thông tin cá nhân</h2>
            
            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-650 text-sm font-medium">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-650 text-sm font-medium">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex-1 min-h-[32px]"></div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Đổi mật khẩu */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Đổi mật khẩu</h2>
            
            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-650 text-sm font-medium">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-650 text-sm font-medium">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="••••••••"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 px-4 mt-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
