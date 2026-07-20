import { useState, useEffect } from 'react';
import * as maintenanceService from '../../services/maintenanceService';
import ScheduleModal from './ScheduleModal';

const MaintenanceSchedulesTab = ({ vehicleId, currentOdometer }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getSchedules(vehicleId);
      setSchedules(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhắc lịch bảo dưỡng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchSchedules();
    }
  }, [vehicleId]);

  const handleAddClick = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async (data) => {
    if (selectedSchedule) {
      await maintenanceService.updateSchedule(selectedSchedule.ScheduleID, data);
    } else {
      await maintenanceService.createSchedule(data);
    }
    fetchSchedules();
  };

  const handleMarkAsCompleted = async (scheduleId) => {
    if (window.confirm('Đánh dấu lịch nhắc bảo dưỡng này là ĐÃ HOÀN THÀNH?')) {
      try {
        await maintenanceService.updateSchedule(scheduleId, { status: 'Đã hoàn thành' });
        fetchSchedules();
      } catch (err) {
        alert(err.message || 'Thao tác thất bại');
      }
    }
  };

  const handleDeleteClick = async (scheduleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch nhắc bảo dưỡng này?')) {
      try {
        await maintenanceService.deleteSchedule(scheduleId);
        fetchSchedules();
      } catch (err) {
        alert(err.message || 'Xóa lịch nhắc thất bại');
      }
    }
  };

  // Tính số km còn lại và ngày còn lại để hiển thị cảnh báo thông minh
  const getScheduleAlertInfo = (schedule) => {
    let kmRemainingText = '';
    let dateRemainingText = '';
    let isWarning = false;

    if (schedule.Status === 'Đã hoàn thành') {
      return { text: 'Hoàn thành', style: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30' };
    }

    if (schedule.TargetOdometer) {
      const kmDiff = schedule.TargetOdometer - currentOdometer;
      if (kmDiff <= 0) {
        kmRemainingText = 'Đã vượt mốc km nhắc nhở';
        isWarning = true;
      } else {
        kmRemainingText = `Còn ${kmDiff.toLocaleString()} km`;
        if (kmDiff <= schedule.AlertThresholdKM) {
          isWarning = true;
        }
      }
    }

    if (schedule.TargetDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const target = new Date(schedule.TargetDate);
      target.setHours(0,0,0,0);
      
      const timeDiff = target.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) {
        dateRemainingText = 'Đã quá hạn ngày nhắc nhở';
        isWarning = true;
      } else {
        dateRemainingText = `Còn ${daysDiff} ngày`;
        if (daysDiff <= 30) {
          isWarning = true;
        }
      }
    }

    if (schedule.Status === 'Quá hạn' || isWarning) {
      const text = [kmRemainingText, dateRemainingText].filter(Boolean).join(' | ') || 'Sắp đến hạn/Quá hạn';
      return { 
        text, 
        style: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30' 
      };
    }

    const text = [kmRemainingText, dateRemainingText].filter(Boolean).join(' | ') || 'Chưa thực hiện';
    return { 
      text, 
      style: 'text-slate-600 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-350 border border-slate-100 dark:border-slate-750' 
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white">Kế hoạch bảo dưỡng dự kiến</h4>
          <p className="text-xs text-slate-500">Các hạng mục xe cần bảo dưỡng định kỳ để nâng cao tuổi thọ xe.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm lịch nhắc mới
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-750">
          <p className="text-sm text-slate-500">Chưa thiết lập lịch nhắc bảo dưỡng nào cho xe này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => {
            const alertInfo = getScheduleAlertInfo(schedule);
            return (
              <div
                key={schedule.ScheduleID}
                className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-750/70 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-slate-800 dark:text-white text-base">
                      {schedule.CategoryName}
                    </h5>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-semibold ${alertInfo.style}`}>
                      {alertInfo.text}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {schedule.TargetOdometer && (
                      <span className="flex items-center gap-1">
                        🏁 Mốc kilomet: <strong className="text-slate-700 dark:text-slate-350">{schedule.TargetOdometer.toLocaleString()} km</strong>
                      </span>
                    )}
                    {schedule.TargetDate && (
                      <span className="flex items-center gap-1">
                        📅 Ngày đích: <strong className="text-slate-700 dark:text-slate-350">{new Date(schedule.TargetDate).toLocaleDateString()}</strong>
                      </span>
                    )}
                  </div>
                  {schedule.Notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-450 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-750 mt-1">
                      💡 {schedule.Notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700/60">
                  {schedule.Status === 'Chưa thực hiện' && (
                    <button
                      onClick={() => handleMarkAsCompleted(schedule.ScheduleID)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-xl transition"
                    >
                      Đã xong ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(schedule)}
                    className="p-1.5 rounded-lg text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-700"
                    title="Chỉnh sửa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(schedule.ScheduleID)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        schedule={selectedSchedule}
        vehicleId={vehicleId}
      />
    </div>
  );
};

export default MaintenanceSchedulesTab;
