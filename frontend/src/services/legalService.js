import api from './api';

export const getDocuments = async (vehicleId) => {
  try {
    const res = await api.get(`/api/legal/${vehicleId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải danh sách giấy tờ xe' };
  }
};

export const createDocument = async (docData) => {
  try {
    const res = await api.post('/api/legal', docData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể thêm mới thông tin giấy tờ' };
  }
};

export const updateDocument = async (id, docData) => {
  try {
    const res = await api.put(`/api/legal/${id}`, docData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật thông tin giấy tờ' };
  }
};

export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`/api/legal/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa thông tin giấy tờ' };
  }
};
