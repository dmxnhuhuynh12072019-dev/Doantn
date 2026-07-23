import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  // Navigation: 'overview' | 'users' | 'garages' | 'profile'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Users States
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Garages States
  const [garages, setGarages] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(false);
  const [garagesError, setGaragesError] = useState('');

  // --- FETCHERS ---
  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(err.message || 'Không thể tải số liệu thống kê hệ thống.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const data = await adminService.getUsers(searchQuery, roleFilter);
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchGarages = async () => {
    setLoadingGarages(true);
    setGaragesError('');
    try {
      const data = await adminService.getGarages();
      setGarages(data);
    } catch (err) {
      setGaragesError(err.message || 'Không thể tải danh sách Gara liên kết.');
    } finally {
      setLoadingGarages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'garages') {
      fetchGarages();
    }
  }, [activeTab]);

  // Trigger users fetch on search or role filter change
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // --- ACTIONS ---
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.Status === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
    const confirmMessage = `Bạn có chắc chắn muốn ${nextStatus === 'Bị khóa' ? 'khóa' : 'mở khóa'} tài khoản của "${targetUser.FullName}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await adminService.updateUserStatus(targetUser.UserID, nextStatus);
        alert(`Đã cập nhật trạng thái tài khoản thành công!`);
        fetchUsers();
        // If we are showing overview, refresh stats as well
        if (activeTab === 'overview') fetchStats();
      } catch (err) {
        alert(err.message || 'Cập nhật trạng thái tài khoản thất bại.');
      }
    }
  };

  const handleChangeUserRole = async (targetUser, newRole) => {
    if (targetUser.Role === newRole) return;
    const confirmMessage = `Bạn có chắc chắn muốn thay đổi vai trò của "${targetUser.FullName}" thành "${newRole}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await adminService.updateUserRole(targetUser.UserID, newRole);
        alert(`Đã cập nhật vai trò người dùng thành công!`);
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Cập nhật vai trò người dùng thất bại.');
      }
    }
  };

  const handleToggleGarageStatus = async (garage) => {
    const nextActive = !garage.IsActive;
    const confirmMessage = `Bạn có chắc chắn muốn ${nextActive ? 'kích hoạt' : 'tạm dừng'} hoạt động của Gara "${garage.GarageName}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await adminService.updateGarageStatus(garage.GarageID, nextActive);
        alert(`Đã cập nhật trạng thái Gara thành công!`);
        fetchGarages();
      } catch (err) {
        alert(err.message || 'Cập nhật trạng thái Gara thất bại.');
      }
    }
  };

  // Formatting utilities
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Đang sửa chữa':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'Đã xác nhận':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'Chờ xác nhận':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Hủy lịch':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-white">ACOH SYSTEM</h1>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Administration</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'overview'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <span>📊</span> Tổng quan hệ thống
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'users'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <span>👥</span> Quản lý tài khoản
          </button>
          <button
            onClick={() => setActiveTab('garages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'garages'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <span>🏬</span> Quản lý Gara liên kết
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === 'profile'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <span>👤</span> Hồ sơ & Đăng xuất
          </button>
        </nav>

        <div className="p-4 border-t border-slate-850">
          <div className="bg-slate-950/40 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-white">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-center text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-4 px-6 md:px-8 flex items-center justify-between sticky top-0 z-15 shadow-xs">
          <div>
            <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">ACOH Portal</span>
            <h2 className="text-lg font-black text-slate-800 dark:text-white capitalize">
              {activeTab === 'overview' && 'Tổng quan hệ thống'}
              {activeTab === 'users' && 'Quản lý tài khoản'}
              {activeTab === 'garages' && 'Quản lý Gara liên kết'}
              {activeTab === 'profile' && 'Hồ sơ & Tiện ích'}
            </h2>
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Hôm nay: <span className="font-bold text-slate-700 dark:text-white">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {statsError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {statsError}
                </div>
              )}

              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                  ))}
                </div>
              ) : stats ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Users count */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">Người dùng</span>
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                          {stats.totalUsers}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xl flex items-center justify-center rounded-2xl border border-indigo-100/30">
                        👥
                      </div>
                    </div>

                    {/* Vehicles count */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">Phương tiện</span>
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                          {stats.totalVehicles}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 text-xl flex items-center justify-center rounded-2xl border border-sky-100/30">
                        🚗
                      </div>
                    </div>

                    {/* Garages count */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">Gara liên kết</span>
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                          {stats.totalGarages}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xl flex items-center justify-center rounded-2xl border border-emerald-100/30">
                        🏬
                      </div>
                    </div>

                    {/* Appointments count */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">Lịch hẹn sửa</span>
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                          {stats.totalAppointments}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xl flex items-center justify-center rounded-2xl border border-amber-100/30">
                        📅
                      </div>
                    </div>

                    {/* Revenue count */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">Tổng doanh thu</span>
                        <p className="text-lg font-black text-slate-800 dark:text-white leading-none mt-1">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xl flex items-center justify-center rounded-2xl border border-rose-100/30">
                        💰
                      </div>
                    </div>
                  </div>

                  {/* Recent Appointments table */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white">📅 Lịch hẹn sửa xe gần đây</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Danh sách 5 đơn đặt lịch bảo dưỡng/sửa chữa mới nhất trên hệ thống.</p>
                    </div>

                    {stats.recentAppointments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">Chưa có lịch hẹn nào được tạo.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                              <th className="px-6 py-4">Khách hàng</th>
                              <th className="px-6 py-4">Biển số xe</th>
                              <th className="px-6 py-4">Gara liên kết</th>
                              <th className="px-6 py-4">Thời gian đặt hẹn</th>
                              <th className="px-6 py-4">Trạng thái</th>
                              <th className="px-6 py-4">Ghi chú của khách</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                            {stats.recentAppointments.map((appt) => (
                              <tr key={appt.AppointmentID} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{appt.CustomerName}</td>
                                <td className="px-6 py-4">
                                  <span className="border border-slate-800 dark:border-slate-450 rounded px-2 py-0.5 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-800 dark:text-slate-200">
                                    {appt.LicensePlate}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-350">{appt.GarageName}</td>
                                <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                                  {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(appt.Status)}`}>
                                    {appt.Status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{appt.Notes || 'Không có ghi chú'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search & filters */}
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo Tên hoặc Email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Lọc theo vai trò (Tất cả)</option>
                      <option value="User">Chủ phương tiện (User)</option>
                      <option value="Garage">Chủ Gara đối tác (Garage)</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition"
                  >
                    Tìm kiếm
                  </button>
                </form>
              </div>

              {usersError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {usersError}
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">👥 Danh sách tài khoản người dùng</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Xem, thay đổi vai trò hoặc chặn/mở khóa hoạt động của thành viên.</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                    {users.length} tài khoản
                  </span>
                </div>

                {loadingUsers ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">Không tìm thấy tài khoản nào khớp với bộ lọc.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4">Họ và tên</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Số điện thoại</th>
                          <th className="px-6 py-4">Vai trò</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4">Ngày đăng ký</th>
                          <th className="px-6 py-4 text-center">Thao tác quản trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                        {users.map((item) => (
                          <tr key={item.UserID} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.FullName}</td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{item.Email}</td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{item.PhoneNumber || 'Chưa cập nhật'}</td>
                            <td className="px-6 py-4">
                              <select
                                value={item.Role}
                                disabled={item.UserID === user?.userId} // Admin không được tự đổi vai trò của mình để tránh mất quyền quản trị
                                onChange={(e) => handleChangeUserRole(item, e.target.value)}
                                className={`font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none cursor-pointer ${
                                  item.Role === 'Admin' ? 'text-violet-600 dark:text-violet-400' :
                                  item.Role === 'Garage' ? 'text-emerald-600 dark:text-emerald-400' :
                                  'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <option value="User">User</option>
                                <option value="Garage">Garage</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black ${
                                item.Status === 'Hoạt động'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-400'
                              }`}>
                                {item.Status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-550 dark:text-slate-400 font-medium">{formatDate(item.CreatedAt)}</td>
                            <td className="px-6 py-4 text-center">
                              {item.UserID !== user?.userId ? (
                                <button
                                  onClick={() => handleToggleUserStatus(item)}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide border transition ${
                                    item.Status === 'Hoạt động'
                                      ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/30 dark:text-rose-400 dark:bg-rose-950/20'
                                      : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/30 dark:text-emerald-400 dark:bg-emerald-950/20'
                                  }`}
                                >
                                  {item.Status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Đang online</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GARAGES */}
          {activeTab === 'garages' && (
            <div className="space-y-6">
              {garagesError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {garagesError}
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white">🏬 Danh sách Gara đối tác liên kết</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Xét duyệt hoặc tạm dừng kích hoạt hoạt động của xưởng Gara.</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                    {garages.length} Gara
                  </span>
                </div>

                {loadingGarages ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : garages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">Không có Gara nào trên hệ thống.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4">Tên Gara</th>
                          <th className="px-6 py-4">Địa chỉ hoạt động</th>
                          <th className="px-6 py-4">Liên hệ</th>
                          <th className="px-6 py-4">Chủ sở hữu</th>
                          <th className="px-6 py-4 text-center">Đánh giá</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4 text-center">Thao tác quản trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                        {garages.map((gara) => (
                          <tr key={gara.GarageID} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{gara.GarageName}</td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate">{gara.Address}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700 dark:text-slate-300">{gara.Phone}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{gara.Email || 'Không có Email'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{gara.OwnerName || 'Chưa liên kết'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{gara.OwnerEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-amber-500 text-sm">⭐ {parseFloat(gara.Rating).toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black ${
                                gara.IsActive
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-400'
                              }`}>
                                {gara.IsActive ? 'Đang hoạt động' : 'Tạm dừng'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleGarageStatus(gara)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide border transition ${
                                  gara.IsActive
                                    ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/30 dark:text-rose-400 dark:bg-rose-950/20'
                                    : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/30 dark:text-emerald-400 dark:bg-emerald-950/20'
                                }`}
                              >
                                {gara.IsActive ? 'Dừng hoạt động' : 'Kích hoạt'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Thông tin quản trị viên</h3>
                <p className="text-violet-600 dark:text-violet-400 font-semibold mb-6">AutoCare Office Helper (Hệ thống)</p>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 mb-6 text-left space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Họ và tên: <span className="font-bold text-slate-700 dark:text-white block mt-0.5 text-sm">{user?.fullName}</span></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email hệ thống: <span className="font-bold text-slate-700 dark:text-white block mt-0.5 text-sm">{user?.email}</span></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Số điện thoại liên hệ: <span className="font-bold text-slate-700 dark:text-white block mt-0.5 text-sm">{user?.phoneNumber || 'Chưa cập nhật'}</span></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vai trò hệ thống: <span className="font-bold text-slate-700 dark:text-white block mt-0.5 text-sm">{user?.role}</span></p>
                </div>

                <div className="flex gap-4 justify-center">
                  <a
                    href="/profile"
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    Hồ sơ & Đổi mật khẩu
                  </a>
                  <button
                    onClick={logout}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
