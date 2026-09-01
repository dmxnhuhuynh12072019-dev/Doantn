import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useSocket } from '../../context/SocketContext';
import * as maintenanceService from '../../services/maintenanceService';
import * as garageService from '../../services/garageService';
import * as appointmentService from '../../services/appointmentService';
import * as extensionService from '../../services/extensionService';
import GarageHistoryModal from '../../components/maintenances/GarageHistoryModal';
import CompleteAppointmentModal from '../../components/appointments/CompleteAppointmentModal';
import VehicleProfileModal from '../../components/garages/VehicleProfileModal';
import LicensePlateScannerModal from '../../components/extensions/LicensePlateScannerModal';
import PresetOdometerChecklist from '../../components/maintenances/PresetOdometerChecklist';
import NotificationBell from '../../components/notifications/NotificationBell';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import AppointmentDetailViewModal from '../../components/appointments/AppointmentDetailViewModal';

const GarageDashboard = () => {
  const { user, logout, themePreference, updateThemePreference } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { toast } = useModal();
  const { socket } = useSocket();

  // Tab state: 'overview' | 'appointments' | 'services' | 'customers' | 'vehicles' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Filter in appointments tab
  const [apptStatusFilter, setApptStatusFilter] = useState('all');

  // Modal states
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isOcrScannerOpen, setIsOcrScannerOpen] = useState(false);
  const [isPresetKmOpen, setIsPresetKmOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceApptId, setSelectedInvoiceApptId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApptForDetail, setSelectedApptForDetail] = useState(null);

  // Selected items for detail modals
  const [selectedApptForComplete, setSelectedApptForComplete] = useState(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- TABS DATA STATES ---
  // 1. Appointments State
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptError, setApptError] = useState('');

  // 2. Serviced Vehicles State
  const [servicedVehicles, setServicedVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // 3. Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // 4. Quick Action / Search State
  const [licensePlateSearch, setLicensePlateSearch] = useState('');
  const [searchingQuick, setSearchingQuick] = useState(false);
  const [foundVehicle, setFoundVehicle] = useState(null);
  const [quickSearchError, setQuickSearchError] = useState('');
  const [quickVehicleHistory, setQuickVehicleHistory] = useState([]);
  const [loadingQuickHistory, setLoadingQuickHistory] = useState(false);
  const [quickHistoryError, setQuickHistoryError] = useState('');

  // --- FETCHERS ---
  const fetchAppointments = async () => {
    setLoadingAppts(true);
    setApptError('');
    try {
      const data = await appointmentService.getAppointmentsGarage();
      setAppointments(data);
    } catch (err) {
      setApptError(err.message || 'Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoadingAppts(false);
    }
  };

  const fetchServicedVehicles = async (searchVal = '') => {
    setLoadingVehicles(true);
    setVehiclesError('');
    try {
      const data = await garageService.getServicedVehicles(searchVal);
      setServicedVehicles(data);
    } catch (err) {
      setVehiclesError(err.message || 'Không thể tải danh sách phương tiện.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const data = await garageService.getGarageDashboard();
      setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(err.message || 'Không thể tải báo cáo thống kê.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load all foundational data on initial mount
  useEffect(() => {
    fetchAppointments();
    fetchServicedVehicles();
    fetchAnalytics();
  }, []);

  // Reload tab specific data when switching
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAppointments();
      fetchAnalytics();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'vehicles' || activeTab === 'customers') {
      fetchServicedVehicles();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Real-time Socket.IO listener for Garage updates
  useEffect(() => {
    if (!socket) return;

    const handleNotificationReceived = (notif) => {
      console.log('[Garage Socket.IO] Nhận thông báo mới:', notif);
      fetchAppointments();
      fetchAnalytics();
      fetchServicedVehicles();
    };

    socket.on('notification_received', handleNotificationReceived);
    socket.on('unread_count_updated', handleNotificationReceived);

    return () => {
      socket.off('notification_received', handleNotificationReceived);
      socket.off('unread_count_updated', handleNotificationReceived);
    };
  }, [socket]);

  // --- HANDLERS ---
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(apptId, newStatus);
      toast.success(`Đã chuyển trạng thái lịch hẹn sang: "${newStatus}"!`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Thay đổi trạng thái lịch hẹn thất bại.');
    }
  };

  const handleOpenCompleteModal = (appt) => {
    setSelectedApptForComplete(appt);
    setIsCompleteOpen(true);
  };

  const handleSaveCompleteAppointment = async (apptId, data) => {
    await appointmentService.completeAppointment(apptId, data);
    toast.success('Xác nhận hoàn thành sửa chữa & gửi thông báo thành công!');
    fetchAppointments();
    fetchAnalytics();
  };

  const handleExportInvoice = (appointmentId) => {
    setSelectedInvoiceApptId(appointmentId);
    setIsInvoiceModalOpen(true);
  };

  const handleSearchVehicle = (e) => {
    e.preventDefault();
    fetchServicedVehicles(vehicleSearch);
  };

  const handleViewVehicleProfile = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsProfileOpen(true);
  };

  const handleOcrSearchSuccess = (vehicleProfile) => {
    const vId = vehicleProfile.vehicleId || vehicleProfile.VehicleID;
    const plate = vehicleProfile.licensePlate || vehicleProfile.LicensePlate;
    setFoundVehicle({
      VehicleID: vId,
      UserID: vehicleProfile.userId || vehicleProfile.UserID,
      LicensePlate: plate,
      VehicleType: vehicleProfile.vehicleType || vehicleProfile.VehicleType || 'Ô tô',
      Brand: vehicleProfile.brand || vehicleProfile.Brand,
      Model: vehicleProfile.model || vehicleProfile.Model,
      ManufactureYear: vehicleProfile.manufactureYear || vehicleProfile.ManufactureYear,
      PurchaseDate: vehicleProfile.purchaseDate || vehicleProfile.PurchaseDate,
      CurrentOdometer: vehicleProfile.currentOdometer ?? vehicleProfile.CurrentOdometer ?? 0,
      OwnerName: vehicleProfile.ownerName || vehicleProfile.OwnerName || vehicleProfile.customerName || 'Chủ xe',
      OwnerEmail: vehicleProfile.ownerEmail || vehicleProfile.OwnerEmail || ''
    });

    if (vId) {
      fetchQuickVehicleHistory(vId);
    } else if (vehicleProfile.history) {
      setQuickVehicleHistory(vehicleProfile.history);
    }

    setLicensePlateSearch(plate);
    setQuickSearchError('');
    setQuickHistoryError('');
    setActiveTab('services');
    toast.success(`Nhận diện & tìm kiếm thành công biển số: ${plate}!`);
  };

  const handleQuickSearch = async (e) => {
    e.preventDefault();
    if (!licensePlateSearch.trim()) return;

    setSearchingQuick(true);
    setQuickSearchError('');
    setFoundVehicle(null);
    setQuickVehicleHistory([]);
    setQuickHistoryError('');

    try {
      const vehicle = await maintenanceService.searchVehicle(licensePlateSearch.trim());
      setFoundVehicle(vehicle);
      await fetchQuickVehicleHistory(vehicle.VehicleID);
    } catch (err) {
      setQuickSearchError(err.message || 'Không tìm thấy phương tiện nào với biển số xe này.');
    } finally {
      setSearchingQuick(false);
    }
  };

  const fetchQuickVehicleHistory = async (vehicleId) => {
    setLoadingQuickHistory(true);
    setQuickHistoryError('');
    try {
      const history = await maintenanceService.getHistory(vehicleId);
      setQuickVehicleHistory(history);
    } catch (err) {
      if (err.status === 403) {
        setQuickHistoryError('Bạn chưa có quyền xem lịch sử bảo dưỡng chung của xe này (Chưa từng thực hiện dịch vụ hoặc lịch hẹn tại tiệm của bạn).');
      } else {
        setQuickHistoryError(err.message || 'Không thể tải lịch sử sửa chữa.');
      }
    } finally {
      setLoadingQuickHistory(false);
    }
  };

  const handleSaveQuickHistoryLog = async (data) => {
    await maintenanceService.createHistoryGarage(data);
    toast.success('Ghi sổ bảo dưỡng dịch vụ thành công!');

    if (foundVehicle && foundVehicle.VehicleID === data.vehicleId) {
      fetchQuickVehicleHistory(data.vehicleId);
      if (data.executionOdometer > foundVehicle.CurrentOdometer) {
        setFoundVehicle({
          ...foundVehicle,
          CurrentOdometer: data.executionOdometer
        });
      }
    }
    fetchAnalytics();
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Compute live Overview metrics
  const todayAppointments = appointments.filter(a => {
    const apptDate = new Date(a.AppointmentDate).toDateString();
    const today = new Date().toDateString();
    return apptDate === today;
  });

  const activeRepairCount = appointments.filter(a => a.Status === 'Đang sửa chữa').length;

  const filteredAppointments = appointments.filter(a => {
    if (apptStatusFilter === 'all') return true;
    return a.Status === apptStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans text-slate-800 dark:text-slate-100 select-none">
      
      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION                                                        */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 flex flex-col shrink-0 border-r border-slate-200/80 dark:border-slate-700 shadow-2xs">
        
        {/* Brand Logo Header */}
        <Link
          to="/user/dashboard"
          className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-750/40 transition group cursor-pointer"
          title="Về Trang chủ AutoCare Portal"
        >
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform text-lg">
            🏬
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-tight text-indigo-700 dark:text-indigo-400 uppercase leading-none">
                ACOH GARAGE
              </h1>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded">
                Partner
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight mt-0.5">
              XƯỞNG DỊCH VỤ
            </p>
          </div>
        </Link>

        {/* Navigation Menu Items */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', title: 'Tổng quan vận hành', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )},
            { id: 'appointments', title: 'Lịch hẹn tiếp nhận', count: appointments.filter(a => a.Status === 'Chờ xác nhận').length || null, icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )},
            { id: 'services', title: 'Dịch vụ & Ghi sổ xe', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )},
            { id: 'customers', title: 'Khách hàng', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )},
            { id: 'vehicles', title: 'Hồ sơ phương tiện', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 16l-1.5-6.5A2 2 0 0015.5 8h-7a2 2 0 00-2 1.5L5 16m14 0a2 2 0 11-4 0 2 2 0 014 0zM9 16a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )},
            { id: 'analytics', title: 'Báo cáo doanh thu', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )},
            { id: 'settings', title: 'Cài đặt Gara', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )},
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold shadow-2xs border border-indigo-100 dark:border-indigo-900/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>
                {item.count && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Security Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-indigo-50/70 dark:bg-slate-700/40 rounded-2xl p-4 text-center border border-indigo-100/80 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs text-sm">
              🏬
            </div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white">Cổng Gara Đối Tác</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
              Quản lý vận hành & dịch vụ xe chuyên nghiệp
            </p>
          </div>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 py-3.5 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xxs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                🏬 Cổng Đối Tác Gara
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-none">
                {user?.fullName || 'Xưởng Dịch Vụ'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
              {activeTab === 'overview' && 'Tổng quan vận hành'}
              {activeTab === 'appointments' && 'Quản lý lịch hẹn tiếp nhận'}
              {activeTab === 'services' && 'Dịch vụ & Ghi sổ bảo dưỡng'}
              {activeTab === 'customers' && 'Quản lý khách hàng'}
              {activeTab === 'vehicles' && 'Quản lý phương tiện'}
              {activeTab === 'analytics' && 'Báo cáo doanh thu & vận hành'}
              {activeTab === 'settings' && 'Cài đặt hệ thống Gara'}
            </h2>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Quick AI OCR Scanner Action Button */}
            <button
              onClick={() => setIsOcrScannerOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              title="Quét biển số xe AI"
            >
              <span>📸</span>
              <span>Quét Biển số AI</span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={() => {
                const next = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'system' : 'light';
                updateThemePreference(next);
              }}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer text-sm"
              title="Đổi chế độ giao diện"
            >
              {themePreference === 'light' ? '☀️' : themePreference === 'dark' ? '🌙' : '💻'}
            </button>

            {/* Garage Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user?.fullName || 'Gara AutoCare'}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-none mt-0.5">
                    Chủ Gara Đối Tác
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
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user?.fullName || 'Gara AutoCare'}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-md">
                          🏬 Chủ Gara Đối Tác
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-1">{user?.email}</p>
                    </div>
                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition flex items-center gap-2"
                    >
                      <span>🏠</span>
                      <span>Về Trang chủ Portal</span>
                    </Link>
                    <button
                      onClick={() => { setActiveTab('settings'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-2"
                    >
                      <span>⚙️</span>
                      <span>Cài đặt thông tin Gara</span>
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-2"
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

        {/* Dynamic Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ===================================================================== */}
          {/* 1. TAB OVERVIEW                                                        */}
          {/* ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* TOP 4 STAT KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* KPI Card 1: Lịch hẹn hôm nay */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                    📅
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Lịch hẹn hôm nay
                    </span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {todayAppointments.length}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5 pt-0.5">
                      <span>Tổng:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{appointments.length} lịch đặt</span>
                    </p>
                  </div>
                </div>

                {/* KPI Card 2: Doanh thu hôm nay */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                    💵
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Tổng doanh thu xưởng
                    </span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {formatCurrency(analyticsData?.totalRevenue ?? 0)}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 pt-0.5">
                      <span>Đã quyết toán</span>
                    </p>
                  </div>
                </div>

                {/* KPI Card 3: Khách hàng / Đầu xe */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
                    👥
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Khách hàng & Xe đã tiếp nhận
                    </span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {servicedVehicles.length || (analyticsData?.totalVehicles ?? 0)}
                    </p>
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 pt-0.5">
                      <span>Phương tiện trong hồ sơ</span>
                    </p>
                  </div>
                </div>

                {/* KPI Card 4: Xe đang sửa */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                    🚗
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Xe đang sửa chữa
                    </span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {activeRepairCount}
                    </p>
                    <button
                      onClick={() => { setApptStatusFilter('Đang sửa chữa'); setActiveTab('appointments'); }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline block pt-0.5 cursor-pointer"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>

              </div>

              {/* 2-COLUMN MAIN CONTENT (Today's Table on Left, Revenue & Donut on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                
                {/* LEFT COLUMN: Lịch hẹn gần đây Table */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        Lịch hẹn gần đây
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                        {appointments.length} lịch hẹn
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 font-bold">
                            <th className="pb-3 pr-2">Thời gian</th>
                            <th className="pb-3 px-2">Khách hàng</th>
                            <th className="pb-3 px-2">Xe</th>
                            <th className="pb-3 px-2">Dịch vụ / Ghi chú</th>
                            <th className="pb-3 pl-2 text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                          {appointments.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                                Chưa có lịch hẹn nào tại xưởng dịch vụ của bạn.
                              </td>
                            </tr>
                          ) : (
                            appointments.slice(0, 6).map((item, idx) => {
                              const timeStr = item.AppointmentDate 
                                ? new Date(item.AppointmentDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) 
                                : 'Chưa có';
                              const ownerName = item.OwnerName || 'Khách hàng';
                              const plateNum = item.LicensePlate || '---';
                              const serviceName = item.Notes || 'Bảo dưỡng & Sửa chữa';
                              const statusStr = item.Status || 'Chờ xác nhận';

                              return (
                                <tr key={item.AppointmentID || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition">
                                  <td className="py-3 pr-2 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                    {timeStr}
                                  </td>
                                  <td className="py-3 px-2 font-semibold truncate max-w-[110px]">
                                    {ownerName}
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-md text-[11px] whitespace-nowrap border border-slate-200/60 dark:border-slate-600">
                                      {plateNum}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                                    {serviceName}
                                  </td>
                                  <td className="py-3 pl-2 text-right">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight whitespace-nowrap ${
                                      statusStr === 'Đang thực hiện' || statusStr === 'Đang sửa chữa'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : statusStr === 'Chờ tiếp nhận' || statusStr === 'Chờ xác nhận'
                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                        : statusStr === 'Hoàn thành'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                    }`}>
                                      {statusStr}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom Link */}
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Xem tất cả lịch hẹn ({appointments.length})</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Charts */}
                <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                  
                  {/* Revenue Chart Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                          Doanh thu lũy kế dịch vụ
                        </span>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">
                          {formatCurrency(analyticsData?.totalRevenue ?? 0)}
                        </p>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                          <span>{analyticsData?.totalVehicles ?? 0} lượt phương tiện đã hoàn tất</span>
                        </p>
                      </div>
                    </div>

                    {/* Dynamic Bar/Line Preview */}
                    <div className="mt-4 pt-2">
                      <div className="h-28 w-full flex items-end gap-1.5 px-1 border-b border-slate-100 dark:border-slate-700">
                        {(analyticsData?.dailyVisits || Array.from({ length: 7 }, (_, i) => ({ date: `${i + 1}`, count: 0 }))).slice(-7).map((item, idx) => {
                          const maxCount = Math.max(...(analyticsData?.dailyVisits || []).map(d => d.count), 1);
                          const h = (item.count / maxCount) * 100;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-md transition-all duration-300 min-h-[4px]"
                                style={{ height: `${Math.max(h, 6)}%` }}
                                title={`${item.date}: ${item.count} lượt`}
                              ></div>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{item.date}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Customer Status Breakdown Donut Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight mb-4">
                      Tỷ lệ trạng thái lịch hẹn
                    </h3>

                    {appointments.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Chưa có dữ liệu phân bổ lịch hẹn.
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        {/* Donut SVG */}
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="4.5" />
                            {(() => {
                              const total = appointments.length;
                              const done = appointments.filter(a => a.Status === 'Hoàn thành').length;
                              const repairing = appointments.filter(a => a.Status === 'Đang sửa chữa').length;
                              const confirmed = appointments.filter(a => a.Status === 'Đã xác nhận').length;
                              const pending = appointments.filter(a => a.Status === 'Chờ xác nhận').length;

                              const donePct = (done / total) * 88;
                              const repairPct = (repairing / total) * 88;
                              const confPct = (confirmed / total) * 88;
                              const pendPct = (pending / total) * 88;

                              let offset = 0;
                              return (
                                <>
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray={`${donePct} 88`} strokeDashoffset={`${-offset}`} />
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#A855F7" strokeWidth="4.5" strokeDasharray={`${repairPct} 88`} strokeDashoffset={`${-(offset += donePct)}`} />
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#4F46E5" strokeWidth="4.5" strokeDasharray={`${confPct} 88`} strokeDashoffset={`${-(offset += repairPct)}`} />
                                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray={`${pendPct} 88`} strokeDashoffset={`${-(offset += confPct)}`} />
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 space-y-1.5 text-xs font-semibold">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Hoàn thành
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {appointments.filter(a => a.Status === 'Hoàn thành').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span> Đang sửa
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {appointments.filter(a => a.Status === 'Đang sửa chữa').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span> Đã duyệt
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {appointments.filter(a => a.Status === 'Đã xác nhận').length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> Chờ duyệt
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {appointments.filter(a => a.Status === 'Chờ xác nhận').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. TAB APPOINTMENTS (Full appointment management)                     */}
          {/* ===================================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header & Status Filter Pills */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Lịch hẹn khách hàng
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Theo dõi quy trình tiếp nhận, phê duyệt và hoàn tất lịch sửa chữa xe.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'Chờ xác nhận', label: 'Chờ xác nhận' },
                    { id: 'Đã xác nhận', label: 'Đã xác nhận' },
                    { id: 'Đang sửa chữa', label: 'Đang sửa' },
                    { id: 'Hoàn thành', label: 'Hoàn thành' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setApptStatusFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        apptStatusFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-650'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {apptError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {apptError}
                </div>
              )}

              {loadingAppts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center shadow-2xs">
                  <span className="text-4xl mb-2 block">📅</span>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">Không có lịch hẹn nào</h4>
                  <p className="text-xs text-slate-400 mt-1">Chưa có lịch hẹn nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredAppointments.map((appt) => (
                    <div
                      key={appt.AppointmentID}
                      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                              🚗 Ô tô
                            </span>
                            <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-tight">
                              {appt.Brand} {appt.Model}
                            </h4>
                          </div>
                          <span className="border-2 border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-900 rounded-md px-2.5 py-0.5 text-xs font-black tracking-wider text-slate-800 dark:text-white shrink-0">
                            {appt.LicensePlate}
                          </span>
                        </div>

                        <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl text-xs border border-slate-100 dark:border-slate-700/60">
                          <div className="flex justify-between">
                            <span className="text-slate-400 dark:text-slate-400 font-bold">Khách hàng:</span>
                            <strong className="text-slate-800 dark:text-slate-200">{appt.OwnerName} ({appt.OwnerPhone || 'SĐT ẩn'})</strong>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
                            <span className="text-slate-400 dark:text-slate-400 font-bold">Thời gian:</span>
                            <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                              {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </strong>
                          </div>
                          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
                            <span className="text-slate-400 dark:text-slate-400 font-bold block mb-0.5">Ghi chú:</span>
                            <p className="text-slate-600 dark:text-slate-300 italic text-[11px] line-clamp-2">{appt.Notes || 'Không có ghi chú.'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          appt.Status === 'Chờ xác nhận' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                          appt.Status === 'Đã xác nhận' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                          appt.Status === 'Đang sửa chữa' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800' :
                          appt.Status === 'Hoàn thành' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {appt.Status}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedApptForDetail(appt);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer flex items-center gap-1 border border-transparent dark:border-slate-600"
                          >
                            <span>🔍</span>
                            <span>Chi tiết dịch vụ</span>
                          </button>

                          {appt.Status === 'Chờ xác nhận' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appt.AppointmentID, 'Hủy lịch')}
                                className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 rounded-xl transition cursor-pointer"
                              >
                                Từ chối
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt.AppointmentID, 'Đã xác nhận')}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
                              >
                                Xác nhận
                              </button>
                            </>
                          )}

                          {appt.Status === 'Đã xác nhận' && (
                            <button
                              onClick={() => handleUpdateStatus(appt.AppointmentID, 'Đang sửa chữa')}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs cursor-pointer"
                            >
                              Tiến hành sửa →
                            </button>
                          )}

                          {appt.Status === 'Đang sửa chữa' && (
                            <button
                              onClick={() => handleOpenCompleteModal(appt)}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              ✔️ Hoàn tất sửa chữa
                            </button>
                          )}

                          {appt.Status === 'Hoàn thành' && (
                            <button
                              onClick={() => handleExportInvoice(appt.AppointmentID)}
                              className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              📥 Xuất hóa đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. TAB SERVICES (Dịch vụ & Ghi sổ bảo dưỡng nhanh)                   */}
          {/* ===================================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Quản lý Dịch vụ & Tra cứu nhanh
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quét biển số AI, tra cứu lịch sử sửa chữa và lập phiếu bảo dưỡng theo mốc km.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsOcrScannerOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📸</span> <span>Scan Biển số AI</span>
                  </button>
                  <button
                    onClick={() => setIsQuickLogOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>➕</span> <span>Ghi nhận bảo dưỡng</span>
                  </button>
                </div>
              </div>

              {/* Tra cứu nhanh biển số */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Search & Found Info */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    🔍 Tra cứu xe theo biển số
                  </h4>

                  <form onSubmit={handleQuickSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={licensePlateSearch}
                      onChange={(e) => setLicensePlateSearch(e.target.value)}
                      placeholder="Nhập biển số (ví dụ: 59A-123.45)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={searchingQuick}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {searchingQuick ? '...' : 'Tìm'}
                    </button>
                  </form>

                  {quickSearchError && (
                    <div className="p-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      {quickSearchError}
                    </div>
                  )}

                  {foundVehicle && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {foundVehicle.Brand} {foundVehicle.Model}
                        </span>
                        <span className="px-2.5 py-0.5 border-2 border-slate-800 dark:border-slate-300 rounded-md text-xs font-black bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                          {foundVehicle.LicensePlate}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-700/60">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Chủ xe:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{foundVehicle.OwnerName}</strong>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Odo hiện tại:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {(foundVehicle.CurrentOdometer ?? 0).toLocaleString()} km
                          </strong>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsPresetKmOpen(true)}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        🛠️ Lập phiếu kiểm tra mốc Km
                      </button>
                    </div>
                  )}
                </div>

                {/* History List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs flex flex-col justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                    📋 Nhật ký bảo dưỡng phương tiện
                  </h4>

                  {!foundVehicle ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                      <span className="text-3xl mb-1">🚗</span>
                      <p className="text-xs">Nhập biển số ở cột bên trái hoặc quét AI để xem lịch sử.</p>
                    </div>
                  ) : loadingQuickHistory ? (
                    <div className="space-y-3">
                      <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
                      <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
                    </div>
                  ) : quickVehicleHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Chưa có lịch sử bảo dưỡng nào cho xe này.</div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                      {quickVehicleHistory.map((rec) => (
                        <div key={rec.HistoryID} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-700 dark:text-slate-200">
                              📅 {new Date(rec.ExecutionDate).toLocaleDateString('vi-VN')} ({rec.ExecutionOdometer?.toLocaleString()} km)
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
                              {formatCurrency(rec.TotalCost)}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line">{rec.Details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. TAB CUSTOMERS (Khách hàng)                                         */}
          {/* ===================================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Quản lý khách hàng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Danh sách khách hàng cá nhân và tần suất bảo dưỡng xe tại xưởng.
                </p>
              </div>

              {/* Customers Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 font-bold">
                        <th className="px-6 py-3.5">Khách hàng</th>
                        <th className="px-6 py-3.5">Số điện thoại</th>
                        <th className="px-6 py-3.5">Phương tiện</th>
                        <th className="px-6 py-3.5">Biển số</th>
                        <th className="px-6 py-3.5 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                      {servicedVehicles.map((v) => (
                        <tr key={v.VehicleID} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition">
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                            {v.OwnerName}
                          </td>
                          <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                            {v.OwnerPhone || 'Chưa cập nhật'}
                          </td>
                          <td className="px-6 py-3.5 font-semibold">
                            {v.Brand} {v.Model}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded font-black text-[11px] text-slate-800 dark:text-slate-200">
                              {v.LicensePlate}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => handleViewVehicleProfile(v.VehicleID)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                            >
                              Xem xe →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. TAB VEHICLES (Quản lý xe đã bảo dưỡng)                             */}
          {/* ===================================================================== */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Quản lý phương tiện đã phục vụ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hồ sơ chi tiết các đầu xe đã từng thực hiện bảo dưỡng hoặc sửa chữa tại tiệm.
                  </p>
                </div>

                <form onSubmit={handleSearchVehicle} className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Tìm theo biển số xe..."
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                    Tìm kiếm
                  </button>
                </form>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400 font-bold">
                        <th className="px-6 py-3.5">Biển số</th>
                        <th className="px-6 py-3.5">Hãng & Dòng xe</th>
                        <th className="px-6 py-3.5">Odometer hiện tại</th>
                        <th className="px-6 py-3.5">Chủ sở hữu</th>
                        <th className="px-6 py-3.5 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                      {servicedVehicles.map((v) => (
                        <tr key={v.VehicleID} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition">
                          <td className="px-6 py-3.5 font-black">
                            <span className="px-2 py-0.5 border border-slate-800 dark:border-slate-300 rounded bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-200">
                              {v.LicensePlate}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                            {v.Brand} {v.Model}
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                            {(v.CurrentOdometer ?? 0).toLocaleString()} km
                          </td>
                          <td className="px-6 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                            {v.OwnerName}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={() => handleViewVehicleProfile(v.VehicleID)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                            >
                              Xem hồ sơ xe
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. TAB ANALYTICS (Báo cáo chi tiết)                                   */}
          {/* ===================================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Báo cáo vận hành Gara toàn diện
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Thống kê doanh số dịch vụ, lưu lượng xe đến tiệm và đánh giá khách hàng.
                </p>
              </div>

              {analyticsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Visits */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      📈 Lượng xe đến xưởng 15 ngày qua
                    </h4>
                    <div className="flex items-end gap-1.5 h-44 pt-4 border-b border-l border-slate-100 dark:border-slate-700 px-2">
                      {analyticsData.dailyVisits.map((item, idx) => {
                        const maxCount = Math.max(...analyticsData.dailyVisits.map(d => d.count), 1);
                        const h = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all duration-300" style={{ height: `${Math.max(h, 6)}%` }}></div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 transform -rotate-45 sm:rotate-0 mt-1">
                              {item.date.split('/')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Revenue */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      📊 Doanh thu theo tháng
                    </h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {analyticsData.monthlyRevenue.map((item, idx) => {
                        const maxR = Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue), 1);
                        const w = (item.revenue / maxR) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <span className="w-14 font-bold text-slate-500 dark:text-slate-400">{item.month}</span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${w}%` }}></div>
                            </div>
                            <span className="w-24 text-right font-black text-slate-900 dark:text-white">
                              {formatCurrency(item.revenue)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* 7. TAB SETTINGS (Cài đặt)                                             */}
          {/* ===================================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Cài đặt thông tin Gara & Tài khoản
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cập nhật hồ sơ xưởng dịch vụ, thời gian hoạt động và cấu hình nhận thông báo.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5 max-w-2xl">
                <div className="space-y-4">
                  {/* Role and Partner Type Card */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        Cấp quyền & Vai trò
                      </span>
                      <strong className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        Chủ Gara Đối Tác (Role: Garage Partner)
                      </strong>
                    </div>
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-xs">
                      🏬 Đối tác chính thức
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Gara Đối Tác</label>
                    <input type="text" readOnly value={user?.fullName || 'Gara AutoCare'} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email liên hệ đăng nhập</label>
                    <input type="text" readOnly value={user?.email || 'gara@autocare.vn'} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Giao diện mặc định</label>
                    <div className="flex gap-2 pt-1">
                      {['light', 'dark', 'system'].map(m => (
                        <button
                          key={m}
                          onClick={() => updateThemePreference(m)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer capitalize ${
                            themePreference === m
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {m === 'light' ? '☀️ Sáng' : m === 'dark' ? '🌙 Tối' : '💻 Hệ thống'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* --- MODALS --- */}
      <GarageHistoryModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSave={handleSaveQuickHistoryLog}
      />

      <CompleteAppointmentModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onSave={handleSaveCompleteAppointment}
        appointment={selectedApptForComplete}
      />

      <VehicleProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        vehicleId={selectedVehicleId}
      />

      <LicensePlateScannerModal
        isOpen={isOcrScannerOpen}
        onClose={() => setIsOcrScannerOpen(false)}
        onSearchSuccess={handleOcrSearchSuccess}
      />

      {foundVehicle && (
        <PresetOdometerChecklist
          isOpen={isPresetKmOpen}
          onClose={() => setIsPresetKmOpen(false)}
          vehicle={{
            vehicleID: foundVehicle.VehicleID || foundVehicle.vehicleId,
            brand: foundVehicle.Brand || foundVehicle.brand,
            model: foundVehicle.Model || foundVehicle.model,
            licensePlate: foundVehicle.LicensePlate || foundVehicle.licensePlate,
            vehicleType: foundVehicle.VehicleType || foundVehicle.vehicleType || 'Ô tô',
            currentOdometer: foundVehicle.CurrentOdometer || foundVehicle.currentOdometer || 0,
          }}
          onSuccess={() => {
            if (foundVehicle.VehicleID || foundVehicle.vehicleId) {
              fetchQuickVehicleHistory(foundVehicle.VehicleID || foundVehicle.vehicleId);
            }
            toast.success('🎉 Đã lưu phiếu kiểm tra mốc km thành công!');
          }}
        />
      )}

      {/* Invoice Preview & Printable Modal matching sample template */}
      <InvoicePreviewModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceApptId(null);
        }}
        appointmentId={selectedInvoiceApptId}
      />

      {/* Appointment Detail View Modal */}
      <AppointmentDetailViewModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApptForDetail(null);
        }}
        appointment={selectedApptForDetail}
        onOpenInvoice={(apptId) => {
          handleExportInvoice(apptId);
        }}
      />

    </div>
  );
};

export default GarageDashboard;
