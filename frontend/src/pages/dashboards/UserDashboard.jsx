import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as vehicleService from '../../services/vehicleService';
import * as appointmentService from '../../services/appointmentService';
import * as garageService from '../../services/garageService';
import VehicleFormModal from '../../components/vehicles/VehicleFormModal';
import OdometerModal from '../../components/vehicles/OdometerModal';
import AppointmentModal from '../../components/appointments/AppointmentModal';
import MaintenanceSchedulesTab from '../../components/maintenances/MaintenanceSchedulesTab';
import MaintenanceHistoryTab from '../../components/maintenances/MaintenanceHistoryTab';
import LegalDocumentsTab from '../../components/legal/LegalDocumentsTab';
import NotificationBell from '../../components/notifications/NotificationBell';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOdometerOpen, setIsOdometerOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Detail view state
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'history'

  // Main Page sub-tab (Module 7 Expense Analytics)
  const [mainTab, setMainTab] = useState('vehicles');
  const [expensesData, setExpensesData] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expensesError, setExpensesError] = useState('');

  const fetchUserExpenses = async () => {
    setLoadingExpenses(true);
    setExpensesError('');
    try {
      const data = await garageService.getUserExpenses();
      setExpensesData(data);
    } catch (err) {
      setExpensesError(err.message || 'Không thể tải phân tích chi tiêu.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (!selectedVehicleForDetail && mainTab === 'expenses') {
      fetchUserExpenses();
    }
  }, [selectedVehicleForDetail, mainTab]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptError, setApptError] = useState('');

  const fetchAppointments = async () => {
    if (!selectedVehicleForDetail) return;
    setLoadingAppts(true);
    setApptError('');
    try {
      const data = await appointmentService.getAppointmentsUser();
      const filtered = data.filter(a => a.VehicleID === selectedVehicleForDetail.VehicleID);
      setAppointments(filtered);
    } catch (err) {
      setApptError(err.message || 'Không thể tải danh sách lịch đặt hẹn.');
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (selectedVehicleForDetail && activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [selectedVehicleForDetail, activeTab]);

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch đặt hẹn này?')) {
      try {
        await appointmentService.updateAppointmentStatus(apptId, 'Hủy lịch');
        alert('Đã hủy lịch hẹn thành công!');
        fetchAppointments();
      } catch (err) {
        alert(err.message || 'Không thể hủy lịch hẹn');
      }
    }
  };

  const handleSaveAppointment = async (data) => {
    await appointmentService.createAppointment(data);
    alert('Đặt lịch hẹn bảo dưỡng thành công!');
    fetchAppointments();
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
      
      // Update selected detail vehicle info if it is currently open
      if (selectedVehicleForDetail) {
        const updated = data.find(v => v.VehicleID === selectedVehicleForDetail.VehicleID);
        if (updated) {
          setSelectedVehicleForDetail(updated);
        } else {
          setSelectedVehicleForDetail(null); // Vehicle was deleted
        }
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleOdometerClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsOdometerOpen(true);
  };

  const handleSaveVehicle = async (data) => {
    if (selectedVehicle) {
      // Edit mode
      await vehicleService.updateVehicle(selectedVehicle.VehicleID, data);
    } else {
      // Add mode
      await vehicleService.createVehicle(data);
    }
    fetchVehicles();
  };

  const handleSaveOdometer = async (id, odometer) => {
    await vehicleService.updateOdometer(id, odometer);
    fetchVehicles();
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phương tiện này? Mọi dữ liệu liên quan sẽ bị xóa!')) {
      try {
        await vehicleService.deleteVehicle(id);
        fetchVehicles();
      } catch (err) {
        alert(err.message || 'Xóa phương tiện thất bại');
      }
    }
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
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">ACOH Autocare</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AutoCare Office Helper</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
              Chào, <span className="font-bold text-slate-800 dark:text-white">{user?.fullName}</span>
            </span>
            <a
              href="/profile"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-750 dark:text-slate-200 flex items-center justify-center font-black border border-slate-200 dark:border-slate-600 hover:shadow-xs transition shrink-0"
              title="Cài đặt tài khoản"
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Detail View của một chiếc xe */}
        {selectedVehicleForDetail ? (
          <div className="space-y-6">
            {/* Nút Back */}
            <button
              onClick={() => setSelectedVehicleForDetail(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-650 hover:text-slate-850 dark:text-slate-350 dark:hover:text-white bg-white dark:bg-slate-805 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách xe
            </button>

            {/* Thông tin nhanh xe */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-300">
                    {selectedVehicleForDetail.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                  </span>
                  <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm shrink-0 whitespace-nowrap">
                    {selectedVehicleForDetail.LicensePlate}
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                  {selectedVehicleForDetail.Brand} {selectedVehicleForDetail.Model}
                </h2>
                <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <p>Năm sản xuất: <strong className="text-slate-700 dark:text-slate-350">{selectedVehicleForDetail.ManufactureYear || 'Không rõ'}</strong></p>
                  <p>Ngày mua: <strong className="text-slate-700 dark:text-slate-350">{selectedVehicleForDetail.PurchaseDate ? new Date(selectedVehicleForDetail.PurchaseDate).toLocaleDateString() : 'Không rõ'}</strong></p>
                </div>
              </div>

              <div className="flex flex-col justify-center items-start md:items-end gap-3 bg-slate-50 dark:bg-slate-700/40 p-5 rounded-2xl md:min-w-[200px]">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">Số Odo Hiện Tại</span>
                <p className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                  {selectedVehicleForDetail.CurrentOdometer.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal">km</span>
                </p>
                <button
                  onClick={() => handleOdometerClick(selectedVehicleForDetail)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition w-full md:w-auto"
                >
                  Cập nhật km
                </button>
              </div>
            </div>

            {/* Tabs bảo dưỡng */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'schedules'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  📅 Kế hoạch bảo dưỡng
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  🔧 Nhật ký sửa chữa
                </button>
                <button
                  onClick={() => setActiveTab('legal')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'legal'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  📄 Giấy tờ & Bảo hiểm
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'appointments'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  📅 Đặt lịch bảo dưỡng
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {activeTab === 'schedules' && (
                  <MaintenanceSchedulesTab
                    vehicleId={selectedVehicleForDetail.VehicleID}
                    currentOdometer={selectedVehicleForDetail.CurrentOdometer}
                  />
                )}
                {activeTab === 'history' && (
                  <MaintenanceHistoryTab vehicleId={selectedVehicleForDetail.VehicleID} />
                )}
                {activeTab === 'legal' && (
                  <LegalDocumentsTab
                    vehicleId={selectedVehicleForDetail.VehicleID}
                    vehicleType={selectedVehicleForDetail.VehicleType}
                  />
                )}
                {activeTab === 'appointments' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-750">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white">Đặt lịch bảo dưỡng tại Gara đối tác</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Chọn gara, thời gian và đặt lịch hẹn để được phục vụ tốt nhất.</p>
                      </div>
                      <button
                        onClick={() => setIsAppointmentOpen(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        + Đặt lịch sửa xe
                      </button>
                    </div>

                    {apptError && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                        {apptError}
                      </div>
                    )}

                    {loadingAppts ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700"></div>
                        ))}
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-900/10">
                        <span className="text-3xl mb-2 block">📅</span>
                        <p className="text-sm">Chưa có lịch đặt hẹn nào cho xe này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appt) => (
                          <div
                            key={appt.AppointmentID}
                            className="bg-white dark:bg-slate-800/40 border border-slate-150 dark:border-slate-750 rounded-2xl p-5 hover:shadow-xs transition space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-750 pb-3">
                              <div>
                                <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Gara Đối Tác</span>
                                <h4 className="text-base font-black text-slate-800 dark:text-white leading-snug">
                                  {appt.GarageName}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  📍 {appt.GarageAddress} | 📞 {appt.GaragePhone}
                                </p>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  appt.Status === 'Chờ xác nhận' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                                  appt.Status === 'Đã xác nhận' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                                  appt.Status === 'Đang sửa chữa' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30' :
                                  appt.Status === 'Hoàn thành' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                                  'bg-slate-50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}>
                                  {appt.Status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Thời gian hẹn</span>
                                <strong className="text-slate-700 dark:text-slate-200 text-sm">
                                  {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Ghi chú của bạn</span>
                                <p className="text-slate-655 dark:text-slate-300 italic text-xs leading-relaxed">
                                  {appt.Notes || 'Không có ghi chú.'}
                                </p>
                              </div>
                            </div>

                            {(appt.Status === 'Chờ xác nhận' || appt.Status === 'Đã xác nhận') && (
                              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-750/50 mt-1">
                                <button
                                  onClick={() => handleCancelAppointment(appt.AppointmentID)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 transition"
                                >
                                  Hủy lịch hẹn
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid Danh sách xe */
          <>
            {/* Welcome Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Góc Quản lý Phương tiện</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi số kilomet đi được để lập kế hoạch bảo dưỡng định kỳ.</p>
              </div>
              <button
                onClick={handleAddClick}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 self-center sm:self-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm phương tiện mới
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Tab selection bar for the main page (only show if vehicles exist or loading) */}
            {vehicles.length > 0 && (
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <button
                  onClick={() => setMainTab('vehicles')}
                  className={`flex-1 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
                    mainTab === 'vehicles'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-900/10'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  🚗 Xe của tôi ({vehicles.length})
                </button>
                <button
                  onClick={() => setMainTab('expenses')}
                  className={`flex-1 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
                    mainTab === 'expenses'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-900/10'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  📊 Phân tích chi tiêu
                </button>
              </div>
            )}

            {/* Rendering based on mainTab */}
            {(mainTab === 'vehicles' || vehicles.length === 0) ? (
              /* Vehicles Grid */
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 rounded-3xl bg-slate-250 dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700"></div>
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl p-12 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-4 animate-bounce">
                    🚗
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Chưa có phương tiện nào</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Hãy thêm chiếc xe đầu tiên của bạn để kích hoạt hệ thống nhắc lịch bảo dưỡng.</p>
                  <button
                    onClick={handleAddClick}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    Thêm xe ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.VehicleID}
                      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-300">
                              {vehicle.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                            </span>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-2">
                              {vehicle.Brand} {vehicle.Model}
                            </h3>
                          </div>
                          
                          {/* License Plate Plate-like UI */}
                          <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm flex items-center justify-center h-8 shrink-0 whitespace-nowrap">
                            {vehicle.LicensePlate}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Số kilomet (Odometer)</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                              {vehicle.CurrentOdometer.toLocaleString()}{' '}
                              <span className="text-xs text-slate-500 font-normal">km</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Năm sản xuất</p>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {vehicle.ManufactureYear || 'Không rõ'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                        <span className="text-xxs text-slate-400 dark:text-slate-500">
                          Cập nhật: {new Date(vehicle.UpdatedAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVehicleForDetail(vehicle)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
                          >
                            Xem bảo dưỡng
                          </button>
                          <button
                            onClick={() => handleOdometerClick(vehicle)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                          >
                            Cập nhật km
                          </button>
                          <button
                            onClick={() => handleEditClick(vehicle)}
                            className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
                            title="Sửa thông tin"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vehicle.VehicleID)}
                            className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/40 transition"
                            title="Xóa phương tiện"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Expenses Analytics Tab (Module 7) */
              <div className="space-y-6 animate-in fade-in duration-200">
                {expensesError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                    {expensesError}
                  </div>
                )}

                {loadingExpenses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                  </div>
                ) : expensesData ? (
                  <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tổng Chi Phí Bảo Dưỡng Tích Lũy</span>
                        <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                          {formatCurrency(expensesData.totalCost)}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-2xl flex items-center justify-center rounded-2xl border border-indigo-100/30">
                        💳
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Monthly Costs */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-805 dark:text-white mb-1">📅 Chi phí nuôi xe theo tháng (năm nay)</h3>
                        <p className="text-xs text-slate-400 mb-6">Theo dõi tổng tiền bảo dưỡng phát sinh qua các tháng.</p>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {expensesData.monthlyCost.map((item, idx) => {
                            const maxCost = Math.max(...expensesData.monthlyCost.map(m => m.cost), 1);
                            const widthPercent = (item.cost / maxCost) * 100;
                            return (
                              <div key={idx} className="flex items-center gap-4 text-xs">
                                <span className="w-16 text-slate-500 dark:text-slate-450 font-bold shrink-0">{item.month}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-750 h-3 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${widthPercent}%` }}
                                  ></div>
                                </div>
                                <span className="w-20 text-right text-slate-750 dark:text-slate-200 font-bold shrink-0">
                                  {item.cost > 0 ? formatCurrency(item.cost) : '0 ₫'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cost by Vehicle */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-805 dark:text-white mb-1">🚗 Chi phí theo đầu phương tiện</h3>
                        <p className="text-xs text-slate-400 mb-6">So sánh chi phí bảo dưỡng giữa các xe của bạn.</p>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                          {expensesData.expensesByVehicle.map((vehicle, idx) => {
                            const maxCost = Math.max(...expensesData.expensesByVehicle.map(v => v.TotalCost), 1);
                            const widthPercent = (vehicle.TotalCost / maxCost) * 100;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-slate-700 dark:text-slate-200">{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate})</span>
                                  <span className="text-slate-550 dark:text-slate-400 font-bold">{formatCurrency(vehicle.TotalCost)}</span>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-750 h-3 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${widthPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Recent Maintenance History list */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">📋 Các hạng mục chi tiêu gần nhất</h3>
                      <p className="text-xs text-slate-400 mb-4">Các dịch vụ sửa chữa có phát sinh chi phí bảo dưỡng gần đây.</p>
                      
                      {expensesData.recentHistory.length === 0 ? (
                        <div className="text-center py-6 text-slate-405">Chưa phát sinh chi phí sửa chữa nào.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                <th className="px-4 py-3">Xe thực hiện</th>
                                <th className="px-4 py-3">Ngày làm</th>
                                <th className="px-4 py-3">Nơi thực hiện</th>
                                <th className="px-4 py-3">Nội dung sửa chữa</th>
                                <th className="px-4 py-3 text-right">Chi phí</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                              {expensesData.recentHistory.map((hist, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                                    {hist.Brand} {hist.Model} ({hist.LicensePlate})
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">{new Date(hist.ExecutionDate).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{hist.GarageName || 'Tự bảo dưỡng'}</td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{hist.Details}</td>
                                  <td className="px-4 py-3 text-right font-black text-indigo-650 dark:text-indigo-400 text-sm">
                                    {formatCurrency(hist.TotalCost)}
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
          </>
        )}
      </main>

      {/* Modals */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />

      <OdometerModal
        isOpen={isOdometerOpen}
        onClose={() => setIsOdometerOpen(false)}
        onSave={handleSaveOdometer}
        vehicle={selectedVehicle}
      />

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        onSave={handleSaveAppointment}
        vehicle={selectedVehicleForDetail}
      />
    </div>
  );
};

export default UserDashboard;
