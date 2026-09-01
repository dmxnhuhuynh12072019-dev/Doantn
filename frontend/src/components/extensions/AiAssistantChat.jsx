import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../../services/extensionService';

const AiAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Xin chào! Tôi là Bác sĩ xe AI – Trợ lý bảo dưỡng thông minh ACOH.\n\nBạn có thể hỏi tôi về chu kỳ bảo dưỡng xe, giải mã tiếng kêu gầm, đèn báo lỗi hay tra cứu chi phí phụ tùng!',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickChips = [
    { label: '🩺 Khám sức khỏe xe', prompt: 'Đánh giá sức khỏe và tình trạng xe của tôi' },
    { label: '🛢️ Thay dầu & lọc nhớt', prompt: 'Khi nào cần thay dầu máy và lọc nhớt ô tô?' },
    { label: '🔧 Gói 4 vạn km', prompt: 'Xe chạy 4 vạn km cần làm những gì và chi phí bao nhiêu?' },
    { label: '⚠️ Đèn check engine', prompt: 'Đèn cá vàng báo lỗi động cơ sáng là bị sao?' },
    { label: '💰 Bảng giá phụ tùng', prompt: 'Báo giá tham khảo các dịch vụ bảo dưỡng phổ biến' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendQuery = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput('');
    
    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);
    try {
      const res = await chatWithAI(userText);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply || 'Không có phản hồi từ trợ lý.',
        time: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '❌ Có lỗi xảy ra trong quá trình xử lý câu hỏi. Vui lòng thử lại sau.',
        time: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenExternal = (e) => {
      setIsOpen(true);
      if (e.detail && e.detail.prompt) {
        setTimeout(() => {
          sendQuery(e.detail.prompt);
        }, 200);
      }
    };
    window.addEventListener('open-acoh-ai-chat', handleOpenExternal);
    return () => window.removeEventListener('open-acoh-ai-chat', handleOpenExternal);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="fixed bottom-20 right-5 sm:bottom-6 sm:right-6 z-50 font-sans">
      {/* 1. Chat bubble floating icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group cursor-pointer"
          title="Trò chuyện với Bác sĩ xe AI"
        >
          <span className="text-2xl">🤖</span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* 2. Expanded Chat window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[500px] sm:h-[540px] max-h-[82vh] bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-4 flex justify-between items-center text-white shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
                🩺
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                  <span>Bác Sĩ Xe AI Assistant</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-white/20 rounded">
                    Pro
                  </span>
                </h3>
                <span className="text-[10px] text-indigo-100 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Chẩn đoán & Cảnh báo 24/7
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-lg font-bold"
              title="Thu nhỏ khung chat"
            >
              &times;
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="bg-slate-100/70 dark:bg-slate-750/50 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200/60 dark:border-slate-700">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(chip.prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap border border-slate-200/80 dark:border-slate-700 shadow-2xs transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 rounded-tl-none font-normal'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                  <span
                    className={`block text-[9px] mt-1.5 text-right font-medium ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200/70 dark:border-slate-700 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi triệu chứng xe, chi phí bảo dưỡng..."
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-600 transition shrink-0 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiAssistantChat;
