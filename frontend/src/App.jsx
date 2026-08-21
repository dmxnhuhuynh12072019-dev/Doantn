import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/profile/Profile';
import Unauthorized from './pages/unauthorized/Unauthorized';
import UserDashboard from './pages/dashboards/UserDashboard';
import GarageDashboard from './pages/dashboards/GarageDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import { useAuth } from './context/AuthContext';

const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const role = user?.role ? String(user.role).toLowerCase() : '';
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'garage') {
    return <Navigate to="/garage/dashboard" replace />;
  }
  return <Navigate to="/user/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Các route công khai */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Các route cần đăng nhập */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Định tuyến bảo vệ theo phân quyền (RBAC) */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['User', 'Garage', 'Admin']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/garage/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Garage', 'Admin']}>
            <GarageDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Điều hướng mặc định dựa theo role người dùng */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
