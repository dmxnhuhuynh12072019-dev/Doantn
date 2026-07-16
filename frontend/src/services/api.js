import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor để tự động đính kèm Token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor để xử lý lỗi hệ thống toàn cục (ví dụ: Token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token hết hạn hoặc không hợp lệ, đăng xuất người dùng
      localStorage.removeItem('token');
      // Chúng ta có thể trigger logout hoặc reload nếu cần thiết
    }
    return Promise.reject(error);
  }
);

export default api;
