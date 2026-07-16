import api from './api';

export const getMyVehicles = async () => {
  try {
    const res = await api.get('/api/vehicles');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách phương tiện' };
  }
};

export const getVehicleById = async (id) => {
  try {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải chi tiết phương tiện' };
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const res = await api.post('/api/vehicles', vehicleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể thêm phương tiện mới' };
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    const res = await api.put(`/api/vehicles/${id}`, vehicleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật thông tin phương tiện' };
  }
};

export const updateOdometer = async (id, currentOdometer) => {
  try {
    const res = await api.patch(`/api/vehicles/${id}/odometer`, { currentOdometer });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật chỉ số km' };
  }
};

export const deleteVehicle = async (id) => {
  try {
    const res = await api.delete(`/api/vehicles/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa phương tiện' };
  }
};
