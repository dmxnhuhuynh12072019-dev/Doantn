import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-xl';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100 shadow-lg shadow-emerald-500/10';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error' || toast.type === 'danger') {
          bgStyle = 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100 shadow-lg shadow-rose-500/10';
          icon = <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100 shadow-lg shadow-amber-500/10';
          icon = <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform animate-in slide-in-from-top-4 ${bgStyle}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:opacity-75 transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
