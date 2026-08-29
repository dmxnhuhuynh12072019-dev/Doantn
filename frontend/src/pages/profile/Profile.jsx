import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import AccountPageSection from '../../components/common/AccountPageSection';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useModal();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/user/dashboard');
  };

  return (
    <AccountPageSection
      onBack={handleBackToDashboard}
      onNavigateHome={() => navigate('/user/dashboard')}
      onNavigateServices={() => navigate('/user/dashboard')}
      onNavigateAppointments={() => navigate('/user/dashboard')}
      onNavigateVehicles={() => navigate('/user/dashboard')}
      onNavigateMessages={() => navigate('/user/dashboard')}
      onNavigateNotifications={() => toast.info('Bạn đã xem hết các thông báo mới nhất.')}
    />
  );
};

export default Profile;
