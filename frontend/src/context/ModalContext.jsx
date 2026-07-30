import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastContainer from '../components/common/ToastContainer';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  // Confirm Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning',
    resolve: null,
  });

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // confirm function returning a Promise<boolean>
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      // If options is string, normalize to object
      const opts = typeof options === 'string' ? { message: options } : options;
      
      setConfirmState({
        isOpen: true,
        title: opts.title || 'Xác nhận thao tác',
        message: opts.message || 'Bạn có chắc chắn muốn thực hiện thao tác này?',
        confirmText: opts.confirmText || 'Xác nhận',
        cancelText: opts.cancelText || 'Hủy',
        type: opts.type || 'warning',
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  // Toast functions
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ModalContext.Provider value={{ confirm, toast, showToast: addToast }}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
