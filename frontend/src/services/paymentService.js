import api from './api';

export const createPaymentUrl = async (paymentData) => {
  try {
    const res = await api.post('/api/payments/create-url', paymentData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể khởi tạo thanh toán' };
  }
};

export const simulateSandboxSuccess = async (paymentId) => {
  try {
    const res = await api.post(`/api/payments/${paymentId}/simulate-success`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể giả lập thanh toán Sandbox' };
  }
};

export const getMyPaymentHistory = async () => {
  try {
    const res = await api.get('/api/payments/my-history');
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tải lịch sử thanh toán' };
  }
};
