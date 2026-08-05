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

export const getPreferences = async () => {
  try {
    const res = await api.get('/api/notifications/preferences');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy cấu hình thông báo' };
  }
};

export const updatePreferences = async (data) => {
  try {
    const res = await api.put('/api/notifications/preferences', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật cấu hình thông báo' };
  }
};

export const sendTestZns = async (data) => {
  try {
    const res = await api.post('/api/notifications/zns/test-send', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi gửi thử tin nhắn Zalo ZNS' };
  }
};

export const getNotificationLogs = async () => {
  try {
    const res = await api.get('/api/notifications/logs');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy nhật ký gửi tin nhắn' };
  }
};

