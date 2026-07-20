import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as vehicleService from '../../services/vehicleService';
import VehicleFormModal from '../../components/vehicles/VehicleFormModal';
import OdometerModal from '../../components/vehicles/OdometerModal';
import MaintenanceSchedulesTab from '../../components/maintenances/MaintenanceSchedulesTab';
import MaintenanceHistoryTab from '../../components/maintenances/MaintenanceHistoryTab';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOdometerOpen, setIsOdometerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Detail view state
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'history'

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
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
              Chào, <span className="font-bold text-slate-800 dark:text-white">{user?.fullName}</span>
            </span>
            <a
              href="/profile"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
            >
              Cài đặt tài khoản
            </a>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
            >
              Đăng xuất
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
                  <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm">
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
              <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'schedules'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  📅 Kế hoạch bảo dưỡng
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  🔧 Nhật ký sửa chữa
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {activeTab === 'schedules' ? (
                  <MaintenanceSchedulesTab
                    vehicleId={selectedVehicleForDetail.VehicleID}
                    currentOdometer={selectedVehicleForDetail.CurrentOdometer}
                  />
                ) : (
                  <MaintenanceHistoryTab vehicleId={selectedVehicleForDetail.VehicleID} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid Danh sách xe */
          <>
            {/* Welcome Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Góc Quản lý Phương tiện</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi số kilomet đi được để lập kế hoạch bảo dưỡng định kỳ.</p>
              </div>
              <button
                onClick={handleAddClick}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 self-start sm:self-auto"
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

            {/* Vehicles Grid */}
            {loading ? (
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
                        <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm flex items-center justify-center h-8">
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
    </div>
  );
};

export default UserDashboard;
