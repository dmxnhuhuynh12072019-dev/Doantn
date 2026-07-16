import { useAuth } from '../../context/AuthContext';

const GarageDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Garage Dashboard</h2>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-6">AutoCare Office Helper (Đối tác Gara)</p>
        
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">Họ và tên: <span className="font-bold text-slate-700 dark:text-white">{user?.fullName}</span></p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Email: <span className="font-bold text-slate-700 dark:text-white">{user?.email}</span></p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Số điện thoại: <span className="font-bold text-slate-700 dark:text-white">{user?.phoneNumber || 'Chưa cập nhật'}</span></p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Vai trò: <span className="font-bold text-slate-700 dark:text-white">{user?.role}</span></p>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/profile"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
          >
            Hồ sơ & Đổi mật khẩu
          </a>
          <button
            onClick={logout}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default GarageDashboard;
