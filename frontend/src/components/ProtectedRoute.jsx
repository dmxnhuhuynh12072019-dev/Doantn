import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập thì chuyển hướng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng phân quyền không khớp
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
