import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [themePreference, setThemePreference] = useState(localStorage.getItem('themePreference') || 'system');

  // Function to apply class to document element
  const applyTheme = (preference) => {
    const root = document.documentElement;
    if (preference === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (preference === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // system theme
      root.classList.remove('light', 'dark');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  };

  // Sync theme class when preference changes
  useEffect(() => {
    applyTheme(themePreference);

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [themePreference]);

  // Đồng bộ thông tin user khi load lại trang nếu đã có token
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/profile');
          setUser(res.data);
          if (res.data.themePreference) {
            setThemePreference(res.data.themePreference);
            localStorage.setItem('themePreference', res.data.themePreference);
          }
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
      if (loggedUser.themePreference) {
        setThemePreference(loggedUser.themePreference);
        localStorage.setItem('themePreference', loggedUser.themePreference);
      }
      return loggedUser;
    } catch (error) {
      let message = 'Đã xảy ra lỗi khi đăng nhập';
      if (error.response?.data?.message) {
        const serverMsg = error.response.data.message;
        message = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      } else if (error.message === 'Network Error' || !error.response) {
        message = 'Không thể kết nối đến máy chủ backend. Vui lòng bấm "Đăng nhập" để thử lại.';
      } else if (error.message) {
        message = error.message;
      }
      throw { message };
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
      let message = 'Đã xảy ra lỗi khi đăng ký tài khoản';
      if (error.response?.data?.message) {
        const serverMsg = error.response.data.message;
        message = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      } else if (error.message === 'Network Error' || !error.response) {
        message = 'Không thể kết nối đến máy chủ backend. Vui lòng thử lại sau giây lát.';
      } else if (error.message) {
        message = error.message;
      }
      throw { message };
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

  const updateThemePreference = async (newTheme) => {
    setThemePreference(newTheme);
    localStorage.setItem('themePreference', newTheme);
    if (user) {
      try {
        await api.put('/api/users/preferences', { themePreference: newTheme });
        setUser(prev => prev ? { ...prev, themePreference: newTheme } : null);
      } catch (error) {
        console.error('Không thể đồng bộ tùy chọn giao diện lên máy chủ:', error);
      }
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
        themePreference,
        updateThemePreference,
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
