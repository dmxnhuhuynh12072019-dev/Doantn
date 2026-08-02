// Test Socket.IO connection
const { io } = require('./frontend/node_modules/socket.io-client');

async function testSocketIO() {
  // 1. Login to get JWT token
  const loginBody = JSON.stringify({ email: 'user@acoh.com', password: 'user123' });
  
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginBody,
  });
  
  const loginData = await loginResponse.json();
  console.log('=== LOGIN ===');
  console.log('User:', loginData.user?.fullName, '| Role:', loginData.user?.role);
  
  const token = loginData.token;
  
  // 2. Connect to Socket.IO with JWT
  console.log('\n=== CONNECTING TO SOCKET.IO ===');
  const socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['polling', 'websocket'],
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected! Socket ID:', socket.id);
    
    // Join room
    socket.emit('join_room', { userId: loginData.user.userId });
    console.log('📡 Joined room: user_' + loginData.user.userId);
  });
  
  socket.on('notification_received', (data) => {
    console.log('\n🔔 REAL-TIME NOTIFICATION RECEIVED:');
    console.log('  Title:', data.Title);
    console.log('  Message:', data.Message?.substring(0, 80) + '...');
  });
  
  socket.on('unread_count_updated', (data) => {
    console.log('\n🔢 UNREAD COUNT UPDATED:', data.unreadCount);
  });
  
  socket.on('connect_error', (err) => {
    console.log('❌ Connection error:', err.message);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });
  
  // 3. Wait 3 seconds, then trigger a test notification via API
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n=== TRIGGERING TEST NOTIFICATION ===');
  const triggerResponse = await fetch('http://localhost:3000/api/notifications/trigger-cron', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const triggerData = await triggerResponse.json();
  console.log('Trigger result:', triggerData.message, '| New notifications:', triggerData.newNotificationsCount);
  
  // 4. Wait 3 seconds for any real-time events
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n=== TEST COMPLETE ===');
  socket.disconnect();
  process.exit(0);
}

testSocketIO().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
