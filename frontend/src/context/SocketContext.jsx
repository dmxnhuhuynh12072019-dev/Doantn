import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// URL của backend Socket.IO server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Chỉ kết nối khi user đã đăng nhập và có token
    if (!user || !token) {
      // Ngắt kết nối nếu user đăng xuất
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Tạo kết nối Socket.IO với JWT token xác thực
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
    });

    // Lắng nghe sự kiện kết nối thành công
    newSocket.on('connect', () => {
      console.log('[Socket.IO] ✅ Đã kết nối thành công. Socket ID:', newSocket.id);
      setIsConnected(true);

      // Gửi join_room (fallback, server đã tự join trong handleConnection)
      newSocket.emit('join_room', { userId: user.userId });
    });

    // Lắng nghe sự kiện mất kết nối
    newSocket.on('disconnect', (reason) => {
      console.log('[Socket.IO] ❌ Mất kết nối. Lý do:', reason);
      setIsConnected(false);
    });

    // Lắng nghe lỗi kết nối
    newSocket.on('connect_error', (err) => {
      console.warn('[Socket.IO] ⚠️ Lỗi kết nối:', err.message);
      setIsConnected(false);
    });

    // Lắng nghe kết nối lại thành công
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket.IO] 🔄 Kết nối lại thành công sau ${attemptNumber} lần thử.`);
      setIsConnected(true);
      newSocket.emit('join_room', { userId: user.userId });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup khi unmount hoặc khi user/token thay đổi
    return () => {
      newSocket.emit('leave_room', { userId: user.userId });
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.userId, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket phải được sử dụng bên trong SocketProvider');
  }
  return context;
};
