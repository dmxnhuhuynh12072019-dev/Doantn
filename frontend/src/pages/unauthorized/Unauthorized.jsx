import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    switch (user.role) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      case 'Garage':
        navigate('/garage/dashboard');
        break;
      case 'User':
      default:
        navigate('/user/dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Truy cập bị từ chối</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn không có quyền truy cập vào chức năng hoặc tài nguyên này.</p>
        
        <button
          onClick={handleBackToDashboard}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
