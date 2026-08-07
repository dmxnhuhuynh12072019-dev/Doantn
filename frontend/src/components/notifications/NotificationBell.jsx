import { useState, useEffect, useRef, useCallback } from 'react';
import { useModal } from '../../context/ModalContext';
import { useSocket } from '../../context/SocketContext';
import * as notificationService from '../../services/notificationService';
import NotificationSettingsModal from './NotificationSettingsModal';

const NotificationBell = () => {
  const { toast } = useModal();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.IsRead).length);
    } catch (err) {
      console.error('Không thể tải thông báo:', err.message);
    }
  }, []);

  // Fetch lần đầu khi mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // === SOCKET.IO: Lắng nghe sự kiện real-time ===
  useEffect(() => {
    if (!socket) return;

    // Nhận thông báo mới real-time
    const handleNotificationReceived = (notification) => {
      console.log('[Socket.IO] 📨 Nhận thông báo real-time:', notification);

      // Thêm notification mới vào đầu danh sách
      setNotifications(prev => [
        {
          ...notification,
          NotificationID: Date.now(), // Temporary ID cho đến khi fetch lại
          IsRead: false,
        },
        ...prev,
      ]);

      // Hiển thị Toast popup
      toast.success(
        notification.Title || 'Bạn có thông báo mới!',
        { duration: 6000 }
      );

      // Phát âm thanh thông báo
      playNotificationSound();

      // Fetch lại danh sách đầy đủ sau 1 giây để đồng bộ ID thực
      setTimeout(fetchNotifications, 1000);
    };

    // Nhận cập nhật unread count
    const handleUnreadCountUpdated = (data) => {
      console.log('[Socket.IO] 🔢 Cập nhật unread count:', data.unreadCount);
      setUnreadCount(data.unreadCount);
    };

    socket.on('notification_received', handleNotificationReceived);
    socket.on('unread_count_updated', handleUnreadCountUpdated);

    return () => {
      socket.off('notification_received', handleNotificationReceived);
      socket.off('unread_count_updated', handleUnreadCountUpdated);
    };
  }, [socket, toast, fetchNotifications]);

  // Polling fallback: mỗi 60s nếu Socket.IO mất kết nối
  useEffect(() => {
    if (isConnected) return; // Không cần polling nếu socket đang kết nối

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isConnected, fetchNotifications]);

  // Lắng nghe click bên ngoài để tự đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // === Âm thanh thông báo ===
  const playNotificationSound = () => {
    try {
      // Tạo âm thanh notification bằng Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tạo tone nhẹ nhàng (2 nốt)
      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playTone(880, now, 0.15);        // Nốt A5
      playTone(1108.73, now + 0.15, 0.2); // Nốt C#6
    } catch (err) {
      console.warn('Không thể phát âm thanh thông báo:', err.message);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Cập nhật local state ngay lập tức (optimistic update)
      setNotifications(prev =>
        prev.map(n => n.NotificationID === id ? { ...n, IsRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Cập nhật local state ngay lập tức (optimistic update)
      setNotifications(prev =>
        prev.map(n => ({ ...n, IsRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Test trigger quét hệ thống (Dành cho việc kiểm thử nhanh)
  const handleTriggerTestScan = async () => {
    try {
      const res = await notificationService.triggerCron();
      toast.success(`Đã kích hoạt quét hệ thống! Phát hiện & tạo thêm ${res.newNotificationsCount} thông báo.`);
      fetchNotifications();
    } catch (err) {
      toast.error('Không thể kích hoạt quét thử: ' + err.message);
    }
  };

  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-350 dark:hover:bg-slate-600 transition cursor-pointer"
        title="Thông báo"
      >
        <svg className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xxs font-black text-white ring-2 ring-white dark:ring-slate-800 animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Chỉ báo trạng thái kết nối Socket.IO */}
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-white dark:ring-slate-800 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          title={isConnected ? 'Kết nối real-time đang hoạt động' : 'Đang dùng chế độ polling'}
        />
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 top-28 sm:top-full mt-2 sm:mt-3 w-[92vw] max-w-sm sm:w-96 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Panel */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-850 dark:text-white text-sm sm:text-base">Thông báo</h3>
              {isConnected && (
                <span className="text-xxxs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                  ⚡ Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="text-xxs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Cài đặt thông báo Zalo ZNS & SMS"
              >
                ⚙️ Zalo/SMS
              </button>
              <button
                onClick={handleTriggerTestScan}
                className="text-xxs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg cursor-pointer"
                title="Kích hoạt quét hệ thống để cập nhật thông báo về lịch và hạn giấy tờ xe"
              >
                Quét thử
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xxs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer px-1 py-1"
                >
                  Đọc tất cả
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <span className="text-2xl block mb-2">🔔</span>
                <p className="text-xs font-semibold">Bạn không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.NotificationID}
                  onClick={() => !notification.IsRead && handleMarkAsRead(notification.NotificationID)}
                  className={`p-5 text-left transition cursor-pointer flex gap-3.5 items-start ${
                    notification.IsRead
                      ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/60'
                      : 'bg-indigo-50/20 hover:bg-indigo-50/40 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/20'
                  }`}
                >
                  {/* Indicator Dot */}
                  <div className="shrink-0 pt-1">
                    {!notification.IsRead ? (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    ) : (
                      <span className="flex h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <h4 className={`text-xs font-bold leading-tight ${
                      notification.IsRead ? 'text-slate-700 dark:text-slate-350' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notification.Title}
                    </h4>
                    <p className="text-xxs text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
                      {notification.Message}
                    </p>
                    <p className="text-xxxs text-slate-400 dark:text-slate-500 font-semibold pt-1">
                      {getRelativeTime(notification.CreatedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Cài đặt Zalo ZNS & SMS */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default NotificationBell;
