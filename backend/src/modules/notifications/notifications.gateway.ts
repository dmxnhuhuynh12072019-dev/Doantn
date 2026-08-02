import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // Map quản lý user đang online: userId -> Set<socketId>
  private userSockets = new Map<number, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Xử lý khi client kết nối
  async handleConnection(client: Socket) {
    try {
      // Xác thực JWT token từ handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`[Socket] Client ${client.id} kết nối không có token. Ngắt kết nối.`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Gắn thông tin user vào socket data
      client.data.userId = payload.userId;
      client.data.email = payload.email;
      client.data.role = payload.role?.trim() || '';

      // Tự động join room riêng của user
      const roomName = `user_${payload.userId}`;
      client.join(roomName);

      // Lưu vào map quản lý
      let userSet = this.userSockets.get(payload.userId);
      if (!userSet) {
        userSet = new Set<string>();
        this.userSockets.set(payload.userId, userSet);
      }
      userSet.add(client.id);

      this.logger.log(`[Socket] ✅ User ${payload.email} (ID: ${payload.userId}) đã kết nối. Room: ${roomName}. Socket: ${client.id}`);
    } catch (err) {
      this.logger.warn(`[Socket] Client ${client.id} xác thực thất bại: ${err.message}. Ngắt kết nối.`);
      client.disconnect();
    }
  }

  // Xử lý khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.logger.log(`[Socket] ❌ User ID ${userId} đã ngắt kết nối. Socket: ${client.id}`);
    }
  }

  // Client có thể gửi join_room thủ công (fallback)
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number },
  ) {
    const userId = client.data?.userId || payload?.userId;
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      this.logger.log(`[Socket] User ID ${userId} joined room: ${roomName}`);
      return { event: 'join_room', data: { success: true, room: roomName } };
    }
    return { event: 'join_room', data: { success: false, message: 'UserId không hợp lệ' } };
  }

  // Client gửi leave_room khi đăng xuất
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number },
  ) {
    const userId = client.data?.userId || payload?.userId;
    if (userId) {
      const roomName = `user_${userId}`;
      client.leave(roomName);
      this.logger.log(`[Socket] User ID ${userId} left room: ${roomName}`);
      return { event: 'leave_room', data: { success: true } };
    }
    return { event: 'leave_room', data: { success: false } };
  }

  // === PUBLIC METHODS cho Service gọi ===

  /**
   * Gửi thông báo real-time tới user cụ thể
   */
  sendNotificationToUser(userId: number, notification: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('notification_received', notification);
    this.logger.log(`[Socket] 📨 Đã emit 'notification_received' tới room ${roomName}`);
  }

  /**
   * Gửi cập nhật số lượng thông báo chưa đọc tới user cụ thể
   */
  sendUnreadCount(userId: number, count: number) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('unread_count_updated', { unreadCount: count });
    this.logger.log(`[Socket] 🔢 Đã emit 'unread_count_updated' (count: ${count}) tới room ${roomName}`);
  }

  /**
   * Kiểm tra user có đang online hay không
   */
  isUserOnline(userId: number): boolean {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }

  /**
   * Lấy số lượng user đang online
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
