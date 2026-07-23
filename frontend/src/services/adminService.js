import api from './api';

export const getStats = async () => {
  try {
    const res = await api.get('/api/admin/stats');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải thống kê hệ thống' };
  }
};

export const getUsers = async (search = '', role = '') => {
  try {
    const res = await api.get(`/api/admin/users?search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách tài khoản' };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const res = await api.put(`/api/admin/users/${userId}/status`, { status });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật trạng thái tài khoản' };
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const res = await api.put(`/api/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật vai trò tài khoản' };
  }
};

export const getGarages = async () => {
  try {
    const res = await api.get('/api/admin/garages');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách Gara' };
  }
};

export const updateGarageStatus = async (garageId, isActive) => {
  try {
    const res = await api.put(`/api/admin/garages/${garageId}/status`, { isActive });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật trạng thái Gara' };
  }
};
