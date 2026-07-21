import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as maintenanceService from '../../services/maintenanceService';
import GarageHistoryModal from '../../components/maintenances/GarageHistoryModal';
import NotificationBell from '../../components/notifications/NotificationBell';

const GarageDashboard = () => {
  const { user, logout } = useAuth();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search vehicle state
  const [licensePlateSearch, setLicensePlateSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundVehicle, setFoundVehicle] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Vehicle detail history state
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!licensePlateSearch.trim()) return;

    setSearching(true);
    setSearchError('');
    setFoundVehicle(null);
    setVehicleHistory([]);
    setHistoryError('');

    try {
      const vehicle = await maintenanceService.searchVehicle(licensePlateSearch.trim());
      setFoundVehicle(vehicle);
      
      // Sau khi tìm thấy xe, thử tải lịch sử sửa chữa của xe này
      await fetchVehicleHistory(vehicle.VehicleID);
    } catch (err) {
      setSearchError(err.message || 'Không tìm thấy phương tiện nào với biển số xe này.');
    } finally {
      setSearching(false);
    }
  };

  const fetchVehicleHistory = async (vehicleId) => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const history = await maintenanceService.getHistory(vehicleId);
      setVehicleHistory(history);
    } catch (err) {
      // Nếu ném lỗi 403 Forbidden (chưa có lịch sử giao dịch trước đây)
      if (err.status === 403) {
        setHistoryError('Bạn chưa có quyền xem lịch sử sửa chữa chung của xe này (Chưa từng thực hiện dịch vụ hoặc lịch hẹn tại tiệm của bạn).');
      } else {
        setHistoryError(err.message || 'Không thể tải lịch sử sửa chữa của xe này.');
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveHistoryLog = async (data) => {
    await maintenanceService.createHistoryGarage(data);
    alert('Ghi sổ bảo dưỡng dịch vụ thành công!');
    
    // Nếu xe vừa được bảo dưỡng chính là xe đang được tìm kiếm, tải lại lịch sử của nó
    if (foundVehicle && foundVehicle.VehicleID === data.vehicleId) {
      fetchVehicleHistory(data.vehicleId);
      // Cập nhật lại Odometer hiển thị của xe vừa tìm thấy nếu số km mới lớn hơn
      if (data.executionOdometer > foundVehicle.CurrentOdometer) {
        setFoundVehicle({
          ...foundVehicle,
          CurrentOdometer: data.executionOdometer
        });
      }
    }
  };

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
              <h1 className="text-xl font-bold text-slate-805 dark:text-white leading-tight">ACOH Garage</h1>
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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
            >
              Hồ sơ Gara
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Welcome & Action Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Bảng quản lý dịch vụ</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Tìm kiếm phương tiện để tra cứu thông tin hoặc lập hóa đơn/ghi nhận lịch sử sửa chữa.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Ghi nhận bảo dưỡng mới
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột Tìm kiếm & Thông tin xe */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-slate-805 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">🔍 Tra cứu biển số xe</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={licensePlateSearch}
                  onChange={(e) => setLicensePlateSearch(e.target.value)}
                  placeholder="Ví dụ: 59A-123.45"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center disabled:opacity-50"
                >
                  {searching ? '...' : 'Tìm'}
                </button>
              </form>

              {searchError && (
                <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                  {searchError}
                </div>
              )}

              {foundVehicle && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                      {foundVehicle.VehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                    </span>
                    <span className="px-3 py-1 border-2 border-slate-800 dark:border-slate-400 bg-white dark:bg-slate-900 rounded-md text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-xs">
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

          {/* Cột Lịch sử sửa chữa của xe được tìm thấy */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm min-h-[400px] flex flex-col">
              <h3 className="text-lg font-black text-slate-805 dark:text-white mb-4">
                📋 Nhật ký sửa chữa của xe
              </h3>

              {!foundVehicle ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-450 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-750">
                  <span className="text-4xl mb-2">🚗</span>
                  <p className="text-sm font-medium">Nhập biển số xe ở thanh tra cứu để xem hồ sơ và lịch sử sửa chữa của xe đó.</p>
                </div>
              ) : loadingHistory ? (
                <div className="space-y-4 flex-1">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  ))}
                </div>
              ) : historyError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-amber-600 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-100/30 space-y-3">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-sm font-semibold max-w-md">{historyError}</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                  >
                    Thực hiện bảo dưỡng để ghi nhận lịch sử
                  </button>
                </div>
              ) : vehicleHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-450 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-3xl mb-2">📝</span>
                  <p className="text-sm">Xe này chưa từng được bảo dưỡng tại bất kỳ gara nào.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                  {vehicleHistory.map((record) => (
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
                        <div className="text-xxs text-slate-450 dark:text-slate-500 flex justify-between items-center pt-2 bg-white/40 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750">
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
      </main>

      <GarageHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHistoryLog}
      />
    </div>
  );
};

export default GarageDashboard;
