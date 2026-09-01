import { useState, useEffect } from 'react';
import * as appointmentService from '../../services/appointmentService';
import AppointmentDetailViewModal from './AppointmentDetailViewModal';

const statusTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Đã đặt' },
  { id: 'confirmed', label: 'Xác nhận' },
  { id: 'in_progress', label: 'Đang thực hiện' },
  { id: 'completed', label: 'Hoàn thành' },
];

const AppointmentsPageSection = ({
  onBack,
  onOpenNewAppointment,
  onOpenPayment,
  onOpenReview,
  onCancelAppointment,
  onExportInvoice,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApptForDetail, setSelectedApptForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await appointmentService.getAppointmentsUser();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch user appointments error:', err);
      if (err?.status === 404 || err?.response?.status === 404) {
        setAppointments([]);
      } else {
        const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách lịch hẹn.';
        setError(typeof msg === 'string' ? msg : 'Không thể tải danh sách lịch hẹn.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appt) => {
    const status = appt.Status || '';
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return status === 'Chờ xác nhận';
    if (activeFilter === 'confirmed') return status === 'Đã xác nhận' || status === 'Đã cọc';
    if (activeFilter === 'in_progress') return status === 'Đang sửa chữa' || status === 'Đang thực hiện';
    if (activeFilter === 'completed') return status === 'Hoàn thành';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-20 select-none">
      {/* 1. Header Bar */}
      <div className="md:hidden bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="!text-white text-base font-black tracking-tight !m-0 !p-0" style={{ color: '#ffffff' }}>
            Lịch hẹn
          </h1>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-white/25 active:scale-95"
        >
          <span>+ Đặt lịch mới</span>
        </button>
      </div>

      {/* Desktop Header Banner */}
      <div className="hidden md:block bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-6 px-6 shadow-sm border-b border-indigo-950/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200 mb-1">
              <button onClick={onBack} className="hover:text-white transition cursor-pointer">Trang chủ</button>
              <span>/</span>
              <span className="text-white font-bold">Quản lý lịch hẹn</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight !m-0 !p-0">
              Danh sách lịch hẹn bảo dưỡng & sửa chữa
            </h1>
          </div>
          <button
            onClick={onOpenNewAppointment}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            <span>Đặt lịch hẹn mới</span>
          </button>
        </div>
      </div>

      {/* 2. Status Filter Tabs Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700/80 px-4 sm:px-6 md:px-8 py-3 shadow-2xs sticky top-0 md:top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 flex-1 flex flex-col">
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs sm:text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 animate-pulse"></div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 sm:py-24">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center mb-4 shadow-2xs">
              <svg className="w-10 h-10 sm:w-11 sm:h-11 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01" />
              </svg>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 mb-5">
              Chưa có lịch hẹn nào
            </p>

            <button
              onClick={onOpenNewAppointment}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              Đặt lịch ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.AppointmentID}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 sm:p-5 shadow-xs hover:shadow-md transition space-y-3.5"
              >
                {/* Top Row: Garage Name + Status Badge */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gara Đối Tác</span>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-snug">
                      {appt.GarageName || 'Gara Đối Tác ACOH'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      📍 {appt.GarageAddress} {appt.GaragePhone ? `| 📞 ${appt.GaragePhone}` : ''}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        appt.Status === 'Chờ xác nhận'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : appt.Status === 'Đã xác nhận'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                          : appt.Status === 'Đã cọc'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : appt.Status === 'Đang sửa chữa' || appt.Status === 'Đang thực hiện'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                          : appt.Status === 'Hoàn thành'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {appt.Status === 'Đã cọc' ? '💳 Đã cọc giữ chỗ' : appt.Status}
                    </span>
                  </div>
                </div>

                {/* Middle Info: Time & Vehicle & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Thời gian hẹn</span>
                    <strong className="text-slate-700 dark:text-slate-200 text-sm">
                      {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Phương tiện</span>
                    <strong className="text-slate-700 dark:text-slate-200 text-sm">
                      {appt.Brand && appt.Model ? `${appt.Brand} ${appt.Model} (${appt.LicensePlate})` : `Xe ID: ${appt.VehicleID}`}
                    </strong>
                  </div>

                  {appt.Notes && (
                    <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-750/50 p-2.5 rounded-xl">
                      <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Ghi chú của bạn:</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">{appt.Notes}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    onClick={() => {
                      setSelectedApptForDetail(appt);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔍</span>
                    <span>Xem xe đã sửa những gì</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {(appt.Status === 'Chờ xác nhận' || appt.Status === 'Đã xác nhận') && (
                      <>
                        <button
                          onClick={() => onOpenPayment && onOpenPayment(appt)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          💳 Thanh toán cọc
                        </button>
                        <button
                          onClick={() => onCancelAppointment && onCancelAppointment(appt.AppointmentID, fetchAppointments)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 transition cursor-pointer"
                        >
                          Hủy lịch
                        </button>
                      </>
                    )}

                    {appt.Status === 'Đã cọc' && (
                      <button
                        onClick={() => onOpenPayment && onOpenPayment(appt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 transition flex items-center gap-1 cursor-pointer"
                      >
                        🧾 Biên nhận cọc
                      </button>
                    )}

                    {appt.Status === 'Hoàn thành' && (
                      <>
                        <button
                          onClick={() => onExportInvoice && onExportInvoice(appt.AppointmentID)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          🧾 In hóa đơn
                        </button>
                        <button
                          onClick={() => onOpenReview && onOpenReview(appt)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          ⭐ Đánh giá
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment & Vehicle Service Details Modal */}
      <AppointmentDetailViewModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApptForDetail(null);
        }}
        appointment={selectedApptForDetail}
        onOpenInvoice={(apptId) => {
          if (onExportInvoice) onExportInvoice(apptId);
        }}
        onOpenReview={(appt) => {
          if (onOpenReview) onOpenReview(appt);
        }}
      />
    </div>
  );
};

export default AppointmentsPageSection;