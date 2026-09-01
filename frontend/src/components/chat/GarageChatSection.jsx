import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import * as garageService from '../../services/garageService';

// Initial Garage Conversations matching ACOH Partner Garages
const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    name: 'ACOH Garage Sài Gòn',
    owner: 'Anh Tuấn (Trưởng xưởng kỹ thuật)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '👨‍🔧',
    avatarBg: 'bg-indigo-600',
    isOnline: true,
    lastTime: '2 phút',
    badge: 'Xưởng chính hãng',
    unreadCount: 1,
    tab: 'priority',
    messages: [
      { id: '1', sender: 'garage', text: 'Chào anh/chị! Em là Tuấn - Trưởng xưởng ACOH Garage.', time: '08:15', isRead: true },
      { id: '2', sender: 'user', text: 'Chào anh, gara mình có sẵn lọc nhớt và nhớt Motul cho xe Camry không ạ?', time: '08:20', isRead: true },
      { id: '3', sender: 'garage', text: 'Dạ bên em sẵn đủ các loại nhớt Motul 5W-30 và lọc nhớt chính hãng Toyota. Anh/chị mang xe qua lúc nào cũng được đón tiếp ngay ạ!', time: '08:22', isRead: true },
    ],
  },
  {
    id: 2,
    name: 'Gara Ô Tô Tân Bình AutoCare',
    owner: 'Anh Hoàng (Kỹ thuật trưởng)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '🧑‍🔧',
    avatarBg: 'bg-indigo-700',
    isOnline: true,
    lastTime: '13 phút',
    badge: 'Đồng sơn & Máy',
    unreadCount: 0,
    tab: 'priority',
    messages: [
      { id: '1', sender: 'garage', text: 'Chào bạn! Xưởng Tân Bình đang có ưu đãi kiểm tra gầm & hệ thống phanh miễn phí trong tuần này.', time: '10:00', isRead: true },
      { id: '2', sender: 'user', text: 'Luôn', time: '10:05', isRead: true },
    ],
  },
  {
    id: 3,
    name: 'Gara Đồng Sơn & Chăm Sóc Xe Q10',
    owner: 'Chị Mai (Tiếp nhận dịch vụ)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '👩‍🔧',
    avatarBg: 'bg-purple-600',
    isOnline: false,
    lastTime: '30 phút',
    badge: 'Phủ Ceramic',
    unreadCount: 0,
    tab: 'priority',
    messages: [
      { id: '1', sender: 'garage', text: 'Dạ em là Mai. Gara chuyên phục hồi thân vỏ, sơn hấp vi tính Dupont 100% màu zin ạ.', time: '14:20', isRead: true },
      { id: '2', sender: 'user', text: 'Xe mình bị cạ vỉa hè xước nhẹ ở cản trước, làm mất bao lâu em?', time: '14:25', isRead: true },
      { id: '3', sender: 'garage', text: 'Dạ vết xước cản làm sơn dặm sấy nhanh chỉ mất khoảng 2 - 3 tiếng là lấy xe ngay trong ngày ạ!', time: '14:30', isRead: true },
    ],
  },
  {
    id: 4,
    name: 'Đội Cứu Hộ Ô Tô 24/7 Thủ Đức',
    owner: 'Anh Nam (Đội trưởng cứu hộ)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '🚨',
    avatarBg: 'bg-rose-600',
    isOnline: true,
    lastTime: '2 giờ',
    badge: 'Cứu hộ 24/7',
    unreadCount: 0,
    tab: 'priority',
    messages: [
      { id: '1', sender: 'garage', text: 'Đội cứu hộ lưu động 24/7 luôn sẵn sàng hỗ trợ kích bình, vá lốp tận nơi hoặc kéo xe về xưởng.', time: '11:00', isRead: true },
      { id: '2', sender: 'user', text: 'Dạ', time: '11:02', isRead: true },
    ],
  },
  {
    id: 5,
    name: 'Gara Máy Lạnh & Điện Ô Tô Quận 7',
    owner: 'Anh Hùng (Chuyên gia điện lạnh)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '❄️',
    avatarBg: 'bg-blue-600',
    isOnline: false,
    lastTime: '1 ngày',
    badge: 'Điện lạnh ô tô',
    unreadCount: 0,
    tab: 'other',
    messages: [
      { id: '1', sender: 'garage', text: 'Gara có máy soi nội soi giàn lạnh và nạp gas lạnh R134a/R1234yf tự động chuẩn hãng.', time: '09:00', isRead: true },
    ],
  },
  {
    id: 6,
    name: 'Hệ Thống Lốp & Cân Mâm Hunter Q5',
    owner: 'Anh Long (Kỹ thuật mâm lốp)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    fallbackAvatar: '🛞',
    avatarBg: 'bg-amber-600',
    isOnline: true,
    lastTime: '2 ngày',
    badge: 'Cân mâm Hunter',
    unreadCount: 0,
    tab: 'other',
    messages: [
      { id: '1', sender: 'garage', text: 'Bên em trang bị máy cân chỉnh độ chụm 3D Hunter nhập khẩu Mỹ, triệt tiêu hoàn toàn hiện tượng nhao lái, ăn mòn lốp không đều.', time: '16:00', isRead: true },
    ],
  },
];

// Smart reply generator
const generateGarageResponse = (text, garage) => {
  const query = text.toLowerCase().trim();
  const owner = garage?.owner || 'Chủ xưởng';
  const garageName = garage?.name || 'ACOH Gara đối tác';

  if (/(chào|hello|hi|alo|ad|admin|em ơi|anh ơi)/i.test(query) && query.length < 25) {
    return `Dạ chào bạn! ${owner} bên ${garageName} đây ạ. Xe bạn đang cần kiểm tra bảo dưỡng hạng mục nào để bên em tư vấn chuẩn bị phụ tùng ạ?`;
  }
  if (/(ở đâu|địa chỉ|vị trí|chỉ đường|đường đi|map)/i.test(query)) {
    return `Dạ xưởng ${garageName} nằm tại trục đường chính thuận tiện, mặt bằng sân bãi đỗ ô tô rộng rãi. Bạn có thể bấm nút gọi hoặc để lại SĐT để bên em gửi định vị Google Maps qua nhé!`;
  }
  if (/(nhớt|thay nhớt|dầu|bảo dưỡng|10000|5000|20000|định kỳ)/i.test(query)) {
    return `Dạ gói thay nhớt và bảo dưỡng định kỳ bên em dùng nhớt chính hãng (Castrol / Motul / Mobil 1), tặng kèm kiểm tra tổng quát 20 hạng mục gầm & phanh. Thời gian làm chỉ 30 - 45 phút là xong ạ!`;
  }
  if (/(sơn|trầy|xước|móp|đồng sơn|va quẹt|dặm)/i.test(query)) {
    return `Dạ xưởng có phòng sơn sấy hấp Dupont chuẩn màu gốc 100%, bảo hành sơn 12 tháng. Bạn có thể gửi ảnh vết trầy xước qua đây để bên em báo giá chính xác luôn nhé!`;
  }
  if (/(máy lạnh|điều hòa|không mát|lạnh yếu|gas|mùi hôi)/i.test(query)) {
    return `Dạ tình trạng máy lạnh không mát bên em có máy soi rò rỉ và dịch vụ vệ sinh nội soi giàn lạnh không cần tháo taplo, làm 40 phút là mát lạnh sâu ngay ạ!`;
  }
  if (/(kêu|lục cục|gầm|phanh|thắng|rung|rotuyn)/i.test(query)) {
    return `Dạ xe bị kêu lục cục ở gầm hoặc rung khi phanh có thể do rơ rotuyn hoặc mòn bố thắng. Bạn mang xe qua xưởng em nâng cầu kiểm tra thực tế miễn phí 100% trước khi làm nhé!`;
  }
  if (/(cứu hộ|hết bình|kích bình|xì lốp|không nổ|chết máy)/i.test(query)) {
    return `Dạ đội cứu hộ bên em túc trực 24/7! Bạn gửi vị trí hiện tại của xe hoặc gọi hotline gara, thợ sẽ xuất phát đến hỗ trợ ngay sau 15 phút ạ!`;
  }
  if (/(giá|chi phí|bao nhiêu|báo giá)/i.test(query)) {
    return `Dạ bảng giá dịch vụ bên em luôn niêm yết rõ ràng, báo giá chi tiết từng phụ tùng trước khi làm và cam kết không phát sinh chi phí. Bạn đang chạy xe dòng nào để em báo giá chuẩn nhé?`;
  }
  if (/(đặt lịch|hẹn|ngày mai|hôm nay)/i.test(query)) {
    return `Dạ tuyệt vời ạ! Bạn có thể bấm nút [ 📅 Đặt lịch ] ngay trên đầu khung chat hoặc báo em giờ dự kiến, bên em sẽ giữ cầu nâng ưu tiên cho xe bạn nhé!`;
  }
  if (/(cảm ơn|ok|tks|dạ|vâng|được rồi)/i.test(query)) {
    return `Dạ không có gì ạ! ${owner} và toàn bộ đội ngũ ${garageName} rất hân hạnh được phục vụ bạn. Chúc bạn lái xe an toàn!`;
  }
  return `Dạ em là ${owner} bên ${garageName} đã ghi nhận tin nhắn: "${text}". Bạn có thể gửi thêm thông tin đời xe hoặc chụp ảnh hiện trạng để bên em hỗ trợ chu đáo nhất nhé!`;
};

const GarageChatSection = ({
  onBack,
  onNavigateHome,
  onNavigateServices,
  onNavigateAppointments,
  onNavigateVehicles,
  onNavigateAccount,
  onOpenBookingWithGarage,
}) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Active Tab in Conversation List: 'priority' (Ưu tiên) | 'other' (Khác)
  const [activeTab, setActiveTab] = useState('priority');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Conversation (null means show list on mobile)
  const [selectedChat, setSelectedChat] = useState(null);

  // Conversations state with localStorage persistence
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('acoh_zalo_style_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_CONVERSATIONS;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('acoh_zalo_style_chats', JSON.stringify(conversations));
    } catch (e) {
      console.warn(e);
    }
  }, [conversations]);

  // Auto scroll to bottom of active chat
  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, conversations, isTyping]);

  // Handle sending message
  const handleSendMessage = (textToSend, mediaUrl = null) => {
    const text = (textToSend || inputText).trim();
    if ((!text && !mediaUrl) || !selectedChat) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text || '[Hình ảnh]',
      mediaUrl: mediaUrl || null,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    // Update conversation
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedChat.id) {
          const updatedMessages = [...c.messages, newMsg];
          return {
            ...c,
            lastTime: 'Vừa xong',
            messages: updatedMessages,
          };
        }
        return c;
      })
    );

    // Update selectedChat reference
    setSelectedChat((prev) => prev ? {
      ...prev,
      lastTime: 'Vừa xong',
      messages: [...prev.messages, newMsg],
    } : null);

    setInputText('');

    // Emit real-time Socket event if available
    if (socket && isConnected) {
      socket.emit('garage_chat_message', {
        garageId: selectedChat.id,
        userId: user?.userId,
        message: text,
      });
    }

    // Realistic Garage Owner Live Reply Simulation
    setIsTyping(true);
    const replyDelay = Math.floor(Math.random() * 500) + 700;
    setTimeout(() => {
      const replyText = generateGarageResponse(text, selectedChat);
      const garageReply = {
        id: (Date.now() + 1).toString(),
        sender: 'garage',
        text: replyText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedChat.id) {
            return {
              ...c,
              lastTime: 'Vừa xong',
              messages: [...c.messages, garageReply],
            };
          }
          return c;
        })
      );

      setSelectedChat((prev) => prev && prev.id === selectedChat.id ? {
        ...prev,
        lastTime: 'Vừa xong',
        messages: [...prev.messages, garageReply],
      } : prev);

      setIsTyping(false);
    }, replyDelay);
  };

  // Image Upload Simulation
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      handleSendMessage('Ảnh chụp tình trạng xe gửi gara kiểm tra:', fakeUrl);
    }
  };

  // Filter conversations based on tab & search
  const filteredConversations = conversations.filter((c) => {
    const matchTab = activeTab === 'priority' ? c.tab === 'priority' : c.tab === 'other';
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch && (searchQuery ? true : matchTab);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col select-none pb-16 md:pb-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP BAR: ACOH BRAND GRADIENT HEADER                                    */}
      {/* ========================================================================= */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white px-3 sm:px-5 py-3 shadow-md flex items-center justify-between gap-3 shrink-0 z-50 border-b border-indigo-950/40">
        
        {/* Back Button (Returns to Home or Dashboard) */}
        <button
          onClick={() => {
            if (selectedChat) {
              setSelectedChat(null);
            } else {
              onBack();
            }
          }}
          className="w-8 h-8 rounded-xl hover:bg-white/20 bg-white/10 border border-white/20 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
          title="Quay lại"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Search Input Bar (Matching ACOH Brand Aesthetics) */}
        {!selectedChat ? (
          <div className="flex-1 flex items-center bg-white/15 hover:bg-white/20 focus-within:bg-white/25 border border-white/20 rounded-2xl px-3.5 py-1.5 transition shadow-inner">
            <svg className="w-4 h-4 text-indigo-200 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm gara, thợ sửa xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-indigo-200 text-xs sm:text-sm font-semibold focus:outline-none"
            />
          </div>
        ) : (
          /* Active Chat Room Title */
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold overflow-hidden shrink-0 border-2 border-white/40 shadow-xs">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.fallbackAvatar
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-white text-xs sm:text-sm font-black truncate leading-tight">
                {selectedChat.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-indigo-100">{selectedChat.owner} • Trực tuyến</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {!selectedChat ? (
            <>
              {/* QR Scanner Icon */}
              <button
                onClick={() => alert('Quét mã QR Gara đối tác ACOH')}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition cursor-pointer"
                title="Quét QR Gara"
              >
                📷
              </button>
              {/* Add / Search Garage Button */}
              <button
                onClick={() => {
                  const name = prompt('Nhập tên xưởng hoặc gara bạn muốn liên hệ:');
                  if (name) setSearchQuery(name);
                }}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-lg font-bold transition cursor-pointer"
                title="Thêm cuộc trò chuyện"
              >
                +
              </button>
            </>
          ) : (
            <>
              {/* Phone Call Button */}
              <button
                onClick={() => alert(`Đang kết nối cuộc gọi thoại đến ${selectedChat.name}...`)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition cursor-pointer"
                title="Gọi thoại"
              >
                📞
              </button>
              {/* Booking Shortcut Button */}
              {onOpenBookingWithGarage && (
                <button
                  onClick={() => onOpenBookingWithGarage(selectedChat)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xxs font-black shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95 border border-amber-400/40"
                  title="Đặt lịch bảo dưỡng"
                >
                  <span>📅</span>
                  <span className="hidden sm:inline">Đặt lịch</span>
                </button>
              )}
            </>
          )}

          {/* Exit / Close Button */}
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600/80 border border-white/20 text-white flex items-center justify-center text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
            title="Thoát về Trang chủ"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTAINER: LIST VIEW OR ACTIVE CHAT ROOM                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto overflow-hidden bg-white dark:bg-slate-800 md:my-4 md:rounded-3xl md:border md:border-slate-200/80 dark:md:border-slate-700/80 md:shadow-md">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN: CONVERSATION LIST (ACOH Indigo Brand Tabs & Item Cells)  */}
        {/* ===================================================================== */}
        <div
          className={`w-full md:w-88 lg:w-96 flex flex-col border-r border-slate-150 dark:border-slate-750 bg-white dark:bg-slate-850 ${
            selectedChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sub-tabs: Ưu tiên | Khác */}
          <div className="flex border-b border-slate-150 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('priority')}
              className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
                activeTab === 'priority'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              ⭐ Gara Ưu tiên ({conversations.filter(c => c.tab === 'priority').length})
            </button>
            <button
              onClick={() => setActiveTab('other')}
              className={`flex-1 py-3 text-center border-b-2 transition cursor-pointer ${
                activeTab === 'other'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              🏢 Khác ({conversations.filter(c => c.tab === 'other').length})
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy cuộc trò chuyện phù hợp.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedChat?.id === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isFromUser = lastMsg?.sender === 'user';

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedChat(conv)}
                    className={`p-3.5 flex items-center gap-3.5 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750/70 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : ''
                    }`}
                  >
                    {/* Circular Avatar with Online Indicator */}
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-indigo-50 text-xl shadow-2xs">
                        {conv.avatar ? (
                          <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                        ) : (
                          conv.fallbackAvatar
                        )}
                      </div>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-xs"></span>
                      )}
                    </div>

                    {/* Details: Name, Last Message, Time snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className={`text-sm font-bold truncate leading-tight ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {conv.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                          {conv.lastTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
                          {lastMsg ? (
                            <>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {isFromUser ? 'Bạn: ' : `${conv.owner.split(' ')[0]}: `}
                              </span>
                              <span>{lastMsg.text}</span>
                            </>
                          ) : (
                            'Bắt đầu cuộc trò chuyện...'
                          )}
                        </p>

                        {/* Unread red dot indicator */}
                        {conv.unreadCount > 0 && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: ACTIVE REALTIME CHAT ROOM                               */}
        {/* ===================================================================== */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900 overflow-hidden ${
            !selectedChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedChat ? (
            <>
              {/* Message Stream Area */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-slate-100/50 dark:bg-slate-900/60">
                {/* Time Center Badge */}
                <div className="flex items-center justify-center my-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-750 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
                    Hôm nay
                  </span>
                </div>

                {selectedChat.messages.map((msg) => {
                  const isUser = msg.sender === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Garage Avatar on incoming message */}
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-2xs border border-slate-200 mb-1">
                          {selectedChat.avatar ? (
                            <img src={selectedChat.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">{selectedChat.fallbackAvatar}</span>
                          )}
                        </div>
                      )}

                      {/* Chat Bubble */}
                      <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words whitespace-pre-wrap ${
                            isUser
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 border border-slate-150 dark:border-slate-700/80 rounded-bl-xs'
                          }`}
                        >
                          {msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="attached"
                              className="rounded-xl max-h-48 w-auto mb-2 border border-white/20 object-cover"
                            />
                          )}
                          <p>{msg.text}</p>
                        </div>

                        {/* Timestamp & Read Status */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5 px-1">
                          <span>{msg.time}</span>
                          {isUser && <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓✓ Đã nhận</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start animate-fadeIn">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200 mb-1">
                      <img src={selectedChat.avatar} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 rounded-bl-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-slate-400 font-medium ml-1">Chủ xưởng đang nhập...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Chips above input bar */}
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-black text-slate-400 shrink-0 uppercase tracking-wider">
                  Hỏi nhanh:
                </span>
                {[
                  'Báo giá thay nhớt & lọc gió',
                  'Xe bị kêu lục cục ở gầm khi rẽ',
                  'Gara có nhận xe làm trong ngày?',
                  'Có dịch vụ cứu hộ khẩn cấp không?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xxs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 hover:bg-indigo-50 dark:hover:bg-slate-600 shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Action Bar */}
              <div className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0">
                {/* Photo Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-lg transition cursor-pointer shrink-0"
                  title="Gửi hình ảnh tình trạng xe"
                >
                  🖼️
                </button>

                {/* Voice Note Simulation Button */}
                <button
                  onClick={() => handleSendMessage('🎙️ [Tin nhắn thoại 0:08s]')}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-base transition cursor-pointer shrink-0"
                  title="Ghi âm giọng nói"
                >
                  🎙️
                </button>

                {/* Main Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Nhập tin nhắn gửi cho ${selectedChat.owner.split(' ')[0]}...`}
                  className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-850 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white flex items-center justify-center shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title="Gửi"
                >
                  <svg className="w-4 h-4 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            /* Empty State on Desktop */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mb-3 shadow-xs">
                💬
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">
                Kênh nhắn tin trực tiếp với Chủ xưởng Gara
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Chọn một xưởng hoặc gara đối tác ở danh sách bên trái để gửi câu hỏi, ảnh tình trạng xe hoặc nhận báo giá tức thì.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Exact Match with Dashboard Tabs)         */}
      {/* ========================================================================= */}
      {!selectedChat && (
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

          {/* 2. Tin nhắn (Active) */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1 text-xxs font-bold cursor-pointer text-indigo-600 dark:text-indigo-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Tin nhắn</span>
          </button>

          {/* 4. Tài khoản */}
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
      )}

    </div>
  );
};

export default GarageChatSection;
