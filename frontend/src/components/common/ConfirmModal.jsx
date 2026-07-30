import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning', // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgIcon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-8 ring-rose-50 dark:ring-rose-900/20',
          icon: <AlertTriangle className="w-8 h-8" />,
          btnConfirm: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-500/25 focus:ring-rose-500',
        };
      case 'success':
        return {
          bgIcon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-900/20',
          icon: <CheckCircle2 className="w-8 h-8" />,
          btnConfirm: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500',
        };
      case 'info':
        return {
          bgIcon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 ring-8 ring-blue-50 dark:ring-blue-900/20',
          icon: <Info className="w-8 h-8" />,
          btnConfirm: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500',
        };
      case 'warning':
      default:
        return {
          bgIcon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 ring-8 ring-amber-50 dark:ring-amber-900/20',
          icon: <AlertCircle className="w-8 h-8" />,
          btnConfirm: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 focus:ring-amber-500',
        };
    }
  };

  const style = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-700/60 transition-all transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          {/* Badge Icon */}
          <div className={`p-3.5 rounded-full mb-4 ${style.bgIcon}`}>
            {style.icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {title || 'Xác nhận thao tác'}
          </h3>

          {/* Message */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-4 px-2">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full sm:w-auto min-w-[240px] justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition cursor-pointer ${style.btnConfirm}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
