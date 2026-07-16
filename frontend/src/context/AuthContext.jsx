import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Đồng bộ thông tin user khi load lại trang nếu đã có token
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Lỗi khi tải thông tin hồ sơ:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token: receivedToken, user: loggedUser } = res.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng nhập' };
    }
  };

  const register = async (fullName, email, password, phoneNumber, role) => {
    try {
      const res = await api.post('/api/auth/register', {
        fullName,
        email,
        password,
        phoneNumber,
        role,
      });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng ký tài khoản' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (fullName, phoneNumber) => {
    try {
      const res = await api.put('/api/auth/profile', { fullName, phoneNumber });
      // Cập nhật lại thông tin user trong local state
      setUser(prev => prev ? { ...prev, fullName, phoneNumber } : null);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi cập nhật hồ sơ' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await api.put('/api/auth/change-password', { oldPassword, newPassword });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đổi mật khẩu' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
