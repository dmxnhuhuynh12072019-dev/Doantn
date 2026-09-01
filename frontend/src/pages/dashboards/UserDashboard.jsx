import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useSocket } from '../../context/SocketContext';
import * as vehicleService from '../../services/vehicleService';
import * as appointmentService from '../../services/appointmentService';
import * as garageService from '../../services/garageService';
import * as extensionService from '../../services/extensionService';
import * as notificationService from '../../services/notificationService';
import VehicleFormModal from '../../components/vehicles/VehicleFormModal';
import OdometerModal from '../../components/vehicles/OdometerModal';
import AppointmentModal from '../../components/appointments/AppointmentModal';
import ReviewModal from '../../components/extensions/ReviewModal';
import PaymentCheckoutModal from '../../components/payments/PaymentCheckoutModal';
import AiAssistantChat from '../../components/extensions/AiAssistantChat';
import MaintenanceSchedulesTab from '../../components/maintenances/MaintenanceSchedulesTab';
import MaintenanceHistoryTab from '../../components/maintenances/MaintenanceHistoryTab';
import MaintenanceMatrixView from '../../components/maintenances/MaintenanceMatrixView';
import LegalDocumentsTab from '../../components/legal/LegalDocumentsTab';
import Header from '../../components/common/Header';
import MobileGreetingCard from '../../components/common/MobileGreetingCard';
import BannerSlider from '../../components/common/BannerSlider';
import MobileQuickActions from '../../components/common/MobileQuickActions';
import NewServicesSection from '../../components/common/NewServicesSection';
import OperatingCriteriaSection from '../../components/common/OperatingCriteriaSection';
import CustomerReviewsSection from '../../components/common/CustomerReviewsSection';
import NewsSection from '../../components/common/NewsSection';
import Footer from '../../components/common/Footer';
import AboutSection from '../../components/common/AboutSection';
import ServicesPageSection from '../../components/common/ServicesPageSection';
import NewsPageSection from '../../components/common/NewsPageSection';
import ContactPageSection from '../../components/common/ContactPageSection';
import AppointmentsPageSection from '../../components/appointments/AppointmentsPageSection';
import BookingAppointmentPage from '../../components/appointments/BookingAppointmentPage';
import ServiceDetailPage from '../../components/common/ServiceDetailPage';
import AccountPageSection from '../../components/common/AccountPageSection';
import GarageChatSection from '../../components/chat/GarageChatSection';
import InvoicePreviewModal from '../../components/invoices/InvoicePreviewModal';
import AppointmentDetailViewModal from '../../components/appointments/AppointmentDetailViewModal';
import SmartMaintenanceAdvisorWidget from '../../components/maintenances/SmartMaintenanceAdvisorWidget';

const UserDashboard = () => {
  const { user, logout, themePreference, updateThemePreference } = useAuth();
  const { confirm, toast } = useModal();
  const { socket } = useSocket();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [advisorVehicleId, setAdvisorVehicleId] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOdometerOpen, setIsOdometerOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceApptId, setSelectedInvoiceApptId] = useState(null);

  // Appointment Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApptForDetail, setSelectedApptForDetail] = useState(null);

  // Module 5 Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPaymentAppt, setSelectedPaymentAppt] = useState(null);

  // Detail view state
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  const [selectedServiceItem, setSelectedServiceItem] = useState(null);
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'schedules' | 'history' | 'legal' | 'appointments'

  // Main Page sub-tab (Module 7 Expense Analytics)
  const [mainTab, setMainTab] = useState('vehicles');
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'about' | 'services' | 'service-detail' | 'news' | 'contact'
  const [selectedServiceCategory, setSelectedServiceCategory] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expensesError, setExpensesError] = useState('');

  const fetchUserExpenses = async () => {
    setLoadingExpenses(true);
    setExpensesError('');
    try {
      const data = await garageService.getUserExpenses();
      setExpensesData(data);
    } catch (err) {
      setExpensesError(err.message || 'Không thể tải phân tích chi tiêu.');
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (!selectedVehicleForDetail && mainTab === 'expenses') {
      fetchUserExpenses();
    }
  }, [selectedVehicleForDetail, mainTab]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Review & Export states & handlers (Module 8)
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedReviewGarage, setSelectedReviewGarage] = useState(null);

  const handleOpenReviewModal = (appt) => {
    setSelectedReviewGarage({
      id: appt.GarageID,
      name: appt.GarageName
    });
    setIsReviewOpen(true);
  };

  const handleExportInvoice = (appointmentId) => {
    setSelectedInvoiceApptId(appointmentId);
    setIsInvoiceModalOpen(true);
  };

  const handleExportExpenses = async () => {
    const url = `/api/extensions/export/expenses`;
    await extensionService.downloadFileWithAuth(url, `personal_expenses.csv`);
  };

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptError, setApptError] = useState('');

  const fetchAppointments = async () => {
    if (!selectedVehicleForDetail) return;
    setLoadingAppts(true);
    setApptError('');
    try {
      const data = await appointmentService.getAppointmentsUser();
      const filtered = data.filter(a => a.VehicleID === selectedVehicleForDetail.VehicleID);
      setAppointments(filtered);
    } catch (err) {
      setApptError(err.message || 'Không thể tải danh sách lịch đặt hẹn.');
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (selectedVehicleForDetail && activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [selectedVehicleForDetail, activeTab]);

  const handleCancelAppointment = async (apptId) => {
    const isConfirmed = await confirm({
      title: 'Hủy lịch hẹn',
      message: 'Bạn có chắc chắn muốn hủy lịch đặt hẹn này?',
      confirmText: 'Hủy lịch ngay',
      cancelText: 'Giữ lại',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await appointmentService.updateAppointmentStatus(apptId, 'Hủy lịch');
        toast.success('Đã hủy lịch hẹn thành công!');
        fetchAppointments();
      } catch (err) {
        toast.error(err.message || 'Không thể hủy lịch hẹn');
      }
    }
  };

  const handleSaveAppointment = async (data) => {
    await appointmentService.createAppointment(data);
    toast.success('Đặt lịch hẹn bảo dưỡng thành công!');
    fetchAppointments();
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);

      if (data && data.length > 0) {
        setAdvisorVehicleId((prev) => (prev ? prev : data[0].VehicleID));
      }

      // Update selected detail vehicle info if it is currently open
      if (selectedVehicleForDetail) {
        const updated = data.find(v => v.VehicleID === selectedVehicleForDetail.VehicleID);
        if (updated) {
          setSelectedVehicleForDetail(updated);
        } else {
          setSelectedVehicleForDetail(null); // Vehicle was deleted
        }
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) {
        setUnreadNotificationsCount(data.filter(n => !n.IsRead).length);
      }
    } catch (err) {
      console.warn('Không thể tải số lượng thông báo:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  // Real-time Socket.IO listener for live notification events & badges
  useEffect(() => {
    if (!socket) return;

    const handleUnreadCountUpdated = (data) => {
      if (data && typeof data.unreadCount === 'number') {
        setUnreadNotificationsCount(data.unreadCount);
      }
    };

    const handleNotificationReceived = (notif) => {
      setUnreadNotificationsCount(prev => prev + 1);
      toast.success(notif?.Title || 'Bạn có thông báo mới!', { duration: 6000 });
      if (selectedVehicleForDetail) {
        fetchAppointments();
      }
      fetchVehicles();
    };

    socket.on('unread_count_updated', handleUnreadCountUpdated);
    socket.on('notification_received', handleNotificationReceived);

    return () => {
      socket.off('unread_count_updated', handleUnreadCountUpdated);
      socket.off('notification_received', handleNotificationReceived);
    };
  }, [socket, toast, selectedVehicleForDetail]);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleOdometerClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsOdometerOpen(true);
  };

  const handleSaveVehicle = async (data) => {
    if (selectedVehicle) {
      // Edit mode
      await vehicleService.updateVehicle(selectedVehicle.VehicleID, data);
      toast.success('Cập nhật thông tin phương tiện thành công!');
    } else {
      // Add mode
      const res = await vehicleService.createVehicle(data);
      if (res.autoGeneratedSchedules && res.autoGeneratedSchedules.totalCount > 0) {
        toast.success(`Đã thêm xe mới và tự động khởi tạo ${res.autoGeneratedSchedules.totalCount} lịch nhắc bảo dưỡng tiêu chuẩn!`);
      } else {
        toast.success('Đã thêm phương tiện mới thành công!');
      }
    }
    fetchVehicles();
  };


  const handleSaveOdometer = async (id, odometer) => {
    await vehicleService.updateOdometer(id, odometer);
    fetchVehicles();
  };

  const handleDeleteClick = async (id) => {
    const isConfirmed = await confirm({
      title: 'Xóa phương tiện',
      message: 'Bạn có chắc chắn muốn xóa phương tiện này? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn!',
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success('Đã xóa phương tiện thành công!');
        fetchVehicles();
      } catch (err) {
        toast.error(err.message || 'Xóa phương tiện thất bại');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-20 md:pb-0">
      {/* Header */}
      {currentView !== 'messages' && currentView !== 'notifications' && currentView !== 'news' && (
        <Header
          dashboardType="user"
          currentView={currentView}
          onMenuClick={(menuId, categoryId) => {
            setSelectedVehicleForDetail(null);
            setCurrentView(menuId);
            if (categoryId) {
              setSelectedServiceCategory(categoryId);
            } else {
              setSelectedServiceCategory(null);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Hero Banner Slider & Mobile First Sections */}
      {!selectedVehicleForDetail && currentView === 'home' && (
        <>
          {/* Top Greeting Header Card (Circle 1 from sample image) */}
          <MobileGreetingCard />

          {/* Banner Slider */}
          <BannerSlider
            onOpenAppointment={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('services');
              setSelectedServiceCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Quick 4-Action Grid (Circle 2 from sample image: Dịch vụ, Lịch hẹn, Tin tức, Chuyên gia) */}
          <MobileQuickActions
            onOpenServices={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('services');
              setSelectedServiceCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAppointments={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenNews={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('news');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenExpert={() => {
              window.dispatchEvent(new CustomEvent('open-acoh-ai-chat'));
            }}
          />

          {/* Home Page Quick Vehicle Banner (Placed above Dịch vụ quanh bạn) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 my-2 sm:my-3">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
                  🚗 Quản lý phương tiện thông minh
                </div>
                <h3 className="text-lg sm:text-2xl font-black mb-1">
                  Bạn đang có {vehicles.length} phương tiện trong danh sách
                </h3>
                <p className="text-indigo-100 text-xs sm:text-sm">
                  Theo dõi số km, lập kế hoạch bảo dưỡng định kỳ và kiểm soát chi phí nuôi xe.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setCurrentView('vehicles');
                    setMainTab('vehicles');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Xem danh sách xe</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('vehicles');
                    setMainTab('vehicles');
                    handleAddClick();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  + Thêm xe mới
                </button>
              </div>
            </div>
          </div>

          {/* Smart Maintenance Advisor Doctor Widget */}
          {vehicles.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4 sm:my-6">
              <SmartMaintenanceAdvisorWidget
                vehicleId={advisorVehicleId || vehicles[0]?.VehicleID}
                vehicles={vehicles}
                onSelectVehicle={(vId) => setAdvisorVehicleId(vId)}
                onOpenBookingModal={(advisorData) => {
                  const found = vehicles.find(v => v.VehicleID === advisorData.vehicleId) || vehicles[0];
                  setSelectedVehicle(found);
                  setSelectedServiceItem({
                    name: advisorData.suggestedPackage,
                    price: 'Tối ưu theo AI',
                    category: 'Bảo dưỡng AI Advisor',
                    description: advisorData.suggestedNotes,
                  });
                  setSelectedVehicleForDetail(null);
                  setCurrentView('booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}

          {/* Section: Dịch vụ mới / Dịch vụ quanh bạn */}
          <NewServicesSection
            onSelectService={(service) => {
              setSelectedServiceItem(service);
              setSelectedVehicleForDetail(null);
              setCurrentView('service-detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAppointment={(serviceName) => {
              if (vehicles.length > 0) {
                setSelectedVehicle(vehicles[0]);
              }
              setSelectedVehicleForDetail(null);
              setCurrentView('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewAll={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('services');
              setSelectedServiceCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          {/* Section: Tiêu chí hoạt động */}
          <OperatingCriteriaSection
            onOpenAppointment={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('services');
              setSelectedServiceCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Section: Tin tức nổi bật */}
          <NewsSection
            onViewAll={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('news');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* Render Dedicated Views */}
      {!selectedVehicleForDetail && currentView === 'about' && (
        <AboutSection />
      )}

      {!selectedVehicleForDetail && currentView === 'services' && (
        <ServicesPageSection
          selectedCategory={selectedServiceCategory}
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectService={(service) => {
            setSelectedServiceItem(service);
            setSelectedVehicleForDetail(null);
            setCurrentView('service-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAppointment={(serviceName) => {
            if (vehicles.length > 0) {
              setSelectedVehicle(vehicles[0]);
            }
            setSelectedVehicleForDetail(null);
            setCurrentView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'service-detail' && (
        <ServiceDetailPage
          service={selectedServiceItem}
          onBack={() => {
            setCurrentView('services');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBookAppointment={(service) => {
            if (vehicles.length > 0) {
              setSelectedVehicle(vehicles[0]);
            }
            setSelectedVehicleForDetail(null);
            setCurrentView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'news' && (
        <NewsPageSection
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'contact' && (
        <ContactPageSection />
      )}

      {!selectedVehicleForDetail && currentView === 'appointments' && (
        <AppointmentsPageSection
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenNewAppointment={() => {
            if (vehicles.length > 0) {
              setSelectedVehicle(vehicles[0]);
            }
            setSelectedVehicleForDetail(null);
            setCurrentView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPayment={(appt) => {
            setSelectedPaymentAppt(appt);
            setIsPaymentOpen(true);
          }}
          onOpenReview={(appt) => {
            handleOpenReviewModal(appt);
          }}
          onCancelAppointment={(apptId, refreshCallback) => {
            handleCancelAppointment(apptId).then(() => {
              if (refreshCallback) refreshCallback();
            });
          }}
          onExportInvoice={handleExportInvoice}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'booking' && (
        <BookingAppointmentPage
          onBack={() => {
            if (selectedServiceItem) {
              setCurrentView('service-detail');
            } else {
              setCurrentView('appointments');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBookingSuccess={() => {
            toast.success('Đặt lịch hẹn bảo dưỡng thành công!');
            setSelectedServiceItem(null);
            setCurrentView('appointments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedService={selectedServiceItem}
          preselectedVehicle={selectedVehicle}
          vehicles={vehicles}
          onAddNewVehicle={() => {
            setCurrentView('vehicles');
            setMainTab('vehicles');
            handleAddClick();
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'account' && (
        <AccountPageSection
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateServices={() => {
            setCurrentView('services');
            setSelectedServiceCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateAppointments={() => {
            setCurrentView('appointments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateVehicles={() => {
            setCurrentView('vehicles');
            setMainTab('vehicles');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateMessages={() => {
            setCurrentView('messages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateNotifications={() => {
            setCurrentView('notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'notifications' && (
        <NotificationsPageSection
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateServices={() => {
            setCurrentView('services');
            setSelectedServiceCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateMessages={() => {
            setCurrentView('messages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateAccount={() => {
            setCurrentView('account');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {!selectedVehicleForDetail && currentView === 'messages' && (
        <GarageChatSection
          onBack={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateServices={() => {
            setCurrentView('services');
            setSelectedServiceCategory(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateAppointments={() => {
            setCurrentView('appointments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateVehicles={() => {
            setCurrentView('vehicles');
            setMainTab('vehicles');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateAccount={() => {
            setCurrentView('account');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenBookingWithGarage={() => {
            if (vehicles.length > 0) {
              setSelectedVehicle(vehicles[0]);
            }
            setSelectedVehicleForDetail(null);
            setCurrentView('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Content (Only for Vehicle Detail / Vehicles List) */}
      {(selectedVehicleForDetail || currentView === 'vehicles') && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">

        {/* Detail View của một chiếc xe */}
        {selectedVehicleForDetail ? (
          <div className="space-y-6">
            {/* Nút Back */}
            <button
              onClick={() => setSelectedVehicleForDetail(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách xe
            </button>

            {/* Thông tin nhanh xe */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-300">
                    🚗 Ô tô
                  </span>
                  {selectedVehicleForDetail.IsCommercial ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                      🚕 Xe dịch vụ
                    </span>
                  ) : null}
                  <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm shrink-0 whitespace-nowrap">
                    {selectedVehicleForDetail.LicensePlate}
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                  {selectedVehicleForDetail.Brand} {selectedVehicleForDetail.Model}
                </h2>
                <div className="flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <p>Năm sản xuất: <strong className="text-slate-700 dark:text-slate-350">{selectedVehicleForDetail.ManufactureYear || 'Không rõ'}</strong></p>
                  <p>Ngày mua: <strong className="text-slate-700 dark:text-slate-350">{selectedVehicleForDetail.PurchaseDate ? new Date(selectedVehicleForDetail.PurchaseDate).toLocaleDateString() : 'Không rõ'}</strong></p>
                  {selectedVehicleForDetail.IsCommercial && selectedVehicleForDetail.HTXCode && (
                    <p>Mã HTX: <strong className="text-amber-700 dark:text-amber-400">{selectedVehicleForDetail.HTXCode}</strong></p>
                  )}
                  {selectedVehicleForDetail.IsCommercial && selectedVehicleForDetail.BadgeNumber && (
                    <p>Số phù hiệu: <strong className="text-amber-700 dark:text-amber-400">{selectedVehicleForDetail.BadgeNumber}</strong></p>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center items-start md:items-end gap-3 bg-slate-50 dark:bg-slate-700/40 p-5 rounded-2xl md:min-w-[200px]">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">Số Odo Hiện Tại</span>
                <p className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                  {selectedVehicleForDetail.CurrentOdometer.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal">km</span>
                </p>
                <button
                  onClick={() => handleOdometerClick(selectedVehicleForDetail)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition w-full md:w-auto"
                >
                  Cập nhật km
                </button>
              </div>
            </div>

            {/* Tabs bảo dưỡng */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('advisor')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${activeTab === 'advisor'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  🩺 Trợ lý Sức Khỏe (AI)
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${activeTab === 'schedules'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  📅 Kế hoạch bảo dưỡng
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  🔧 Nhật ký sửa chữa
                </button>
                <button
                  onClick={() => setActiveTab('legal')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${activeTab === 'legal'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  📄 Giấy tờ & Bảo hiểm
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`flex-1 sm:flex-initial px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${activeTab === 'appointments'
                      ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-800 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  📅 Đặt lịch bảo dưỡng
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {activeTab === 'advisor' && (
                  <div className="space-y-6">
                    <SmartMaintenanceAdvisorWidget
                      vehicleId={selectedVehicleForDetail.VehicleID}
                      vehicles={[selectedVehicleForDetail]}
                      onOpenBookingModal={(advisorData) => {
                        setSelectedVehicle(selectedVehicleForDetail);
                        setSelectedServiceItem({
                          name: advisorData.suggestedPackage,
                          price: 'Tối ưu theo AI',
                          category: 'Bảo dưỡng AI Advisor',
                          description: advisorData.suggestedNotes,
                        });
                        setSelectedVehicleForDetail(null);
                        setCurrentView('booking');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
                {activeTab === 'schedules' && (
                  <div className="space-y-6">
                    <MaintenanceMatrixView
                      vehicle={selectedVehicleForDetail}
                      onRefresh={fetchVehicles}
                    />
                    <MaintenanceSchedulesTab
                      vehicleId={selectedVehicleForDetail.VehicleID}
                      currentOdometer={selectedVehicleForDetail.CurrentOdometer}
                    />
                  </div>
                )}
                {activeTab === 'history' && (
                  <MaintenanceHistoryTab vehicleId={selectedVehicleForDetail.VehicleID} />
                )}
                {activeTab === 'legal' && (
                  <LegalDocumentsTab
                    vehicleId={selectedVehicleForDetail.VehicleID}
                    vehicleType={selectedVehicleForDetail.VehicleType}
                  />
                )}
                {activeTab === 'appointments' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-750">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white">Đặt lịch bảo dưỡng tại Gara đối tác</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Chọn gara, thời gian và đặt lịch hẹn để được phục vụ tốt nhất.</p>
                      </div>
                      <button
                        onClick={() => setIsAppointmentOpen(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        + Đặt lịch sửa xe
                      </button>
                    </div>

                    {apptError && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                        {apptError}
                      </div>
                    )}

                    {loadingAppts ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700"></div>
                        ))}
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-900/10">
                        <span className="text-3xl mb-2 block">📅</span>
                        <p className="text-sm">Chưa có lịch đặt hẹn nào cho xe này.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appt) => (
                          <div
                            key={appt.AppointmentID}
                            className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 rounded-2xl p-5 hover:shadow-xs transition space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-750 pb-3">
                              <div>
                                <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Gara Đối Tác</span>
                                <h4 className="text-base font-black text-slate-800 dark:text-white leading-snug">
                                  {appt.GarageName}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  📍 {appt.GarageAddress} | 📞 {appt.GaragePhone}
                                </p>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  appt.Status === 'Chờ xác nhận' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                                  appt.Status === 'Đã xác nhận' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                                  appt.Status === 'Đã cọc' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40 shadow-xs' :
                                  appt.Status === 'Đang sửa chữa' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30' :
                                  appt.Status === 'Hoàn thành' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                                  'bg-slate-50 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}>
                                  {appt.Status === 'Đã cọc' ? '💳 Đã cọc thành công' : appt.Status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Thời gian hẹn</span>
                                <strong className="text-slate-700 dark:text-slate-200 text-sm">
                                  {new Date(appt.AppointmentDate).toLocaleString('vi-VN', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Ghi chú của bạn</span>
                                <p className="text-slate-655 dark:text-slate-300 italic text-xs leading-relaxed">
                                  {appt.Notes || 'Không có ghi chú.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-750/50 mt-1">
                              <button
                                onClick={() => {
                                  setSelectedApptForDetail(appt);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>🔍</span>
                                <span>Xem xe đã sửa những gì</span>
                              </button>

                              <div className="flex flex-wrap items-center gap-2">
                                {(appt.Status === 'Chờ xác nhận' || appt.Status === 'Đã xác nhận') && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedPaymentAppt(appt);
                                        setIsPaymentOpen(true);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                    >
                                      💳 Thanh toán cọc
                                    </button>
                                    <button
                                      onClick={() => handleCancelAppointment(appt.AppointmentID)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 transition cursor-pointer"
                                    >
                                      Hủy lịch
                                    </button>
                                  </>
                                )}

                                {appt.Status === 'Đã cọc' && (
                                  <button
                                    onClick={() => {
                                      setSelectedPaymentAppt(appt);
                                      setIsPaymentOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 transition flex items-center gap-1 cursor-pointer"
                                  >
                                    🧾 Xem biên nhận cọc
                                  </button>
                                )}

                                {appt.Status === 'Hoàn thành' && (
                                  <>
                                    <button
                                      onClick={() => handleExportInvoice(appt.AppointmentID)}
                                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      🧾 In hóa đơn
                                    </button>
                                    <button
                                      onClick={() => handleOpenReviewModal(appt)}
                                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      ⭐ Đánh giá
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid Danh sách xe */
          currentView === 'vehicles' && (
            <>
            {/* Mobile Top Header Bar with Back Arrow to Account */}
            <div className="md:hidden -mx-4 -mt-6 mb-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentView('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition cursor-pointer active:scale-95"
                  title="Quay lại tài khoản"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="!text-white text-base font-black tracking-tight !m-0 !p-0" style={{ color: '#ffffff' }}>
                  Xe của tôi
                </h1>
              </div>

              <button
                onClick={handleAddClick}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-white/25 active:scale-95"
              >
                <span>+ Thêm xe</span>
              </button>
            </div>

            {/* Welcome Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      setCurrentView('account');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại Tài khoản</span>
                  </button>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Góc Quản lý Phương tiện</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi số kilomet đi được để lập kế hoạch bảo dưỡng định kỳ.</p>
              </div>
              <button
                onClick={handleAddClick}
                className="px-5 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 self-center sm:self-auto cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm phương tiện mới
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Tab selection bar for the main page (only show if vehicles exist or loading) */}
            {vehicles.length > 0 && (
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <button
                  onClick={() => setMainTab('vehicles')}
                  className={`flex-1 px-6 py-3.5 text-sm font-bold border-b-2 transition ${mainTab === 'vehicles'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-900/10'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  🚗 Xe của tôi ({vehicles.length})
                </button>
                <button
                  onClick={() => setMainTab('expenses')}
                  className={`flex-1 px-6 py-3.5 text-sm font-bold border-b-2 transition ${mainTab === 'expenses'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-900/10'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  📊 Phân tích chi tiêu
                </button>
              </div>
            )}

            {/* Rendering based on mainTab */}
            {(mainTab === 'vehicles' || vehicles.length === 0) ? (
              /* Vehicles Grid */
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-48 rounded-3xl bg-slate-250 dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700"></div>
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-750 rounded-3xl p-12 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mb-4 animate-bounce">
                    🚗
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Chưa có phương tiện nào</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Hãy thêm chiếc xe đầu tiên của bạn để kích hoạt hệ thống nhắc lịch bảo dưỡng.</p>
                  <button
                    onClick={handleAddClick}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                  >
                    Thêm xe ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.VehicleID}
                      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-650 dark:text-slate-300">
                                🚗 Ô tô
                              </span>
                              {vehicle.IsCommercial ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                                  🚕 Xe dịch vụ
                                </span>
                              ) : null}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1">
                              {vehicle.Brand} {vehicle.Model}
                            </h3>
                            {vehicle.IsCommercial && (vehicle.HTXCode || vehicle.BadgeNumber) && (
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1">
                                {vehicle.HTXCode && <span>HTX: <strong>{vehicle.HTXCode}</strong> </span>}
                                {vehicle.BadgeNumber && <span>| Phù hiệu: <strong>{vehicle.BadgeNumber}</strong></span>}
                              </p>
                            )}
                          </div>

                          {/* License Plate Plate-like UI */}
                          <div className="border-2 border-slate-850 bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-sm font-black tracking-wider text-slate-850 dark:text-white shadow-sm flex items-center justify-center h-8 shrink-0 whitespace-nowrap">
                            {vehicle.LicensePlate}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Số kilomet (Odometer)</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                              {vehicle.CurrentOdometer.toLocaleString()}{' '}
                              <span className="text-xs text-slate-500 font-normal">km</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Năm sản xuất</p>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {vehicle.ManufactureYear || 'Không rõ'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                        <span className="text-xxs text-slate-400 dark:text-slate-500">
                          Cập nhật: {new Date(vehicle.UpdatedAt).toLocaleDateString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVehicleForDetail(vehicle)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
                          >
                            Xem bảo dưỡng
                          </button>
                          <button
                            onClick={() => handleOdometerClick(vehicle)}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                          >
                            Cập nhật km
                          </button>
                          <button
                            onClick={() => handleEditClick(vehicle)}
                            className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
                            title="Sửa thông tin"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vehicle.VehicleID)}
                            className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/40 transition"
                            title="Xóa phương tiện"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Expenses Analytics Tab (Module 7) */
              <div className="space-y-6 animate-in fade-in duration-200">
                {expensesError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                    {expensesError}
                  </div>
                )}

                {loadingExpenses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                  </div>
                ) : expensesData ? (
                  <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tổng Chi Phí Bảo Dưỡng Tích Lũy</span>
                        <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                          {formatCurrency(expensesData.totalCost)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleExportExpenses}
                          className="px-4 py-2.5 rounded-2xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 border border-indigo-100/30 transition flex items-center gap-1.5"
                        >
                          📥 Xuất báo cáo (CSV)
                        </button>
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-2xl flex items-center justify-center rounded-2xl border border-indigo-100/30 shrink-0">
                          💳
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Monthly Costs */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">📅 Chi phí nuôi xe theo tháng (năm nay)</h3>
                        <p className="text-xs text-slate-400 mb-6">Theo dõi tổng tiền bảo dưỡng phát sinh qua các tháng.</p>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {expensesData.monthlyCost.map((item, idx) => {
                            const maxCost = Math.max(...expensesData.monthlyCost.map(m => m.cost), 1);
                            const widthPercent = (item.cost / maxCost) * 100;
                            return (
                              <div key={idx} className="flex items-center gap-4 text-xs">
                                <span className="w-16 text-slate-500 dark:text-slate-400 font-bold shrink-0">{item.month}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${widthPercent}%` }}
                                  ></div>
                                </div>
                                <span className="w-20 text-right text-slate-700 dark:text-slate-200 font-bold shrink-0">
                                  {item.cost > 0 ? formatCurrency(item.cost) : '0 ₫'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cost by Vehicle */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">🚗 Chi phí theo đầu phương tiện</h3>
                        <p className="text-xs text-slate-400 mb-6">So sánh chi phí bảo dưỡng giữa các xe của bạn.</p>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                          {expensesData.expensesByVehicle.map((vehicle, idx) => {
                            const maxCost = Math.max(...expensesData.expensesByVehicle.map(v => v.TotalCost), 1);
                            const widthPercent = (vehicle.TotalCost / maxCost) * 100;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-slate-700 dark:text-slate-200">{vehicle.Brand} {vehicle.Model} ({vehicle.LicensePlate})</span>
                                  <span className="text-slate-550 dark:text-slate-400 font-bold">{formatCurrency(vehicle.TotalCost)}</span>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-750 h-3 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${widthPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Recent Maintenance History list */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">📋 Các hạng mục chi tiêu gần nhất</h3>
                      <p className="text-xs text-slate-400 mb-4">Các dịch vụ sửa chữa có phát sinh chi phí bảo dưỡng gần đây.</p>

                      {expensesData.recentHistory.length === 0 ? (
                        <div className="text-center py-6 text-slate-405">Chưa phát sinh chi phí sửa chữa nào.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                <th className="px-4 py-3">Xe thực hiện</th>
                                <th className="px-4 py-3">Ngày làm</th>
                                <th className="px-4 py-3">Nơi thực hiện</th>
                                <th className="px-4 py-3">Nội dung sửa chữa</th>
                                <th className="px-4 py-3 text-right">Chi phí</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                              {expensesData.recentHistory.map((hist, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                                    {hist.Brand} {hist.Model} ({hist.LicensePlate})
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">{new Date(hist.ExecutionDate).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{hist.GarageName || 'Tự bảo dưỡng'}</td>
                                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{hist.Details}</td>
                                  <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                    {formatCurrency(hist.TotalCost)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
          )
        )}
      </main>
      )}

      {/* Footer */}
      {!selectedVehicleForDetail && currentView !== 'messages' && <Footer />}

      {/* Modals */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
      />

      <OdometerModal
        isOpen={isOdometerOpen}
        onClose={() => setIsOdometerOpen(false)}
        onSave={handleSaveOdometer}
        vehicle={selectedVehicle}
      />

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => {
          setIsAppointmentOpen(false);
          setSelectedVehicle(null);
        }}
        onSave={handleSaveAppointment}
        vehicle={selectedVehicle || selectedVehicleForDetail}
        vehicles={vehicles}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setSelectedReviewGarage(null);
        }}
        garageId={selectedReviewGarage?.id}
        garageName={selectedReviewGarage?.name}
        onSaveSuccess={fetchAppointments}
      />

      <PaymentCheckoutModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedPaymentAppt(null);
        }}
        appointmentId={selectedPaymentAppt?.AppointmentID}
        defaultAmount={100000}
        garageName={selectedPaymentAppt?.GarageName || 'Gara đối tác ACOH'}
        onPaymentSuccess={fetchAppointments}
      />

      {/* Invoice Preview & Print Modal matching sample */}
      <InvoicePreviewModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceApptId(null);
        }}
        appointmentId={selectedInvoiceApptId}
      />

      {/* Appointment & Vehicle Service Details Modal */}
      <AppointmentDetailViewModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApptForDetail(null);
        }}
        appointment={selectedApptForDetail}
        onOpenInvoice={(apptId) => {
          handleExportInvoice(apptId);
        }}
        onOpenReview={(appt) => {
          handleOpenReviewModal(appt);
        }}
      />

      {currentView !== 'messages' && <AiAssistantChat />}

      {/* Bottom Navigation for Mobile matching sample screenshot */}
      {!selectedVehicleForDetail && currentView !== 'booking' && currentView !== 'service-detail' && currentView !== 'account' && currentView !== 'messages' && currentView !== 'notifications' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-xl px-4 py-2 z-40 flex justify-around items-center">
          {/* 1. Trang chủ */}
          <button
            onClick={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer transition-colors ${
              !selectedVehicleForDetail && currentView === 'home'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Trang chủ</span>
          </button>

          {/* 2. Tin nhắn */}
          <button
            onClick={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('messages');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer transition-colors ${
              !selectedVehicleForDetail && currentView === 'messages'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Tin nhắn</span>
          </button>

          {/* 4. Thông báo */}
          <button
            onClick={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('notifications');
              setUnreadNotificationsCount(0);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer transition-colors relative ${
              !selectedVehicleForDetail && currentView === 'notifications'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
            }`}
          >
            <div className="relative">
              <svg className="w-5 h-5" fill={!selectedVehicleForDetail && currentView === 'notifications' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </div>
            <span>Thông báo</span>
          </button>

          {/* 5. Tài khoản */}
          <button
            onClick={() => {
              setSelectedVehicleForDetail(null);
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer transition-colors ${
              !selectedVehicleForDetail && currentView === 'account'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Tài khoản</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
