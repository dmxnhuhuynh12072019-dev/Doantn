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
          <ProtectedRoute allowedRoles={['User']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/garage/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Garage']}>
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

      {/* Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

