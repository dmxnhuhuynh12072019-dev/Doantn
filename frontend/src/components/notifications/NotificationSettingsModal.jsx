import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getPreferences, updatePreferences, sendTestZns, getNotificationLogs } from '../../services/notificationService';

const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [receiveZaloNotif, setReceiveZaloNotif] = useState(true);
  const [receiveSmsNotif, setReceiveSmsNotif] = useState(true);
  const [zaloPhoneNumber, setZaloPhoneNumber] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prefs = await getPreferences();
      setReceiveZaloNotif(prefs.receiveZaloNotif);
      setReceiveSmsNotif(prefs.receiveSmsNotif);
      setZaloPhoneNumber(prefs.zaloPhoneNumber || prefs.phoneNumber || '');

      const logData = await getNotificationLogs();
      setLogs(logData || []);
    } catch (err) {
      console.error('Lỗi khi tải cấu hình thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await updatePreferences({
        receiveZaloNotif,
        receiveSmsNotif,
        zaloPhoneNumber,
      });
      setFeedback({ type: 'success', text: res.message || 'Lưu cấu hình thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Lỗi khi lưu cấu hình' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await sendTestZns({ phoneNumber: zaloPhoneNumber });
      setFeedback({
        type: res.success ? 'success' : 'warning',
        text: `[${res.channel}] ${res.statusMessage}`,
      });
      // Refresh logs
      const logData = await getNotificationLogs();
      setLogs(logData || []);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Gửi thử thất bại' });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
              📱
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Cài đặt Thông báo Zalo ZNS & SMS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý các kênh cảnh báo tự động khi xe đến hạn bảo dưỡng, đăng kiểm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {feedback && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : feedback.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="ml-2 font-bold">✕</button>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400">Đang tải cấu hình thông báo...</div>
          ) : (
            <>
              {/* Tùy chọn Kênh thông báo */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Cấu hình Kênh nhận thông báo
                </h4>

                {/* Zalo ZNS Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Thông báo Zalo ZNS
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Gửi tin nhắn trực tiếp qua Zalo Official Account khi đến hạn bảo dưỡng / đăng kiểm
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiveZaloNotif}
                      onChange={(e) => setReceiveZaloNotif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* SMS Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-slate-200/40 dark:border-slate-700/40">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Tin nhắn SMS Dự phòng (Fallback SMS)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Tự động chuyển sang tin nhắn SMS nếu tài khoản chưa kết nối Zalo
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiveSmsNotif}
                      onChange={(e) => setReceiveSmsNotif(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Số điện thoại nhận Zalo */}
                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Số điện thoại nhận tin Zalo / SMS:
                  </label>
                  <input
                    type="text"
                    value={zaloPhoneNumber}
                    onChange={(e) => setZaloPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestSend}
                  disabled={testing}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {testing ? '⏳ Đang gửi...' : '🚀 Gửi thử tin nhắn Zalo ZNS'}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>

              {/* Nhật ký thông báo Logs */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                  <span>📋 Nhật ký Gửi tin nhắn gần đây</span>
                  <span className="text-xs text-slate-400 font-normal">{logs.length} bản ghi</span>
                </h4>

                {logs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    Chưa có nhật ký gửi tin nhắn Zalo / SMS nào.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.LogID}
                        className="p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">
                              {log.Channel}
                            </span>
                            <span className="truncate">{log.Title || log.Message}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            SĐT: {log.Recipient} • {new Date(log.SentAt).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              log.Status === 'Thành công'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.Status === 'Fallback SMS'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.Status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationSettingsModal;
