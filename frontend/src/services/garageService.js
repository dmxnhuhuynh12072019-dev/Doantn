import api from './api';

export const getGarages = async () => {
  try {
    const res = await api.get('/api/garages');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách Gara' };
  }
};

export const getServicedVehicles = async (search = '') => {
  try {
    const res = await api.get(`/api/garages/serviced-vehicles?search=${encodeURIComponent(search)}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách xe đã bảo dưỡng' };
  }
};

export const getVehicleProfile = async (vehicleId) => {
  try {
    const res = await api.get(`/api/garages/vehicle-profile/${vehicleId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải thông tin hồ sơ xe' };
  }
};

export const getGarageDashboard = async () => {
  try {
    const res = await api.get('/api/analytics/garage/dashboard');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải dữ liệu báo cáo thống kê' };
  }
};

export const getUserExpenses = async () => {
  try {
    const res = await api.get('/api/analytics/user/expenses');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải báo cáo phân tích chi tiêu' };
  }
};

export const getMyGarageSettings = async () => {
  try {
    const res = await api.get('/api/garages/my-garage');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải thông tin cấu hình Gara' };
  }
};

export const updateMyGarageSettings = async (settingsData) => {
  try {
    const res = await api.put('/api/garages/my-garage', settingsData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật thông tin cấu hình Gara' };
  }
};

