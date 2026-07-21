import api from './api';

export const getNotifications = async () => {
  try {
    const res = await api.get('/api/notifications');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách thông báo' };
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể đánh dấu đã đọc thông báo' };
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.patch('/api/notifications/read-all');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể đánh dấu đọc tất cả thông báo' };
  }
};

export const triggerCron = async () => {
  try {
    const res = await api.post('/api/notifications/trigger-cron');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể kích hoạt quét hệ thống' };
  }
};
