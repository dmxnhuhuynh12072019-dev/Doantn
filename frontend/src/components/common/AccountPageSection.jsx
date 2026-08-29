import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const AccountPageSection = ({
  onBack,
  onNavigateHome,
  onNavigateServices,
  onNavigateAppointments,
  onNavigateVehicles,
  onNavigateMessages,
  onNavigateNotifications,
}) => {
  const { user, updateProfile, changePassword, logout, themePreference, updateThemePreference } = useAuth();
  const { confirm, toast } = useModal();

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile(fullName, phoneNumber);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
      setShowEditProfileModal(false);
    } catch (err) {
      toast.error(err?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSettingsModal(false);
    } catch (err) {
      toast.error(err?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      const isConfirmed = await confirm({
        title: 'Đăng xuất tài khoản',
        message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản trên thiết bị này?',
        confirmText: 'Đăng xuất',
        cancelText: 'Hủy',
        type: 'danger',
      });
      if (isConfirmed) {
        logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-28 select-none">
      {/* 1. Header Bar: Mobile Top Bar + Desktop Breadcrumb Banner */}
      <div className="md:hidden bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="!text-white text-base font-black tracking-tight !m-0 !p-0" style={{ color: '#ffffff' }}>
            Tài khoản
          </h1>
        </div>

        {/* Quick Theme Toggle on Header */}
        <button
          onClick={() => updateThemePreference && updateThemePreference(themePreference === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm transition cursor-pointer border border-white/20 active:scale-95"
          title="Chuyển chế độ sáng / tối"
        >
          {themePreference === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Desktop Header Banner */}
      <div className="hidden md:block bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-6 px-6 shadow-sm border-b border-indigo-950/40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200 mb-1">
              <button onClick={onBack} className="hover:text-white transition cursor-pointer">Trang chủ</button>
              <span>/</span>
              <span className="text-white font-bold">Tài khoản</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight !m-0 !p-0">
              Quản lý tài khoản cá nhân
            </h1>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-xl md:max-w-2xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* 2. User Profile Header Card matching user sample */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 rounded-3xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            {/* Avatar Circle with Edit Badge */}
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
              </div>
              <button
                onClick={() => {
                  setFullName(user?.fullName || '');
                  setPhoneNumber(user?.phoneNumber || '');
                  setShowEditProfileModal(true);
                }}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm hover:scale-110 transition cursor-pointer"
                title="Chỉnh sửa hồ sơ"
              >
                ✏️
              </button>
            </div>

            {/* Name & Phone Info */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {user?.fullName || 'Huỳnh Võ Hoài Như'}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                {user?.phoneNumber || user?.email || '0353223837'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-bold text-white uppercase tracking-wider">
                {user?.role === 'Admin' ? 'Quản trị viên' : user?.role === 'Garage' ? 'Đối tác Gara' : 'Khách hàng ACOH'}
              </span>
            </div>
          </div>

          {/* Quick Theme Toggle Icon inside Card */}
          <button
            onClick={() => updateThemePreference && updateThemePreference(themePreference === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-lg transition cursor-pointer z-10 shrink-0"
            title="Chuyển chế độ giao diện"
          >
            {themePreference === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Subtle background glow circle */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* 3. Section: TÀI KHOẢN */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 block">
            TÀI KHOẢN
          </span>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-750 shadow-2xs overflow-hidden">
            {/* Chỉnh sửa hồ sơ */}
            <div
              onClick={() => {
                setFullName(user?.fullName || '');
                setPhoneNumber(user?.phoneNumber || '');
                setShowEditProfileModal(true);
              }}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-2xs group-hover:scale-105 transition-transform">
                  📝
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Chỉnh sửa hồ sơ
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Cập nhật tên, ảnh đại diện, số điện thoại
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 4. Section: QUẢN LÝ */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 block">
            QUẢN LÝ
          </span>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-750 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-750">
            
            {/* Lịch hẹn của tôi */}
            <div
              onClick={onNavigateAppointments}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0 border border-purple-100 dark:border-purple-900/40 shadow-2xs group-hover:scale-105 transition-transform">
                  📅
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Lịch hẹn của tôi
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Xem và quản lý lịch hẹn
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Xe của tôi */}
            <div
              onClick={onNavigateVehicles}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs group-hover:scale-105 transition-transform">
                  🚗
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Xe của tôi
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Quản lý phương tiện
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

          </div>
        </div>

        {/* 5. Section: HỆ THỐNG */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 block">
            HỆ THỐNG
          </span>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-750 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-750">
            
            {/* Cài đặt & Giao diện */}
            <div
              onClick={() => setShowSettingsModal(true)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs group-hover:scale-105 transition-transform">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Cài đặt & Giao diện
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Giao diện sáng/tối, đổi mật khẩu bảo mật
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Đăng xuất */}
            <div
              onClick={handleLogoutClick}
              className="p-4 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0 border border-rose-100 dark:border-rose-900/40 shadow-2xs group-hover:scale-105 transition-transform">
                  🚪
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 leading-tight">
                    Đăng xuất
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Đăng xuất khỏi tài khoản trên thiết bị này
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

          </div>
        </div>

      </div>

      {/* 6. Edit Profile Modal / Bottom Sheet */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowEditProfileModal(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Chỉnh sửa hồ sơ
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Địa chỉ Email (Không đổi)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-400 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nhập họ và tên..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Settings & Password Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowSettingsModal(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cài đặt & Giao diện
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chế độ giao diện */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Chế độ giao diện
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Sáng', icon: '☀️' },
                  { id: 'dark', label: 'Tối', icon: '🌙' },
                  { id: 'system', label: 'Hệ thống', icon: '💻' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateThemePreference && updateThemePreference(t.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition cursor-pointer ${
                      themePreference === t.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form đổi mật khẩu */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Đổi mật khẩu bảo mật
              </label>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 8. Mobile Bottom Navigation Bar matching sample image */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-xl px-4 py-2 z-40 flex justify-around items-center">
        {/* 1. Trang chủ */}
        <button
          type="button"
          onClick={onNavigateHome || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Trang chủ</span>
        </button>

        {/* 2. Gọi thợ */}
        <button
          type="button"
          onClick={onNavigateServices || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Gọi thợ</span>
        </button>

        {/* 3. Tin nhắn */}
        <button
          type="button"
          onClick={onNavigateMessages || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Tin nhắn</span>
        </button>

        {/* 4. Tài khoản (Active) */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-indigo-600 dark:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Tài khoản</span>
        </button>
      </div>
    </div>
  );
};

export default AccountPageSection;
