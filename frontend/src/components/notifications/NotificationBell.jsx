import { useState, useEffect, useRef } from 'react';
import * as notificationService from '../../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Không thể tải thông báo:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Thiết lập tự động quét thông báo mỗi 15 giây để tạo cảm giác thời gian thực (real-time)
    const interval = setInterval(fetchNotifications, 15000);

    // Lắng nghe click bên ngoài để tự đóng dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err.message);
    }
  };

  // Test trigger quét hệ thống (Dành cho việc kiểm thử nhanh)
  const handleTriggerTestScan = async () => {
    try {
      const res = await notificationService.triggerCron();
      alert(`Đã kích hoạt quét hệ thống! Phát hiện & tạo thêm ${res.newNotificationsCount} thông báo.`);
      fetchNotifications();
    } catch (err) {
      alert('Không thể kích hoạt quét thử: ' + err.message);
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
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-350 dark:hover:bg-slate-600 transition"
        title="Thông báo"
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xxs font-black text-white ring-2 ring-white dark:ring-slate-800 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Panel */}
          <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-850 dark:text-white text-base">Thông báo</h3>
            <div className="flex gap-2">
              <button
                onClick={handleTriggerTestScan}
                className="text-xxs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg"
                title="Kích hoạt quét hệ thống để cập nhật thông báo về lịch và hạn giấy tờ xe"
              >
                Quét thử
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xxs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
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
    </div>
  );
};

export default NotificationBell;
