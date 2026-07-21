import api from './api';

export const createAppointment = async (appointmentData) => {
  try {
    const res = await api.post('/api/appointments', appointmentData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể đặt lịch hẹn mới' };
  }
};

export const getAppointmentsUser = async () => {
  try {
    const res = await api.get('/api/appointments/user');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách lịch hẹn' };
  }
};

export const getAppointmentsGarage = async () => {
  try {
    const res = await api.get('/api/appointments/garage');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách lịch hẹn đặt tại Gara' };
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const res = await api.patch(`/api/appointments/${id}/status`, { status });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật trạng thái lịch hẹn' };
  }
};

export const completeAppointment = async (id, completeData) => {
  try {
    const res = await api.patch(`/api/appointments/${id}/complete-and-notify`, completeData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể hoàn tất lịch bảo dưỡng' };
  }
};
