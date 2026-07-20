import api from './api';

export const getSchedules = async (vehicleId) => {
  try {
    const res = await api.get(`/api/maintenances/schedules/${vehicleId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách lịch nhắc bảo dưỡng' };
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const res = await api.post('/api/maintenances/schedules', scheduleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tạo lịch nhắc bảo dưỡng mới' };
  }
};

export const updateSchedule = async (id, scheduleData) => {
  try {
    const res = await api.put(`/api/maintenances/schedules/${id}`, scheduleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật lịch nhắc bảo dưỡng' };
  }
};

export const deleteSchedule = async (id) => {
  try {
    const res = await api.delete(`/api/maintenances/schedules/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa lịch nhắc bảo dưỡng' };
  }
};

export const getHistory = async (vehicleId) => {
  try {
    const res = await api.get(`/api/maintenances/history/${vehicleId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải nhật ký sửa chữa' };
  }
};

export const createHistoryGarage = async (historyData) => {
  try {
    const res = await api.post('/api/maintenances/history/garage', historyData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể ghi nhật ký bảo dưỡng' };
  }
};

export const searchVehicle = async (licensePlate) => {
  try {
    const res = await api.get(`/api/maintenances/vehicles/search?licensePlate=${encodeURIComponent(licensePlate)}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không tìm thấy phương tiện' };
  }
};
