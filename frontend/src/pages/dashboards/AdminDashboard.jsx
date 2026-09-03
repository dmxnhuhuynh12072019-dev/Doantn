import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useSocket } from '../../context/SocketContext';
import * as adminService from '../../services/adminService';
import * as appointmentService from '../../services/appointmentService';
import NotificationBell from '../../components/notifications/NotificationBell';
import AppointmentDetailViewModal from '../../components/appointments/AppointmentDetailViewModal';

const AdminDashboard = () => {
  const { user, logout, themePreference, updateThemePreference } = useAuth();
  const { confirm, toast } = useModal();
  const { socket } = useSocket();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Tab state: 'overview' | 'users' | 'garages' | 'appointments' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Users States
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Garages States
  const [garages, setGarages] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(false);
  const [garagesError, setGaragesError] = useState('');
  const [garageSearch, setGarageSearch] = useState('');
  const [garageStatusFilter, setGarageStatusFilter] = useState('');

  // System Appointments States (for Appointments monitoring tab)
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptError, setApptError] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [apptSearch, setApptSearch] = useState('');

  // Appointment Detail View Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApptForDetail, setSelectedApptForDetail] = useState(null);

  // Create Garage Modal States
  const [isCreateGarageOpen, setIsCreateGarageOpen] = useState(false);
  const [creatingGarage, setCreatingGarage] = useState(false);
  const [createGarageError, setCreateGarageError] = useState('');
  const [newGarageForm, setNewGarageForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    garageName: '',
    address: '',
    phone: '',
    garageEmail: '',
    rating: 5.0,
  });

  // Link Garage Account Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedGarageForLink, setSelectedGarageForLink] = useState(null);
  const [linkTab, setLinkTab] = useState('create'); // 'create' | 'existing' | 'reset'
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [newAccountForm, setNewAccountForm] = useState({
    fullName: '',
    email: '',
    password: 'password123',
    phoneNumber: '',
  });
  const [selectedUserIdToLink, setSelectedUserIdToLink] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('password123');

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
      const data = await adminService.getUsers(userSearchQuery, userRoleFilter);
      setUsers(data);
    } catch (err) {
      setUsersError(err.message || 'Không thể tải danh sách tài khoản.');
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

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    setApptError('');
    try {
      // Fetch system-wide appointments via garage/system endpoint or fallback to stats recent
      const data = await appointmentService.getAppointmentsGarage().catch(() => []);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setApptError(err.message || 'Không thể tải danh sách lịch hẹn hệ thống.');
    } finally {
      setLoadingAppts(false);
    }
  };

  // Initial mount fetch
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchGarages();
    fetchAppointments();
  }, []);

  // Reload tab specific data on switch
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
      fetchUsers();
      fetchGarages();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'garages') {
      fetchGarages();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'analytics') {
      fetchStats();
      fetchGarages();
    }
  }, [activeTab]);

  // Real-time Socket.IO listener for Admin updates
  useEffect(() => {
    if (!socket) return;

    const handleAdminSync = () => {
      fetchStats();
      fetchUsers();
      fetchGarages();
      fetchAppointments();
    };

    socket.on('notification_received', handleAdminSync);
    socket.on('unread_count_updated', handleAdminSync);

    return () => {
      socket.off('notification_received', handleAdminSync);
      socket.off('unread_count_updated', handleAdminSync);
    };
  }, [socket]);

  // --- ACTIONS ---
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.Status === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
    const isLocking = nextStatus === 'Bị khóa';
    const isConfirmed = await confirm({
      title: isLocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      message: `Bạn có chắc chắn muốn ${isLocking ? 'khóa' : 'mở khóa'} tài khoản của "${targetUser.FullName}" (${targetUser.Email})?`,
      confirmText: isLocking ? 'Khóa tài khoản' : 'Mở khóa',
      cancelText: 'Hủy',
      type: isLocking ? 'danger' : 'warning',
    });

    if (isConfirmed) {
      try {
        await adminService.updateUserStatus(targetUser.UserID, nextStatus);
        toast.success(`Đã ${isLocking ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
        fetchUsers();
        if (activeTab === 'overview') fetchStats();
      } catch (err) {
        toast.error(err.message || 'Cập nhật trạng thái tài khoản thất bại.');
      }
    }
  };

  const handleChangeUserRole = async (targetUser, newRole) => {
    if (targetUser.Role === newRole) return;
    const isConfirmed = await confirm({
      title: 'Đổi vai trò người dùng',
      message: `Bạn có chắc chắn muốn phân quyền tài khoản "${targetUser.FullName}" thành vai trò "${newRole}"?`,
      confirmText: 'Cập nhật vai trò',
      cancelText: 'Hủy',
      type: 'warning',
    });

    if (isConfirmed) {
      try {
        await adminService.updateUserRole(targetUser.UserID, newRole);
        toast.success(`Đã cập nhật vai trò người dùng thành "${newRole}"!`);
        fetchUsers();
        if (activeTab === 'overview') fetchStats();
      } catch (err) {
        toast.error(err.message || 'Cập nhật vai trò người dùng thất bại.');
      }
    }
  };

  const handleToggleGarageStatus = async (garage) => {
    const nextActive = !garage.IsActive;
    const isDeactivating = !nextActive;
    const isConfirmed = await confirm({
      title: isDeactivating ? 'Tạm dừng hoạt động Gara' : 'Kích hoạt hoạt động Gara',
      message: `Bạn có chắc chắn muốn ${nextActive ? 'kích hoạt' : 'tạm dừng'} hoạt động của Gara "${garage.GarageName}"?`,
      confirmText: isDeactivating ? 'Tạm dừng Gara' : 'Kích hoạt ngay',
      cancelText: 'Hủy',
      type: isDeactivating ? 'danger' : 'success',
    });

    if (isConfirmed) {
      try {
        await adminService.updateGarageStatus(garage.GarageID, nextActive);
        toast.success(`Đã cập nhật trạng thái Gara "${garage.GarageName}"!`);
        fetchGarages();
        if (activeTab === 'overview') fetchStats();
      } catch (err) {
        toast.error(err.message || 'Cập nhật trạng thái Gara thất bại.');
      }
    }
  };

  const handleCreateGarageSubmit = async (e) => {
    e.preventDefault();
    setCreateGarageError('');
    setCreatingGarage(true);

    try {
      if (!newGarageForm.fullName || !newGarageForm.email || !newGarageForm.password || !newGarageForm.garageName || !newGarageForm.address) {
        throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      }

      const payload = {
        fullName: newGarageForm.fullName.trim(),
        email: newGarageForm.email.trim(),
        password: newGarageForm.password,
        phoneNumber: newGarageForm.phoneNumber?.trim() || undefined,
        garageName: newGarageForm.garageName.trim(),
        address: newGarageForm.address.trim(),
        phone: newGarageForm.phone?.trim() || undefined,
        garageEmail: newGarageForm.garageEmail?.trim() || undefined,
        rating: Number(newGarageForm.rating) || 5.0,
      };

      await adminService.createGarage(payload);
      toast.success('Đã khởi tạo tài khoản và hồ sơ Gara thành công!');
      setIsCreateGarageOpen(false);
      setNewGarageForm({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        garageName: '',
        address: '',
        phone: '',
        garageEmail: '',
        rating: 5.0,
      });

      // Reload data
      fetchGarages();
      fetchUsers();
      fetchStats();
    } catch (err) {
      setCreateGarageError(err.message || 'Khởi tạo tài khoản Gara thất bại.');
    } finally {
      setCreatingGarage(false);
    }
  };

  const handleViewAppointmentDetail = (appt) => {
    setSelectedApptForDetail(appt);
    setIsDetailModalOpen(true);
  };

  const handleOpenLinkModal = (gara) => {
    setSelectedGarageForLink(gara);
    setLinkError('');
    setCreatedCredentials(null);
    setNewAccountForm({
      fullName: gara.GarageName ? `Quản lý ${gara.GarageName}` : 'Đại diện Gara',
      email: gara.Email || `garage${gara.GarageID}@autocare.vn`,
      password: 'password123',
      phoneNumber: gara.Phone || '',
    });
    setLinkTab(gara.UserID ? 'existing' : 'create');
    setSelectedUserIdToLink(gara.UserID ? String(gara.UserID) : '');
    setResetPasswordVal('password123');
    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGarageForLink) return;
    setLinkingLoading(true);
    setLinkError('');
    try {
      if (linkTab === 'create') {
        if (!newAccountForm.fullName || !newAccountForm.email || !newAccountForm.password) {
          throw new Error('Vui lòng điền đầy đủ họ tên, email và mật khẩu!');
        }
        const res = await adminService.linkGarageUser(selectedGarageForLink.GarageID, {
          createNewUser: true,
          fullName: newAccountForm.fullName.trim(),
          email: newAccountForm.email.trim(),
          password: newAccountForm.password,
          phoneNumber: newAccountForm.phoneNumber?.trim() || undefined,
        });
        toast.success(res.message || 'Đã tạo và liên kết tài khoản thành công!');
        setCreatedCredentials({
          email: newAccountForm.email.trim(),
          password: newAccountForm.password,
          fullName: newAccountForm.fullName.trim(),
        });
        fetchGarages();
        fetchUsers();
      } else if (linkTab === 'existing') {
        if (!selectedUserIdToLink) {
          throw new Error('Vui lòng chọn một tài khoản người dùng!');
        }
        const res = await adminService.linkGarageUser(selectedGarageForLink.GarageID, {
          createNewUser: false,
          userId: Number(selectedUserIdToLink),
        });
        toast.success(res.message || 'Đã liên kết tài khoản thành công!');
        setIsLinkModalOpen(false);
        fetchGarages();
        fetchUsers();
      } else if (linkTab === 'reset') {
        if (!resetPasswordVal) {
          throw new Error('Vui lòng nhập mật khẩu mới!');
        }
        const res = await adminService.resetGaragePassword(selectedGarageForLink.GarageID, resetPasswordVal);
        toast.success(res.message || 'Đã đổi mật khẩu tài khoản thành công!');
        setCreatedCredentials({
          email: selectedGarageForLink.OwnerEmail || selectedGarageForLink.Email,
          password: resetPasswordVal,
          fullName: selectedGarageForLink.OwnerName,
        });
      }
    } catch (err) {
      setLinkError(err.message || 'Thao tác liên kết tài khoản thất bại.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleQuickLoginAsGarage = async (gara) => {
    if (!gara.UserID) {
      handleOpenLinkModal(gara);
      return;
    }
    try {
      toast.info(`Đang xác thực vào Gara "${gara.GarageName}"...`);
      const res = await adminService.impersonateGarage(gara.GarageID);
      toast.success(`Đăng nhập thành công! Đang chuyển hướng...`);
      localStorage.setItem('token', res.token);
      setTimeout(() => {
        window.location.href = '/garage/dashboard';
      }, 400);
    } catch (err) {
      toast.error(err.message || 'Không thể đăng nhập vào Gara này.');
    }
  };

  // --- FORMATTING UTILITIES ---
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40';
      case 'Đang sửa chữa':
        return 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40';
      case 'Đã xác nhận':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40';
      case 'Chờ xác nhận':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40';
      case 'Hủy lịch':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  // --- FILTERED LISTS ---
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearchQuery.trim() ||
      (u.FullName && u.FullName.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.Email && u.Email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.PhoneNumber && u.PhoneNumber.includes(userSearchQuery));

    const matchRole = !userRoleFilter || u.Role === userRoleFilter;
    const matchStatus = !userStatusFilter || u.Status === userStatusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const filteredGarages = garages.filter((g) => {
    const matchSearch =
      !garageSearch.trim() ||
      (g.GarageName && g.GarageName.toLowerCase().includes(garageSearch.toLowerCase())) ||
      (g.Address && g.Address.toLowerCase().includes(garageSearch.toLowerCase())) ||
      (g.Phone && g.Phone.includes(garageSearch)) ||
      (g.OwnerName && g.OwnerName.toLowerCase().includes(garageSearch.toLowerCase()));

    const matchStatus =
      garageStatusFilter === ''
        ? true
        : garageStatusFilter === 'active'
        ? g.IsActive
        : !g.IsActive;

    return matchSearch && matchStatus;
  });

  const displayAppointments =
    appointments.length > 0
      ? appointments
      : stats?.recentAppointments || [];

  const filteredAppointments = displayAppointments.filter((a) => {
    const matchStatus =
      apptStatusFilter === 'all' || a.Status === apptStatusFilter;
    const matchSearch =
      !apptSearch.trim() ||
      (a.LicensePlate && a.LicensePlate.toLowerCase().includes(apptSearch.toLowerCase())) ||
      (a.CustomerName && a.CustomerName.toLowerCase().includes(apptSearch.toLowerCase())) ||
      (a.GarageName && a.GarageName.toLowerCase().includes(apptSearch.toLowerCase()));

    return matchStatus && matchSearch;
  });

  // User Stats breakdown
  const userCounts = {
    total: users.length,
    active: users.filter((u) => u.Status === 'Hoạt động').length,
    locked: users.filter((u) => u.Status !== 'Hoạt động').length,
    drivers: users.filter((u) => u.Role === 'User').length,
    garages: users.filter((u) => u.Role === 'Garage').length,
    admins: users.filter((u) => u.Role === 'Admin').length,
  };

  const garageCounts = {
    total: garages.length,
    active: garages.filter((g) => g.IsActive).length,
    inactive: garages.filter((g) => !g.IsActive).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans">
      
      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION (Matching Garage Style with Royal Violet Admin Theme)  */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 flex flex-col shrink-0 border-r border-slate-200/80 dark:border-slate-700 shadow-2xs">
        
        {/* Brand Logo Header */}
        <Link
          to="/user/dashboard"
          className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750/40 transition group cursor-pointer"
          title="Về Trang chủ AutoCare Portal"
        >
          {/* Logo Badge with Royal Violet Gradient */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20 shrink-0 group-hover:scale-105 transition-transform text-lg font-bold">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight text-violet-700 dark:text-violet-400 uppercase leading-none">
                ACOH SYSTEM
              </h1>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 rounded">
                Super Admin
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight mt-0.5">
              TRUNG TÂM ĐIỀU HÀNH
            </p>
          </div>
        </Link>

        {/* Navigation Menu Items */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {[
            {
              id: 'overview',
              title: 'Tổng quan hệ thống',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
            },
            {
              id: 'users',
              title: 'Quản lý tài khoản',
              count: userCounts.total || null,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
            },
            {
              id: 'garages',
              title: 'Quản lý Gara liên kết',
              count: garageCounts.total || null,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
            },
            {
              id: 'appointments',
              title: 'Giám sát lịch hẹn',
              count: stats?.totalAppointments || null,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              id: 'analytics',
              title: 'Báo cáo & Doanh thu',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              id: 'settings',
              title: 'Cài đặt & Hồ sơ',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-extrabold shadow-2xs border border-violet-100 dark:border-violet-900/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
                {item.count !== null && item.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-black">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-violet-50/70 dark:bg-slate-700/40 rounded-2xl p-4 text-center border border-violet-100/80 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs text-sm">
              🛡️
            </div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white">Bảo Mật & Quản Trị Hệ Thống</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
              Kiểm soát nền tảng và điều phối đa dịch vụ
            </p>
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Sticky Header Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 py-3.5 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xxs font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                🛡️ Cổng Quản Trị Cấp Cao
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-none">
                {user?.fullName || 'Quản trị viên'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
              {activeTab === 'overview' && 'Tổng quan hệ thống & Vận hành'}
              {activeTab === 'users' && 'Quản lý tài khoản & Phân quyền'}
              {activeTab === 'garages' && 'Quản lý mạng lưới Gara liên kết'}
              {activeTab === 'appointments' && 'Giám sát lịch hẹn toàn hệ thống'}
              {activeTab === 'analytics' && 'Báo cáo doanh thu & Thống kê nền tảng'}
              {activeTab === 'settings' && 'Cài đặt hệ thống & Hồ sơ cá nhân'}
            </h2>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Quick Action Button: Create Garage */}
            <button
              onClick={() => {
                setCreateGarageError('');
                setIsCreateGarageOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs shadow-violet-600/20 transition cursor-pointer"
              title="Khởi tạo tài khoản và hồ sơ Gara mới"
            >
              <span>➕</span>
              <span>Cấp Gara Mới</span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                const next = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'system' : 'light';
                updateThemePreference(next);
              }}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer text-sm"
              title="Đổi chế độ giao diện Sáng / Tối"
            >
              {themePreference === 'light' ? '☀️' : themePreference === 'dark' ? '🌙' : '💻'}
            </button>

            {/* Admin Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user?.fullName || 'Super Admin'}
                  </p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold leading-none mt-0.5">
                    Quản trị viên Cấp cao
                  </p>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 p-2 animate-in fade-in duration-150">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user?.fullName || 'Super Admin'}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 text-[10px] font-black rounded-md">
                          🛡️ Super Admin
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{user?.email}</p>
                    </div>

                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition flex items-center gap-2"
                    >
                      <span>🏠</span>
                      <span>Về Trang chủ Portal</span>
                    </Link>
                    <button
                      onClick={() => { setActiveTab('settings'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span>Hồ sơ & Cài đặt hệ thống</span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>🚪</span>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Body Container */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW                                                           */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* System Hero Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold mb-3 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Hệ thống hoạt động bình thường • 100% Online</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                      Chào mừng, {user?.fullName || 'Quản trị viên'}!
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed font-medium">
                      Bảng điều khiển trung tâm ACOH Portal. Giám sát toàn diện người dùng, phương tiện, mạng lưới Gara và luồng dòng tiền theo thời gian thực.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        fetchStats();
                        fetchUsers();
                        fetchGarages();
                        toast.success('Đã làm mới dữ liệu hệ thống!');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>Làm mới dữ liệu</span>
                    </button>
                    <button
                      onClick={() => {
                        setCreateGarageError('');
                        setIsCreateGarageOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-violet-500/25 cursor-pointer"
                    >
                      <span>➕</span>
                      <span>Cấp Gara đối tác</span>
                    </button>
                  </div>
                </div>

                {/* Decorative glow circles */}
                <div className="absolute -right-12 -top-12 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-1/3 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
              </div>

              {statsError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {statsError}
                </div>
              )}

              {/* 5 Core KPI Metric Cards */}
              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  
                  {/* Card 1: Users */}
                  <div 
                    onClick={() => setActiveTab('users')}
                    className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs hover:border-violet-300 dark:hover:border-violet-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Người dùng
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        👥
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalUsers || 0}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{userCounts.drivers} chủ xe</span>
                      <span className="text-violet-600 dark:text-violet-400 font-bold">Xem danh sách →</span>
                    </div>
                  </div>

                  {/* Card 2: Vehicles */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Phương tiện
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg">
                        🚗
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalVehicles || 0}
                    </div>
                    <div className="mt-2 flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Đã đăng ký trong hệ sinh thái</span>
                    </div>
                  </div>

                  {/* Card 3: Garages */}
                  <div 
                    onClick={() => setActiveTab('garages')}
                    className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Gara đối tác
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        🏬
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalGarages || 0}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{garageCounts.active} đang hoạt động</span>
                      <span>Quản lý →</span>
                    </div>
                  </div>

                  {/* Card 4: Appointments */}
                  <div 
                    onClick={() => setActiveTab('appointments')}
                    className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Lịch hẹn sửa
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        📅
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats.totalAppointments || 0}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Toàn hệ thống</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Giám sát →</span>
                    </div>
                  </div>

                  {/* Card 5: Revenue */}
                  <div 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs sm:col-span-2 lg:col-span-1 hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Tổng doanh thu
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        💰
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate" title={formatCurrency(stats.totalRevenue)}>
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Sổ bảo dưỡng</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">Chi tiết →</span>
                    </div>
                  </div>

                </div>
              ) : null}

              {/* Quick Admin Actions & Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Action Card 1: Users management quick link */}
                <div 
                  onClick={() => setActiveTab('users')}
                  className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      Quản lý Tài khoản & Phân quyền
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Phân vai trò (User, Garage, Admin), kiểm tra và khóa/mở khóa tài khoản bảo mật.
                    </p>
                  </div>
                </div>

                {/* Action Card 2: Garages management quick link */}
                <div 
                  onClick={() => setActiveTab('garages')}
                  className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    🏬
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Mạng lưới Gara Đối tác
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Khởi tạo cấp xưởng mới, kiểm duyệt chất lượng đánh giá và tình trạng hoạt động.
                    </p>
                  </div>
                </div>

                {/* Action Card 3: System Analytics quick link */}
                <div 
                  onClick={() => setActiveTab('analytics')}
                  className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    📈
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Báo cáo Vận hành & Doanh thu
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Theo dõi lưu lượng đặt hẹn, doanh thu bảo dưỡng và chỉ số hiệu năng Gara.
                    </p>
                  </div>
                </div>

              </div>

              {/* Recent System Appointments Table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Lịch hẹn tiếp nhận gần đây trên hệ thống
                      </h3>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Danh sách các đơn đặt lịch sửa chữa & bảo dưỡng mới nhất của toàn mạng lưới
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem toàn bộ lịch hẹn ({stats?.totalAppointments || 0})</span>
                    <span>→</span>
                  </button>
                </div>

                {!stats?.recentAppointments || stats.recentAppointments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Chưa có lịch hẹn nào được ghi nhận trên hệ thống.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-3.5">Khách hàng</th>
                          <th className="px-6 py-3.5">Biển số xe</th>
                          <th className="px-6 py-3.5">Gara tiếp nhận</th>
                          <th className="px-6 py-3.5">Thời gian đặt hẹn</th>
                          <th className="px-6 py-3.5">Trạng thái</th>
                          <th className="px-6 py-3.5">Ghi chú</th>
                          <th className="px-6 py-3.5 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {stats.recentAppointments.map((appt) => (
                          <tr key={appt.AppointmentID} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                              {appt.CustomerName}
                            </td>
                            <td className="px-6 py-4">
                              <span className="border border-slate-800 dark:border-slate-500 rounded-md px-2 py-0.5 bg-white dark:bg-slate-900 text-[11px] font-black text-slate-800 dark:text-slate-200 shadow-2xs">
                                {appt.LicensePlate}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                              {appt.GarageName}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                              {formatDateTime(appt.AppointmentDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeColor(appt.Status)}`}>
                                {appt.Status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 truncate max-w-xs">
                              {appt.Notes || 'Không có ghi chú'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewAppointmentDetail(appt)}
                                className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold text-xs hover:bg-violet-100 dark:hover:bg-violet-900/60 transition cursor-pointer"
                              >
                                Xem
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

          {/* ========================================================================= */}
          {/* TAB 2: USERS MANAGEMENT                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Header & Filter Controls Bar */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>👥</span>
                      <span>Danh sách tài khoản hệ thống</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Quản lý tài khoản, thay đổi quyền hạn hoặc khóa/mở khóa bảo vệ hệ thống
                    </p>
                  </div>
                  
                  {/* Status counter badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      Tổng: {users.length}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
                      Hoạt động: {userCounts.active}
                    </span>
                    {userCounts.locked > 0 && (
                      <span className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
                        Bị khóa: {userCounts.locked}
                      </span>
                    )}
                  </div>
                </div>

                {/* Filter and Search Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo Tên, Email, SĐT..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>

                  <div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 font-medium transition cursor-pointer"
                    >
                      <option value="">Tất cả vai trò ({users.length})</option>
                      <option value="User">Chủ phương tiện ({userCounts.drivers})</option>
                      <option value="Garage">Chủ Gara đối tác ({userCounts.garages})</option>
                      <option value="Admin">Quản trị viên ({userCounts.admins})</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 font-medium transition cursor-pointer"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="Hoạt động">Đang hoạt động</option>
                      <option value="Bị khóa">Bị khóa / Tạm khóa</option>
                    </select>
                  </div>
                </div>
              </div>

              {usersError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {usersError}
                </div>
              )}

              {/* Users Table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                {loadingUsers ? (
                  <div className="py-16 flex flex-col justify-center items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
                    <span className="text-xs text-slate-400">Đang tải danh sách tài khoản...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Không tìm thấy tài khoản nào khớp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4">Tài khoản & Email</th>
                          <th className="px-6 py-4">Số điện thoại</th>
                          <th className="px-6 py-4">Vai trò hệ thống</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4">Ngày đăng ký</th>
                          <th className="px-6 py-4 text-center">Thao tác quản trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {filteredUsers.map((item) => {
                          const isCurrentUser = item.UserID === user?.userId;
                          return (
                            <tr key={item.UserID} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-colors">
                              
                              {/* Name & Avatar */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                                    item.Role === 'Admin'
                                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                                      : item.Role === 'Garage'
                                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                                  }`}>
                                    {item.FullName ? item.FullName.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <span>{item.FullName}</span>
                                      {isCurrentUser && (
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 rounded">
                                          Bạn
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">{item.Email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Phone */}
                              <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                                {item.PhoneNumber || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                              </td>

                              {/* Role */}
                              <td className="px-6 py-4">
                                <select
                                  value={item.Role}
                                  disabled={isCurrentUser}
                                  onChange={(e) => handleChangeUserRole(item, e.target.value)}
                                  className={`font-black text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 focus:outline-none transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                                    item.Role === 'Admin'
                                      ? 'text-violet-600 dark:text-violet-400'
                                      : item.Role === 'Garage'
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <option value="User">👤 Chủ xe (User)</option>
                                  <option value="Garage">🏬 Gara (Garage)</option>
                                  <option value="Admin">🛡️ Quản trị (Admin)</option>
                                </select>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  item.Status === 'Hoạt động'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}>
                                  {item.Status}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                {formatDate(item.CreatedAt)}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-center">
                                {!isCurrentUser ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(item)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide border transition cursor-pointer ${
                                      item.Status === 'Hoạt động'
                                        ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/40 dark:text-rose-400 dark:bg-rose-950/30'
                                        : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/40 dark:text-emerald-400 dark:bg-emerald-950/30'
                                    }`}
                                  >
                                    {item.Status === 'Hoạt động' ? '🔒 Khóa' : '🔓 Mở khóa'}
                                  </button>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Đang đăng nhập</span>
                                )}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GARAGES MANAGEMENT                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'garages' && (
            <div className="space-y-6">
              
              {/* Header & Actions Bar */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏬</span>
                    <span>Mạng lưới Gara đối tác liên kết ({garages.length})</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Quản lý danh sách xưởng dịch vụ ủy quyền, kiểm tra đánh giá và cấp tài khoản xưởng mới
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setCreateGarageError('');
                      setIsCreateGarageOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>➕</span>
                    <span>Thêm Gara đối tác mới</span>
                  </button>
                </div>
              </div>

              {/* Filters for Garages */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo Tên Gara, Địa chỉ, Hotline, Chủ xưởng..."
                  value={garageSearch}
                  onChange={(e) => setGarageSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
                />

                <select
                  value={garageStatusFilter}
                  onChange={(e) => setGarageStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 font-medium transition cursor-pointer"
                >
                  <option value="">Tất cả trạng thái hoạt động</option>
                  <option value="active">Đang hoạt động ({garageCounts.active})</option>
                  <option value="inactive">Đang tạm dừng ({garageCounts.inactive})</option>
                </select>
              </div>

              {garagesError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {garagesError}
                </div>
              )}

              {/* Garages Table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                {loadingGarages ? (
                  <div className="py-16 flex flex-col justify-center items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
                    <span className="text-xs text-slate-400">Đang tải danh sách Gara...</span>
                  </div>
                ) : filteredGarages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Không tìm thấy Gara nào khớp với điều kiện tìm kiếm.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4">Tên Gara Đối tác</th>
                          <th className="px-6 py-4">Địa chỉ hoạt động</th>
                          <th className="px-6 py-4">Hotline & Email Gara</th>
                          <th className="px-6 py-4">Chủ sở hữu đại diện</th>
                          <th className="px-6 py-4 text-center">Đánh giá</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4 text-center">Thao tác quản trị</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {filteredGarages.map((gara) => (
                          <tr key={gara.GarageID} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-colors">
                            
                            {/* Garage Name */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                                  🏬
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 dark:text-white">
                                    {gara.GarageName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">Mã Gara: #{gara.GarageID}</div>
                                </div>
                              </div>
                            </td>

                            {/* Address */}
                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 max-w-xs truncate" title={gara.Address}>
                              {gara.Address}
                            </td>

                            {/* Phone & Email */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{gara.Phone}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{gara.Email || 'Không có Email'}</div>
                            </td>

                            {/* Owner */}
                            <td className="px-6 py-4">
                              {gara.OwnerName ? (
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span className="text-xs">👤</span>
                                    <span>{gara.OwnerName}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{gara.OwnerEmail}</div>
                                  {gara.OwnerPhone && (
                                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                      <span>📞</span>
                                      <span>{gara.OwnerPhone}</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleOpenLinkModal(gara)}
                                    className="mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition hover:underline"
                                  >
                                    <span>🔄</span> Đổi liên kết
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40">
                                    <span>⚠️</span> Chưa liên kết
                                  </span>
                                  <div className="mt-1.5">
                                    <button
                                      onClick={() => handleOpenLinkModal(gara)}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition cursor-pointer shadow-xs"
                                    >
                                      <span>🔗</span> + Liên kết tài khoản
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Rating */}
                            <td className="px-6 py-4 text-center">
                              <span className="font-black text-amber-500 text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 inline-flex items-center gap-1">
                                <span>⭐</span>
                                <span>{parseFloat(gara.Rating || 5.0).toFixed(1)}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                gara.IsActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400'
                              }`}>
                                {gara.IsActive ? 'Đang hoạt động' : 'Tạm dừng'}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Quick Login into Garage */}
                                <button
                                  onClick={() => handleQuickLoginAsGarage(gara)}
                                  title="Đăng nhập trực tiếp vào Gara này để quản lý và xác nhận đặt lịch"
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-xs border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <span>⚡</span>
                                  <span>Vào Gara</span>
                                </button>

                                {/* Link Modal Button */}
                                <button
                                  onClick={() => handleOpenLinkModal(gara)}
                                  title="Cấp hoặc thay đổi tài khoản liên kết"
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <span>🔗</span>
                                  <span>{gara.UserID ? 'Đổi TK' : 'Liên kết'}</span>
                                </button>

                                {/* Toggle Active */}
                                <button
                                  onClick={() => handleToggleGarageStatus(gara)}
                                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide border transition cursor-pointer ${
                                    gara.IsActive
                                      ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/40 dark:text-rose-400 dark:bg-rose-950/30'
                                      : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/40 dark:text-emerald-400 dark:bg-emerald-950/30'
                                  }`}
                                >
                                  {gara.IsActive ? 'Tạm dừng' : 'Kích hoạt'}
                                </button>
                              </div>
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

          {/* ========================================================================= */}
          {/* TAB 4: APPOINTMENTS MONITORING                                            */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Header & Status Filter Pills */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>📅</span>
                      <span>Giám sát lịch hẹn tiếp nhận toàn hệ thống</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Theo dõi tiến độ tiếp nhận, sửa chữa và bàn giao xe tại tất cả các Gara
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fetchAppointments();
                      toast.success('Đã cập nhật danh sách lịch hẹn!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-650 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🔄</span>
                    <span>Làm mới</span>
                  </button>
                </div>

                {/* Status Filter Tabs (Matching Garage UI) */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {[
                    { id: 'all', label: 'Tất cả trạng thái' },
                    { id: 'Chờ xác nhận', label: 'Chờ xác nhận' },
                    { id: 'Đã xác nhận', label: 'Đã xác nhận' },
                    { id: 'Đang sửa chữa', label: 'Đang sửa chữa' },
                    { id: 'Hoàn thành', label: 'Hoàn thành' },
                    { id: 'Hủy lịch', label: 'Đã hủy' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setApptStatusFilter(filter.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        apptStatusFilter === filter.id
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo Biển số xe, Khách hàng, Tên Gara..."
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              {apptError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                  {apptError}
                </div>
              )}

              {/* Appointments Monitoring Table */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden">
                {loadingAppts ? (
                  <div className="py-16 flex flex-col justify-center items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
                    <span className="text-xs text-slate-400">Đang tải danh sách lịch hẹn...</span>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    Không có lịch hẹn nào khớp với bộ lọc.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4">Khách hàng</th>
                          <th className="px-6 py-4">Biển số & Xe</th>
                          <th className="px-6 py-4">Gara tiếp nhận</th>
                          <th className="px-6 py-4">Thời gian đặt</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4">Nội dung yêu cầu</th>
                          <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {filteredAppointments.map((appt) => (
                          <tr key={appt.AppointmentID} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                              {appt.CustomerName || appt.FullName || 'Khách hàng'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="border border-slate-800 dark:border-slate-500 rounded-md px-2 py-0.5 bg-white dark:bg-slate-900 text-[11px] font-black text-slate-800 dark:text-slate-200 shadow-2xs">
                                {appt.LicensePlate}
                              </span>
                              {appt.Brand && (
                                <div className="text-[10px] text-slate-400 mt-1">{appt.Brand} {appt.Model}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                              {appt.GarageName || 'Gara Đối Tác'}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                              {formatDateTime(appt.AppointmentDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeColor(appt.Status)}`}>
                                {appt.Status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 truncate max-w-xs">
                              {appt.Notes || appt.ServiceRequirement || 'Không có ghi chú'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleViewAppointmentDetail(appt)}
                                className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold text-xs hover:bg-violet-100 dark:hover:bg-violet-900/60 transition cursor-pointer"
                              >
                                Xem chi tiết
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

          {/* ========================================================================= */}
          {/* TAB 5: ANALYTICS & REVENUE                                                */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Header Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📈</span>
                  <span>Báo cáo Tài chính & Thống kê Tăng trưởng Toàn Hệ thống</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Tổng hợp số liệu doanh thu bảo dưỡng, tỷ trọng tài khoản người dùng và hiệu suất vận hành của các xưởng đối tác
                </p>
              </div>

              {/* Financial Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Tổng giá trị giao dịch (GMV)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {formatCurrency(stats?.totalRevenue)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Doanh thu tích lũy từ tất cả các phiếu bảo dưỡng/sửa chữa đã hoàn tất
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Tỷ lệ Gara hoạt động
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                    {garages.length > 0 ? ((garageCounts.active / garages.length) * 100).toFixed(0) : 100}%
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {garageCounts.active} / {garages.length} Gara đang sẵn sàng tiếp nhận xe
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Quy mô Người dùng & Xe
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">
                    {stats?.totalUsers || 0} users / {stats?.totalVehicles || 0} xe
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Trung bình mỗi tài khoản quản lý {(stats?.totalVehicles && stats?.totalUsers) ? (stats.totalVehicles / stats.totalUsers).toFixed(1) : '1.0'} phương tiện
                  </p>
                </div>

              </div>

              {/* Role Distribution Breakdown */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4">
                  Phân bố tài khoản người dùng theo vai trò
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>👤 Chủ phương tiện (User)</span>
                      <span>{userCounts.drivers} ({users.length > 0 ? ((userCounts.drivers / users.length) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${users.length > 0 ? (userCounts.drivers / users.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>🏬 Chủ Gara đối tác (Garage)</span>
                      <span>{userCounts.garages} ({users.length > 0 ? ((userCounts.garages / users.length) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${users.length > 0 ? (userCounts.garages / users.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>🛡️ Quản trị viên (Admin)</span>
                      <span>{userCounts.admins} ({users.length > 0 ? ((userCounts.admins / users.length) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${users.length > 0 ? (userCounts.admins / users.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SETTINGS & ADMIN PROFILE                                           */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-8 text-center">
                
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-700 via-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-600/30">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {user?.fullName || 'Super Administrator'}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 text-xs font-black rounded-full mt-2">
                  <span>🛡️</span>
                  <span>Quản trị viên Hệ thống Cấp cao</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 mt-6 text-left space-y-3.5 border border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Họ và tên:</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{user?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email quản trị:</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại liên hệ:</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{user?.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quyền hạn hệ thống:</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400 text-sm">Full Administrative Root (All Modules)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  <Link
                    to="/user/dashboard"
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition flex items-center gap-1.5"
                  >
                    <span>🏠</span>
                    <span>Về Trang chủ Portal</span>
                  </Link>

                  <a
                    href="/profile"
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-650 transition flex items-center gap-1.5"
                  >
                    <span>🔑</span>
                    <span>Đổi mật khẩu</span>
                  </a>

                  <button
                    onClick={logout}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: KHỞI TẠO TÀI KHOẢN GARA MỚI TỪ ADMIN (Matching Style)              */}
      {/* ========================================================================= */}
      {isCreateGarageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl shadow-xs border border-violet-100 dark:border-violet-900/40">
                  🏬
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Cấp tài khoản & Khởi tạo Gara đối tác
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tạo tài khoản quản lý và thông tin xưởng dịch vụ trực tiếp vào hệ sinh thái
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateGarageOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGarageSubmit} className="p-6 space-y-5">
              
              {createGarageError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{createGarageError}</span>
                </div>
              )}

              {/* Group 1: Thông tin tài khoản đăng nhập */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>👤</span>
                  <span>1. Thông tin tài khoản chủ Gara (Đăng nhập)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Họ và tên chủ / đại diện Gara <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Huấn"
                      value={newGarageForm.fullName}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Số điện thoại cá nhân
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={newGarageForm.phoneNumber}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email đăng nhập <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="gara.autocare@acoh.vn"
                      value={newGarageForm.email}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Tối thiểu 6 ký tự"
                      value={newGarageForm.password}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Thông tin trung tâm Gara */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span>🏢</span>
                  <span>2. Thông tin xưởng dịch vụ Gara</span>
                </h4>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên Gara đối tác <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Gara Auto Huấn Đặng"
                      value={newGarageForm.garageName}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, garageName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ hoạt động của Gara <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tứ Dân, Khoái Châu, Hưng Yên"
                      value={newGarageForm.address}
                      onChange={(e) => setNewGarageForm({ ...newGarageForm, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hotline xưởng dịch vụ
                      </label>
                      <input
                        type="tel"
                        placeholder="Để trống sẽ dùng SĐT cá nhân"
                        value={newGarageForm.phone}
                        onChange={(e) => setNewGarageForm({ ...newGarageForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email liên hệ của Gara
                      </label>
                      <input
                        type="email"
                        placeholder="Để trống sẽ dùng Email đăng nhập"
                        value={newGarageForm.garageEmail}
                        onChange={(e) => setNewGarageForm({ ...newGarageForm, garageEmail: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateGarageOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingGarage}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {creatingGarage ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang khởi tạo...</span>
                    </>
                  ) : (
                    <>
                      <span>✔️</span>
                      <span>Tạo tài khoản Gara</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIÊN KẾT TÀI KHOẢN GARA                                            */}
      {/* ========================================================================= */}
      {isLinkModalOpen && selectedGarageForLink && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/30">
                  🔗
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Liên kết Tài khoản Gara
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {selectedGarageForLink.GarageName} (#{selectedGarageForLink.GarageID})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Success Credentials Banner */}
              {createdCredentials ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <span>🎉</span>
                    <span>Liên kết tài khoản thành công!</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Bạn có thể sử dụng thông tin sau để đăng nhập vào Gara hoặc bấm nút <strong>"Vào Gara ngay"</strong> bên dưới để hệ thống tự động đăng nhập:
                  </p>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{createdCredentials.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email đăng nhập:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 select-all">{createdCredentials.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mật khẩu:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 select-all">{createdCredentials.password}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickLoginAsGarage(selectedGarageForLink)}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>⚡</span>
                      <span>Vào Gara ngay (Tự động đăng nhập)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`Email: ${createdCredentials.email} | Mật khẩu: ${createdCredentials.password}`);
                        toast.success('Đã sao chép tài khoản vào bộ nhớ tạm!');
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Sao chép thông tin"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Current Status Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Trạng thái hiện tại: </span>
                      {selectedGarageForLink.OwnerName ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Đã liên kết với {selectedGarageForLink.OwnerName} ({selectedGarageForLink.OwnerEmail})
                        </span>
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400">Chưa liên kết tài khoản nào</span>
                      )}
                    </div>
                    {selectedGarageForLink.UserID && (
                      <button
                        type="button"
                        onClick={() => handleQuickLoginAsGarage(selectedGarageForLink)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 border border-violet-200 dark:border-violet-800 transition cursor-pointer"
                      >
                        ⚡ Vào Gara
                      </button>
                    )}
                  </div>

                  {/* Tabs Navigation */}
                  <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLinkTab('create')}
                      className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        linkTab === 'create'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Cấp tài khoản mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkTab('existing')}
                      className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        linkTab === 'existing'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>👥</span>
                      <span>Chọn tài khoản có sẵn</span>
                    </button>
                    {selectedGarageForLink.UserID && (
                      <button
                        type="button"
                        onClick={() => setLinkTab('reset')}
                        className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          linkTab === 'reset'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>🔑</span>
                        <span>Đổi mật khẩu</span>
                      </button>
                    )}
                  </div>

                  {/* Error Alert */}
                  {linkError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/40 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{linkError}</span>
                    </div>
                  )}

                  {/* Form Handling */}
                  <form onSubmit={handleLinkSubmit} className="space-y-4">
                    {/* TAB 1: TẠO MỚI TÀI KHOẢN */}
                    {linkTab === 'create' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Họ và tên người đại diện <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newAccountForm.fullName}
                            onChange={(e) => setNewAccountForm({ ...newAccountForm, fullName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ví dụ: Trần Văn Quản Lý"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Email đăng nhập (Dùng để đăng nhập vào Gara) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={newAccountForm.email}
                            onChange={(e) => setNewAccountForm({ ...newAccountForm, email: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="gara@autocare.vn"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Mật khẩu <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              minLength={6}
                              value={newAccountForm.password}
                              onChange={(e) => setNewAccountForm({ ...newAccountForm, password: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                              placeholder="Mật khẩu"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Số điện thoại liên hệ
                            </label>
                            <input
                              type="tel"
                              value={newAccountForm.phoneNumber}
                              onChange={(e) => setNewAccountForm({ ...newAccountForm, phoneNumber: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="09..."
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 italic">
                          💡 Sau khi tạo, tài khoản sẽ được cấp vai trò <strong>Garage</strong> và tự động liên kết quyền quản lý Gara này.
                        </p>
                      </div>
                    )}

                    {/* TAB 2: CHỌN TÀI KHOẢN CÓ SẴN */}
                    {linkTab === 'existing' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Chọn tài khoản người dùng <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={selectedUserIdToLink}
                          onChange={(e) => setSelectedUserIdToLink(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          required
                        >
                          <option value="">-- Chọn một tài khoản --</option>
                          {users
                            .filter(u => u.Role === 'Garage' || u.UserID === selectedGarageForLink.UserID)
                            .map(u => (
                              <option key={u.UserID} value={u.UserID}>
                                {u.FullName} ({u.Email}) - {u.Role}
                              </option>
                            ))}
                          <option disabled>────────── Các tài khoản khác ──────────</option>
                          {users
                            .filter(u => u.Role !== 'Garage' && u.UserID !== selectedGarageForLink.UserID)
                            .map(u => (
                              <option key={u.UserID} value={u.UserID}>
                                {u.FullName} ({u.Email}) - Hiện tại là {u.Role} (Sẽ tự chuyển sang Garage)
                              </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-slate-400 italic">
                          💡 Tài khoản được chọn sẽ trở thành người quản trị đại diện của Gara này.
                        </p>
                      </div>
                    )}

                    {/* TAB 3: ĐỔI MẬT KHẨU */}
                    {linkTab === 'reset' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Mật khẩu mới cho tài khoản đại diện ({selectedGarageForLink.OwnerEmail}) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            minLength={6}
                            value={resetPasswordVal}
                            onChange={(e) => setResetPasswordVal(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          💡 Đặt lại mật khẩu giúp bạn hoặc chủ xưởng đăng nhập vào Gara ngay lập tức nếu quên mật khẩu cũ.
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsLinkModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={linkingLoading}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                      >
                        {linkingLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <span>✔️</span>
                            <span>
                              {linkTab === 'create'
                                ? 'Tạo & Liên kết ngay'
                                : linkTab === 'existing'
                                ? 'Xác nhận liên kết'
                                : 'Lưu mật khẩu mới'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XEM CHI TIẾT LỊCH HẸN (Reusing AppointmentDetailViewModal)        */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedApptForDetail && (
        <AppointmentDetailViewModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedApptForDetail(null);
          }}
          appointment={selectedApptForDetail}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
