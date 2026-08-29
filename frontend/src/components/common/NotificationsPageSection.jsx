import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const DEFAULT_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với ACOH AutoCare!',
    message: 'Cảm ơn bạn đã đăng ký tài khoản. Khám phá các dịch vụ chăm sóc & bảo dưỡng xe ngay nhé!',
    time: '23 hours ago',
    type: 'welcome',
    icon: '📢',
    isRead: false,
  },
  {
    id: '2',
    title: 'Nhắc lịch bảo dưỡng định kỳ 10.000km',
    message: 'Phương tiện của bạn đã đến kỳ kiểm tra thay nhớt và hệ thống phanh. Đặt lịch ngay để nhận ưu đãi 10%.',
    time: '1 ngày trước',
    type: 'maintenance',
    icon: '🚗',
    isRead: true,
  },
  {
    id: '3',
    title: 'Xác nhận lịch hẹn thành công',
    message: 'Lịch hẹn bảo dưỡng tại ACOH Garage Sài Gòn đã được tiếp nhận và giữ chỗ cầu nâng.',
    time: '2 ngày trước',
    type: 'appointment',
    icon: '📅',
    isRead: true,
  },
];

const NotificationsPageSection = ({
  onBack,
  onNavigateHome,
  onNavigateServices,
  onNavigateMessages,
  onNavigateAccount,
}) => {
  const { user } = useAuth();
  const { toast, confirm } = useModal();
  
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('acoh_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Fetch real notifications from API if available
  useEffect(() => {
    const fetchApiNotifications = async () => {
      try {
        const res = await api.get('/api/notifications');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item) => ({
            id: item.NotificationID || item.id || String(Math.random()),
            title: item.Title || item.title || 'Thông báo hệ thống',
            message: item.Message || item.message || '',
            time: item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString('vi-VN') : 'Vừa xong',
            type: item.Type || 'system',
            icon: item.Type === 'appointment' ? '📅' : item.Type === 'vehicle' ? '🚗' : '📢',
            isRead: Boolean(item.IsRead),
          }));
          setNotifications(formatted);
        }
      } catch (err) {
        console.warn('Using local notifications list:', err);
      }
    };
    fetchApiNotifications();
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('acoh_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn(e);
    }
  }, [notifications]);

  // Handle Delete All
  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      toast.info('Danh sách thông báo đang trống.');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Xóa tất cả thông báo',
      message: 'Bạn có chắc chắn muốn xóa tất cả thông báo không?',
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      type: 'danger',
    });

    if (isConfirmed) {
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo.');
    }
  };

  // Handle Delete Single
  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Đã xóa thông báo.');
  };

  // Filter list
  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-24 md:pb-8 select-none">
      
      {/* 1. TOP HEADER BAR: ACOH BRAND GRADIENT HEADER */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white px-4 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between border-b border-indigo-950/40">
        
        {/* Left side: Back arrow + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight !m-0 !p-0">
            Thông báo
          </h1>
        </div>

        {/* Right side: Search button ONLY (Cart icon REMOVED) */}
        <div className="flex items-center gap-2">
          {showSearchInput ? (
            <div className="flex items-center bg-white/20 border border-white/30 rounded-xl px-2.5 py-1 text-xs">
              <input
                type="text"
                placeholder="Tìm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent text-white font-semibold placeholder-indigo-200 text-xs focus:outline-none w-32"
              />
              <button onClick={() => setShowSearchInput(false)} className="text-xs font-bold text-white ml-1">
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
              title="Tìm kiếm thông báo"
            >
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-HEADER ACTION BAR: Icon Thông báo + Nút Xóa tất cả */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            Thông báo hệ thống ({filteredNotifications.length})
          </span>
        </div>

        {/* Nút Xóa tất cả */}
        <button
          onClick={handleDeleteAll}
          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* 3. MAIN CONTENT: LIST OF NOTIFICATIONS WITH BRAND STYLING */}
      <div className="max-w-2xl w-full mx-auto p-4 flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-2xs mt-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mx-auto mb-3">
              🔔
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Không có thông báo nào
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Các cập nhật mới nhất về dịch vụ và bảo dưỡng sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-750 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-750">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition cursor-pointer group relative"
              >
                {/* Brand Badge Circle Icon */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                  {item.icon}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block font-medium">
                    {item.time}
                  </span>
                </div>

                {/* Delete button on hover/touch */}
                <button
                  onClick={(e) => handleDeleteSingle(item.id, e)}
                  className="absolute top-3.5 right-3.5 text-slate-300 hover:text-rose-500 transition cursor-pointer p-1"
                  title="Xóa thông báo này"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION BAR matching sample screenshot */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-xl px-4 py-2 z-40 flex justify-around items-center h-[58px]">
        {/* 1. Trang chủ */}
        <button
          type="button"
          onClick={onNavigateHome || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Trang chủ</span>
        </button>

        {/* 2. Gọi thợ */}
        <button
          type="button"
          onClick={onNavigateServices || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Gọi thợ</span>
        </button>

        {/* 3. Tin nhắn */}
        <button
          type="button"
          onClick={onNavigateMessages || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Tin nhắn</span>
        </button>

        {/* 4. Thông báo (Active matching sample screenshot) */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-indigo-600 dark:text-indigo-400 transition-colors relative"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Thông báo</span>
        </button>

        {/* 5. Tài khoản */}
        <button
          type="button"
          onClick={onNavigateAccount || onBack}
          className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Tài khoản</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationsPageSection;
