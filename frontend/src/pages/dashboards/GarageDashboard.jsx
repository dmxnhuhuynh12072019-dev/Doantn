import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as maintenanceService from '../../services/maintenanceService';
import * as garageService from '../../services/garageService';
import * as appointmentService from '../../services/appointmentService';
import * as extensionService from '../../services/extensionService';
import GarageHistoryModal from '../../components/maintenances/GarageHistoryModal';
import CompleteAppointmentModal from '../../components/appointments/CompleteAppointmentModal';
import VehicleProfileModal from '../../components/garages/VehicleProfileModal';
import NotificationBell from '../../components/notifications/NotificationBell';

const GarageDashboard = () => {
  const { user, logout } = useAuth();

  // Tab state: 'appointments' | 'serviced' | 'analytics' | 'quick'
  const [activeTab, setActiveTab] = useState('appointments');

  // Modal states
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

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

  // 4. Quick Action State (Original)
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

  // Switch tabs handler
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'serviced') {
      fetchServicedVehicles();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // --- HANDLERS ---
  // A. Appointment handlers
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(apptId, newStatus);
      alert(`Đã chuyển trạng thái lịch hẹn sang: "${newStatus}"!`);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Thay đổi trạng thái lịch hẹn thất bại.');
    }
  };

  const handleOpenCompleteModal = (appt) => {
    setSelectedApptForComplete(appt);
    setIsCompleteOpen(true);
  };

  const handleSaveCompleteAppointment = async (apptId, data) => {
    await appointmentService.completeAppointment(apptId, data);
    alert('Xác nhận hoàn thành sửa chữa & gửi thông báo thành công!');
    fetchAppointments();
  };

  const handleExportInvoice = async (appointmentId) => {
    const url = `/api/extensions/export/invoice/${appointmentId}`;
    await extensionService.downloadFileWithAuth(url, `invoice_appointment_${appointmentId}.csv`);
  };

  // B. Serviced Vehicle handlers
  const handleSearchVehicle = (e) => {
    e.preventDefault();
    fetchServicedVehicles(vehicleSearch);
  };

  const handleViewVehicleProfile = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsProfileOpen(true);
  };

  // C. Quick Action Handlers (Original Search)
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
    alert('Ghi sổ bảo dưỡng dịch vụ thành công!');

    if (foundVehicle && foundVehicle.VehicleID === data.vehicleId) {
      fetchQuickVehicleHistory(data.vehicleId);
      if (data.executionOdometer > foundVehicle.CurrentOdometer) {
        setFoundVehicle({
          ...foundVehicle,
          CurrentOdometer: data.executionOdometer
        });
      }
    }
  };

  // Formatting utils
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-850 dark:text-white leading-tight">ACOH Garage</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hệ thống quản lý Gara đối tác</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
              Garage: <span className="font-bold text-slate-800 dark:text-white">{user?.fullName}</span>
            </span>
            <a
              href="/profile"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-750 dark:text-slate-200 flex items-center justify-center font-black border border-slate-200 dark:border-slate-600 hover:shadow-xs transition shrink-0"
              title="Hồ sơ Gara"
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'G'}
            </a>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-950/40 transition shrink-0"
              title="Đăng xuất"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex space-x-1 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'appointments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            📅 Lịch hẹn khách hàng
          </button>
          <button
            onClick={() => setActiveTab('serviced')}
            className={`px-4 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'serviced'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            🚗 Quản lý xe đã bảo dưỡng
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            📊 Thống kê & Báo cáo
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${activeTab === 'quick'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            🔍 Tra cứu & Ghi nhận nhanh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Lịch hẹn khách hàng đặt tại tiệm</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tiếp nhận, xác nhận lịch và thực hiện bảo dưỡng/sửa chữa xe cho khách hàng đúng hẹn.</p>
            </div>

            {apptError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {apptError}
              </div>
            )}

            {loadingAppts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse"></div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl p-12 text-center shadow-sm">
                <span className="text-4xl mb-4 block">📅</span>
                <h3 className="text-lg font-bold text-slate-805 dark:text-white">Chưa có lịch hẹn nào</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Khi khách hàng đặt lịch hẹn tại tiệm của bạn, thông tin lịch hẹn sẽ hiển thị ở đây.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appt) => (
                  <div
                    key={appt.AppointmentID}
                    className="bg-white dark:bg-slate-805 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                            {appt.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                          </span>
                          <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1.5 leading-tight">
                            {appt.Brand} {appt.Model}
                          </h3>
                        </div>
                        <span className="border-2 border-slate-800 dark:border-slate-400 bg-white dark:bg-slate-900 rounded-md px-2.5 py-0.5 text-xs font-black tracking-wider text-slate-800 dark:text-white shrink-0 whitespace-nowrap">
                          {appt.LicensePlate}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Khách hàng:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{appt.OwnerName} ({appt.OwnerPhone || 'Không có số ĐT'})</strong>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-750/50 pt-2">
                          <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Thời gian hẹn:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
                            {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </strong>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-750/50 pt-2">
                          <span className="text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wide mb-1">Ghi chú của khách:</span>
                          <p className="text-slate-650 dark:text-slate-350 italic leading-relaxed">{appt.Notes || 'Không có ghi chú.'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                      <span className={`px-2.5 py-1 rounded-full text-xxs font-bold border ${appt.Status === 'Chờ xác nhận' ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 border-amber-100' :
                          appt.Status === 'Đã xác nhận' ? 'bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 border-blue-100' :
                            appt.Status === 'Đang sửa chữa' ? 'bg-purple-50 dark:bg-purple-955/20 text-purple-600 dark:text-purple-400 border-purple-100' :
                              appt.Status === 'Hoàn thành' ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400 border-emerald-100' :
                                'bg-slate-55 dark:bg-slate-900/20 text-slate-500 border-slate-200'
                        }`}>
                        {appt.Status}
                      </span>

                      <div className="flex gap-2">
                        {appt.Status === 'Chờ xác nhận' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt.AppointmentID, 'Hủy lịch')}
                              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded-xl transition"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt.AppointmentID, 'Đã xác nhận')}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
                            >
                              Xác nhận lịch
                            </button>
                          </>
                        )}

                        {appt.Status === 'Đã xác nhận' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt.AppointmentID, 'Hủy lịch')}
                              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded-xl transition"
                            >
                              Hủy lịch
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt.AppointmentID, 'Đang sửa chữa')}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs"
                            >
                              Tiến hành sửa
                            </button>
                          </>
                        )}

                        {appt.Status === 'Đang sửa chữa' && (
                          <button
                            onClick={() => handleOpenCompleteModal(appt)}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1"
                          >
                            ✔️ Hoàn tất sửa chữa
                          </button>
                        )}

                        {appt.Status === 'Hoàn thành' && (
                          <button
                            onClick={() => handleExportInvoice(appt.AppointmentID)}
                            className="px-4 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-xl transition shadow-xs flex items-center gap-1"
                          >
                            📥 Xuất hóa đơn (CSV)
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

        {/* TAB 2: SERVICED VEHICLES */}
        {activeTab === 'serviced' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Danh sách xe đã bảo dưỡng</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Quản lý và tra cứu thông tin toàn bộ các phương tiện đã từng làm dịch vụ tại tiệm của bạn.</p>
              </div>

              {/* Tìm kiếm biển số */}
              <form onSubmit={handleSearchVehicle} className="flex gap-2 w-full md:w-auto shrink-0">
                <input
                  type="text"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Nhập biển số cần tìm..."
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition flex-1 md:w-60 md:flex-initial"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>

            {vehiclesError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {vehiclesError}
              </div>
            )}

            {loadingVehicles ? (
              <div className="bg-white dark:bg-slate-805 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : servicedVehicles.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl p-12 text-center shadow-sm">
                <span className="text-4xl mb-4 block">🚗</span>
                <h3 className="text-lg font-bold text-slate-805 dark:text-white">Không tìm thấy phương tiện nào</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Chưa có phương tiện nào làm dịch vụ hoặc kết quả tìm kiếm không khớp.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                        <th className="px-6 py-4">Biển số</th>
                        <th className="px-6 py-4">Loại xe</th>
                        <th className="px-6 py-4">Hãng & Dòng xe</th>
                        <th className="px-6 py-4">Số Odometer hiện tại</th>
                        <th className="px-6 py-4">Chủ sở hữu</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-700 dark:text-slate-200">
                      {servicedVehicles.map((vehicle) => (
                        <tr key={vehicle.VehicleID} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                          <td className="px-6 py-4 font-black">
                            <span className="border border-slate-800 dark:border-slate-400 rounded px-2 py-0.5 tracking-wider bg-white dark:bg-slate-900 text-xs">
                              {vehicle.LicensePlate}
                            </span>
                          </td>
                          <td className="px-6 py-4">{vehicle.VehicleType}</td>
                          <td className="px-6 py-4 font-bold">{vehicle.Brand} {vehicle.Model}</td>
                          <td className="px-6 py-4 font-medium">{vehicle.CurrentOdometer.toLocaleString()} km</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{vehicle.OwnerName}</div>
                            <div className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">{vehicle.OwnerPhone}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewVehicleProfile(vehicle.VehicleID)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition"
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
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS & DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Báo cáo vận hành Gara</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi doanh số, thống kê tần suất xe đến xưởng và các khách hàng thân thiết.</p>
            </div>

            {analyticsError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {analyticsError}
              </div>
            )}

            {loadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl"></div>
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl"></div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tổng Doanh Thu Dịch Vụ</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                        {formatCurrency(analyticsData.totalRevenue)}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-2xl flex items-center justify-center rounded-2xl border border-emerald-100/30">
                      💰
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tổng Số Đầu Xe Độc Bản</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">
                        {analyticsData.totalVehicles} <span className="text-sm font-normal text-slate-500">xe</span>
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-2xl flex items-center justify-center rounded-2xl border border-indigo-100/30">
                      🚗
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Visits (Bar Chart) */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">📈 Lượng xe đến xưởng 15 ngày qua</h3>
                      <p className="text-xs text-slate-400 mb-6">Thống kê số lượt bảo dưỡng thực hiện mỗi ngày.</p>
                    </div>

                    <div className="flex items-end gap-1.5 sm:gap-2 h-48 pt-6 border-b border-l border-slate-100 dark:border-slate-750 px-2 sm:px-4">
                      {analyticsData.dailyVisits.map((item, idx) => {
                        const maxCount = Math.max(...analyticsData.dailyVisits.map(d => d.count), 1);
                        const heightPercent = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="text-xxs font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition absolute -top-8 whitespace-nowrap z-10">
                              {item.count} lượt
                            </div>
                            <div
                              className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300"
                              style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            ></div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 block transform -rotate-45 sm:rotate-0 whitespace-nowrap">
                              {item.date.split('/')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">Chú thích: (Ngày/Tháng)</div>
                  </div>

                  {/* Monthly Revenue (Horizontal Bars) */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">📊 Doanh thu dịch vụ theo tháng</h3>
                      <p className="text-xs text-slate-400 mb-6">Doanh thu tích lũy hàng tháng trong năm hiện tại.</p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-48 pr-1">
                      {analyticsData.monthlyRevenue.map((item, idx) => {
                        const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue), 1);
                        const widthPercent = (item.revenue / maxRevenue) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-4 text-xs">
                            <span className="w-16 text-slate-500 dark:text-slate-450 font-bold shrink-0">{item.month}</span>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-750 h-3 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${widthPercent}%` }}
                              ></div>
                            </div>
                            <span className="w-20 text-right text-slate-700 dark:text-slate-200 font-bold shrink-0">
                              {item.revenue > 0 ? formatCurrency(item.revenue) : '0 ₫'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Customers list */}
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">⭐ Top 5 khách hàng thân thiết nhất</h3>
                  <p className="text-xs text-slate-400 mb-4">Các đầu xe thực hiện bảo dưỡng nhiều lần nhất tại xưởng của bạn.</p>

                  {analyticsData.frequentCustomers.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">Chưa có đủ dữ liệu.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                            <th className="px-4 py-3">Biển số</th>
                            <th className="px-4 py-3">Hãng & Dòng xe</th>
                            <th className="px-4 py-3">Chủ sở hữu</th>
                            <th className="px-4 py-3 text-right">Số lần đến bảo dưỡng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                          {analyticsData.frequentCustomers.map((cust, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="px-4 py-3 font-black">
                                <span className="border border-slate-800 dark:border-slate-400 rounded px-2 py-0.5 bg-white dark:bg-slate-900 text-[11px]">
                                  {cust.LicensePlate}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold">{cust.Brand} {cust.Model}</td>
                              <td className="px-4 py-3 font-medium">{cust.OwnerName}</td>
                              <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                {cust.VisitCount} lần
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 4: QUICK ACTION SEARCH & LOG */}
        {activeTab === 'quick' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Bảng quản lý nhanh</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Tìm kiếm nhanh phương tiện để tra cứu thông tin hoặc ghi nhanh nhật ký bảo dưỡng.</p>
              </div>

              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                Ghi nhận bảo dưỡng mới
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột Tìm kiếm & Thông tin nhanh xe */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">🔍 Tra cứu biển số xe</h3>
                  <form onSubmit={handleQuickSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={licensePlateSearch}
                      onChange={(e) => setLicensePlateSearch(e.target.value)}
                      placeholder="Ví dụ: 59A-123.45"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    />
                    <button
                      type="submit"
                      disabled={searchingQuick}
                      className="px-4 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50"
                    >
                      {searchingQuick ? '...' : 'Tìm'}
                    </button>
                  </form>

                  {quickSearchError && (
                    <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                      {quickSearchError}
                    </div>
                  )}

                  {foundVehicle && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                          {foundVehicle.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                        </span>
                        <span className="px-3 py-1 border-2 border-slate-800 dark:border-slate-400 bg-white dark:bg-slate-900 rounded-md text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-xs shrink-0 whitespace-nowrap">
                          {foundVehicle.LicensePlate}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Tên xe / Hãng</span>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white">
                          {foundVehicle.Brand} {foundVehicle.Model}
                        </h4>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Chỉ số Odo hiện tại</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">
                          {foundVehicle.CurrentOdometer.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-slate-500">km</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột Lịch sử sửa chữa của xe được tìm nhanh */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm min-h-[400px] flex flex-col">
                  <h3 className="text-lg font-black text-slate-805 dark:text-white mb-4">
                    📋 Nhật ký sửa chữa của xe
                  </h3>

                  {!foundVehicle ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-750">
                      <span className="text-4xl mb-2">🚗</span>
                      <p className="text-sm font-medium">Nhập biển số xe ở thanh tra cứu để xem hồ sơ và lịch sử sửa chữa của xe đó.</p>
                    </div>
                  ) : loadingQuickHistory ? (
                    <div className="space-y-4 flex-1">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                      ))}
                    </div>
                  ) : quickHistoryError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-amber-600 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-100/30 space-y-3">
                      <span className="text-3xl">⚠️</span>
                      <p className="text-sm font-semibold max-w-md">{quickHistoryError}</p>
                      <button
                        onClick={() => setIsQuickLogOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                      >
                        Thực hiện bảo dưỡng để ghi nhận lịch sử
                      </button>
                    </div>
                  ) : quickVehicleHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/30 rounded-2xl border border-dashed border-slate-250">
                      <span className="text-3xl mb-2">📝</span>
                      <p className="text-sm">Xe này chưa từng được bảo dưỡng tại bất kỳ gara nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                      {quickVehicleHistory.map((record) => (
                        <div
                          key={record.HistoryID}
                          className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-750 rounded-2xl p-5 space-y-3 hover:shadow-xs transition"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-2.5">
                            <div className="flex items-center gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-semibold block">Ngày làm</span>
                                <strong className="text-slate-700 dark:text-slate-350">
                                  {new Date(record.ExecutionDate).toLocaleDateString()}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-semibold block">Số Odo</span>
                                <strong className="text-slate-750 dark:text-white">
                                  {record.ExecutionOdometer.toLocaleString()} km
                                </strong>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xxs text-slate-400 dark:text-slate-500 block uppercase font-semibold">Thành tiền</span>
                              <strong className="text-base text-indigo-600 dark:text-indigo-400 font-black">
                                {formatCurrency(record.TotalCost)}
                              </strong>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xxs text-slate-400 dark:text-slate-500 block uppercase font-semibold">Nội dung chi tiết</span>
                            <p className="text-sm text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {record.Details}
                            </p>
                          </div>

                          {record.GarageName && (
                            <div className="text-xxs text-slate-400 dark:text-slate-500 flex justify-between items-center pt-2 bg-white/40 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750">
                              <span>🔧 Nơi thực hiện: <strong>{record.GarageName}</strong></span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS RENDER --- */}
      {/* 1. Quick Log Modal */}
      <GarageHistoryModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSave={handleSaveQuickHistoryLog}
      />

      {/* 2. Complete Appointment Modal */}
      <CompleteAppointmentModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onSave={handleSaveCompleteAppointment}
        appointment={selectedApptForComplete}
      />

      {/* 3. Vehicle Profile Modal */}
      <VehicleProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        vehicleId={selectedVehicleId}
      />
    </div>
  );
};

export default GarageDashboard;
