import api from './api';

// 1. Trò chuyện với trợ lý ảo AI
export const chatWithAI = async (message) => {
  try {
    const res = await api.post('/api/extensions/ai-chat', { message });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể trò chuyện với AI' };
  }
};

// 2. Viết đánh giá cho Gara
export const createReview = async (garageId, data) => {
  try {
    const res = await api.post(`/api/extensions/garages/${garageId}/reviews`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lưu đánh giá Gara' };
  }
};

// 3. Lấy danh sách đánh giá của Gara
export const getReviews = async (garageId) => {
  try {
    const res = await api.get(`/api/extensions/garages/${garageId}/reviews`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải đánh giá Gara' };
  }
};

// 4. Đường dẫn xuất file báo cáo chi tiết (dùng tải trực tiếp bằng token)
export const getExportExpensesURL = () => {
  const token = localStorage.getItem('token');
  return `http://localhost:3000/api/extensions/export/expenses?token=${token}`;
};

export const getExportInvoiceURL = (appointmentId) => {
  const token = localStorage.getItem('token');
  return `http://localhost:3000/api/extensions/export/invoice/${appointmentId}?token=${token}`;
};

// Hàm phụ hỗ trợ trigger tải file bằng Axios đính kèm token chuẩn REST
export const downloadFileWithAuth = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Lỗi tải file:', error);
    alert('Tải file thất bại. Vui lòng thử lại sau.');
  }
};
