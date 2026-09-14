import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyGarageSettings, updateMyGarageSettings } from '../../services/garageService';

// Danh sách ngân hàng phổ biến tại Việt Nam
const VIETNAM_BANKS = [
  { code: 'VCB', name: 'Vietcombank', shortName: 'Vietcombank', bin: '970436' },
  { code: 'MB', name: 'MB Bank (Quân Đội)', shortName: 'MBBank', bin: '970422' },
  { code: 'TCB', name: 'Techcombank', shortName: 'Techcombank', bin: '970407' },
  { code: 'CTG', name: 'VietinBank', shortName: 'VietinBank', bin: '970415' },
  { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)', shortName: 'BIDV', bin: '970418' },
  { code: 'ACB', name: 'ACB (Á Châu)', shortName: 'ACB', bin: '970416' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', shortName: 'VPBank', bin: '970432' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)', shortName: 'TPBank', bin: '970423' },
  { code: 'STB', name: 'Sacombank', shortName: 'Sacombank', bin: '970403' },
  { code: 'HDB', name: 'HDBank', shortName: 'HDBank', bin: '970437' },
];

// Danh sách gợi ý dịch vụ mũi nhọn
const POPULAR_SERVICES = [
  'Bảo dưỡng định kỳ',
  'Sửa chữa gầm máy',
  'Chẩn đoán điện tử OBD-II',
  'Đồng sơn & Phục hồi va chạm',
  'Điện & Điện lạnh ô tô',
  'Đồ chơi & Nâng cấp phụ kiện',
  'Cứu hộ khẩn cấp 24/7',
  'Đăng kiểm & Rửa xe chi tiết',
  'Cân chỉnh thước lái & Lốp',
  'Bảo dưỡng hộp số tự động',
];

const GarageSettingsTab = () => {
  const { user, themePreference, updateThemePreference, changePassword } = useAuth();

  // Tab con hiện tại
  const [currentSubTab, setCurrentSubTab] = useState('profile'); // 'profile' | 'operations' | 'banking' | 'invoicing' | 'notifications' | 'security'
  
  // Trạng thái dữ liệu cấu hình
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  // Form State
  const [formData, setFormData] = useState({
    garageName: '',
    ownerName: '',
    phone: '',
    rescueHotline: '1900 6868',
    email: '',
    address: '',
    taxCode: '',
    description: '',
    openingHours: '07:30 - 18:00',
    openDays: 'Thứ 2 - Thứ 7 (Nghỉ CN)',
    serviceCapacity: 6,
    slotDuration: 45,
    maxParallelSlots: 4,
    bankName: 'Vietcombank',
    bankAccountNumber: '',
    bankAccountHolder: '',
    servicesOffered: 'Bảo dưỡng định kỳ, Sửa chữa gầm máy, Chẩn đoán điện tử, Đồng sơn cao cấp, Phụ tùng chính hãng, Cứu hộ 24/7',
    vatRate: 10,
    warrantyTerms: 'Bảo hành phụ tùng chính hãng 12 tháng hoặc 20.000km. Miễn phí công kiểm tra lại trong vòng 7 ngày.',
    invoiceFooterNote: 'AutoCare trân trọng cảm ơn Quý khách. Kính chúc Quý khách vạn dặm bình an!',
    receiveZaloNotif: true,
    receiveSmsNotif: true,
    receiveEmailReport: true,
    soundAlertEnabled: true,
    avatarUrl: '',
    bannerUrl: '',
    isActive: true,
    rating: 5.0,
  });

  // Custom service input
  const [newServiceInput, setNewServiceInput] = useState('');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Preview Modal state for Invoice / Receipt
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // Tải dữ liệu Gara ban đầu
  useEffect(() => {
    fetchGarageData();
  }, []);

  const fetchGarageData = async () => {
    setLoading(true);
    try {
      const data = await getMyGarageSettings();
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data,
          ownerName: data.ownerName || user?.fullName || '',
          phone: data.phone || user?.phoneNumber || '',
          email: data.email || user?.email || '',
        }));
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin Gara:', err);
      // Fallback với thông tin user hiện tại nếu chưa có data riêng
      setFormData(prev => ({
        ...prev,
        garageName: user?.fullName ? `Gara Dịch Vụ ${user.fullName}` : 'AutoCare Central Garage',
        ownerName: user?.fullName || '',
        phone: user?.phoneNumber || '',
        email: user?.email || '',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Lưu cài đặt chung
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateMyGarageSettings(formData);
      setFormData(prev => ({ ...prev, ...updated }));
      setFeedback({ type: 'success', text: '✅ Đã lưu toàn bộ cấu hình Gara thành công!' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Lỗi khi cập nhật cài đặt Gara' });
    } finally {
      setSaving(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Vui lòng nhập đầy đủ các trường mật khẩu.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordFeedback({ type: 'success', text: '🎉 Đổi mật khẩu thành công!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordFeedback(null), 5000);
    } catch (err) {
      setPasswordFeedback({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Parse & toggle services
  const currentServicesList = formData.servicesOffered
    ? formData.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const toggleService = (service) => {
    let updated;
    if (currentServicesList.includes(service)) {
      updated = currentServicesList.filter(s => s !== service);
    } else {
      updated = [...currentServicesList, service];
    }
    handleInputChange('servicesOffered', updated.join(', '));
  };

  const handleAddCustomService = () => {
    if (!newServiceInput.trim()) return;
    if (!currentServicesList.includes(newServiceInput.trim())) {
      const updated = [...currentServicesList, newServiceInput.trim()];
      handleInputChange('servicesOffered', updated.join(', '));
    }
    setNewServiceInput('');
  };

  // VietQR Code URL calculation
  const getVietQrUrl = () => {
    if (!formData.bankAccountNumber || !formData.bankName) return null;
    const selectedBank = VIETNAM_BANKS.find(b => b.name === formData.bankName || b.shortName === formData.bankName) || VIETNAM_BANKS[0];
    const bankCode = selectedBank.shortName.toLowerCase();
    const accNum = encodeURIComponent(formData.bankAccountNumber.trim());
    const accName = encodeURIComponent(formData.bankAccountHolder || formData.garageName || 'AUTOCARE GARAGE');
    return `https://img.vietqr.io/image/${bankCode}-${accNum}-compact2.png?amount=0&addInfo=Thanh%20Toan%20Dich%20Vu%20Gara&accountName=${accName}`;
  };

  const subTabs = [
    { id: 'profile', label: '🏬 Hồ sơ & Thương hiệu', desc: 'Thông tin xưởng, liên hệ, địa chỉ & dịch vụ' },
    { id: 'operations', label: '⏱️ Năng lực & Giờ mở cửa', desc: 'Sức chứa cầu nâng, khung giờ, nhận lịch' },
    { id: 'banking', label: '💳 Tài khoản & VietQR', desc: 'Thông tin thụ hưởng & Mã QR quét trả tiền' },
    { id: 'invoicing', label: '🧾 Báo giá, VAT & Mẫu in', desc: 'Thuế VAT, điều khoản bảo hành & hóa đơn' },
    { id: 'security', label: '🔒 Bảo mật & Giao diện', desc: 'Đổi mật khẩu & tùy chỉnh theme Sáng/Tối' },
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Đang tải cấu hình Gara...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. HERO HEADER CARD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1 shadow-lg shrink-0 flex items-center justify-center text-3xl">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                '🏬'
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {formData.isActive ? '● Đang hoạt động' : '○ Tạm đóng cửa'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ⭐ {formData.rating || 5.0} / 5.0 Uy tín
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚡ {formData.serviceCapacity || 6} Cầu nâng
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {formData.garageName || 'AutoCare Central Garage'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {formData.address || 'Chưa cập nhật địa chỉ xưởng'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGarageData()}
              disabled={loading || saving}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Tải lại thông tin mới nhất"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-black transition shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lưu tất cả cài đặt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all duration-300 shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span>{feedback.type === 'success' ? '✨' : '⚠️'}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-black p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. SUB-TAB NAVIGATION PILLS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-1.5 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {subTabs.map(tab => {
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentSubTab(tab.id)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col justify-center cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className="font-extrabold truncate block">{tab.label}</span>
                <span className={`text-[10px] font-normal truncate mt-0.5 block ${isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN SETTINGS CONTENT AREA */}
      <div className="space-y-6">

        {/* ===================================================================== */}
        {/* SUBTAB 1: HỒ SƠ & THƯƠNG HIỆU GARA                                    */}
        {/* ===================================================================== */}
        {currentSubTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left Col: Info fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏢</span> Thông tin cơ bản xưởng dịch vụ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tên hiển thị và các thông tin liên hệ chính thức mà khách hàng sẽ nhìn thấy khi tìm kiếm Gara.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên Gara / Trung tâm dịch vụ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.garageName}
                      onChange={(e) => handleInputChange('garageName', e.target.value)}
                      placeholder="Ví dụ: AutoCare Central Garage"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Người đại diện / Quản lý xưởng
                    </label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="Nguyễn Văn Quản Lý"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mã số thuế / Giấy phép kinh doanh
                    </label>
                    <input
                      type="text"
                      value={formData.taxCode}
                      onChange={(e) => handleInputChange('taxCode', e.target.value)}
                      placeholder="0109887766"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hotline Tiếp nhận & Đặt hẹn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0901 123 456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hotline Cứu hộ khẩn cấp 24/7 🚨
                    </label>
                    <input
                      type="text"
                      value={formData.rescueHotline}
                      onChange={(e) => handleInputChange('rescueHotline', e.target.value)}
                      placeholder="1900 6868 hoặc 0988 888 888"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email tiếp nhận thông tin / Hóa đơn
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="garage@autocare.vn"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ xưởng dịch vụ chi tiết <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Khẩu hiệu & Giới thiệu năng lực xưởng
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Mô tả các thế mạnh kỹ thuật, đội ngũ thợ lành nghề, trang thiết bị chuẩn quốc tế..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Dịch vụ mũi nhọn */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🛠️</span> Dịch vụ thế mạnh & Mũi nhọn của Gara
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bấm để chọn các chuyên môn mà xưởng của bạn cung cấp tốt nhất.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {POPULAR_SERVICES.map(srv => {
                    const isSelected = currentServicesList.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{srv}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomService(); } }}
                    placeholder="Nhập dịch vụ khác rồi nhấn Thêm (ví dụ: Phủ ceramic, Độ đèn LED...)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition"
                  >
                    + Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Branding / Logo / Media Preview */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎨</span> Nhận diện thương hiệu
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link Logo / Ảnh đại diện xưởng (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                    placeholder="https://.../logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-4xl border-2 border-indigo-500/30 mb-2">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      '🚗'
                    )}
                  </div>
                  <strong className="text-xs font-black text-slate-900 dark:text-white">
                    {formData.garageName || 'AutoCare Central Garage'}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Logo hiển thị trên phiếu tiếp nhận & ứng dụng khách hàng
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2 text-indigo-900 dark:text-indigo-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡</span> Mẹo xây dựng uy tín:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Cập nhật đầy đủ Mã số thuế và địa chỉ chính xác giúp Gara được hệ thống AutoCare gắn huy hiệu <strong>Đối tác xác thực 5 sao</strong> và ưu tiên xuất hiện khi khách hàng tìm kiếm quanh khu vực.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUBTAB 2: NĂNG LỰC & GIỜ HOẠT ĐỘNG                                     */}
        {/* ===================================================================== */}
        {currentSubTab === 'operations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>⚙️</span> Năng lực xưởng & Cầu nâng sửa chữa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cấu hình số lượng cầu nâng giúp hệ thống phân bổ lịch hẹn tự động không bị quá tải.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Số cầu nâng / Khoang dịch vụ
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.serviceCapacity}
                        onChange={(e) => handleInputChange('serviceCapacity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Khoang</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Khả năng làm việc đồng thời
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Thời lượng trung bình / Lượt
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={formData.slotDuration}
                        onChange={(e) => handleInputChange('slotDuration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="30">30 Phút</option>
                        <option value="45">45 Phút (Chuẩn)</option>
                        <option value="60">60 Phút (1 giờ)</option>
                        <option value="90">90 Phút</option>
                        <option value="120">120 Phút (2 giờ)</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Thời gian ước lượng bảo dưỡng
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Xe tối đa nhận mỗi khung giờ
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.maxParallelSlots}
                        onChange={(e) => handleInputChange('maxParallelSlots', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Xe/ca</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Tránh tình trạng dồn khách
                    </span>
                  </div>
                </div>
              </div>

              {/* Giờ mở cửa & Ngày hoạt động */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🕒</span> Lịch làm việc & Giờ mở cửa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Khung giờ nhận khách để chủ xe dễ dàng chọn thời gian phù hợp trên ứng dụng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giờ mở cửa - Đóng cửa hàng ngày
                    </label>
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      placeholder="Ví dụ: 07:30 - 18:30"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ngày hoạt động trong tuần
                    </label>
                    <input
                      type="text"
                      value={formData.openDays}
                      onChange={(e) => handleInputChange('openDays', e.target.value)}
                      placeholder="Ví dụ: Thứ 2 - Thứ 7 (Chủ Nhật nghỉ)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right col: Toggle switches */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚦</span> Trạng thái & Tính năng
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                        Nhận lịch hẹn Online
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Cho phép khách đặt lịch qua App
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                        Trực cứu hộ 24/7
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Hiển thị trên bản đồ cứu hộ khẩn
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.rescueHotline}
                        onChange={(e) => handleInputChange('rescueHotline', e.target.checked ? '1900 6868' : '')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUBTAB 3: TÀI KHOẢN & VIETQR                                          */}
        {/* ===================================================================== */}
        {currentSubTab === 'banking' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Form Fields */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏦</span> Thông tin tài khoản thụ hưởng & VietQR
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cấu hình tài khoản ngân hàng để hệ thống tự động sinh mã VietQR chuẩn Napas 247 cho khách quét thanh toán hóa đơn hoặc cọc dịch vụ.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {VIETNAM_BANKS.map(b => (
                        <option key={b.code} value={b.name}>
                          {b.name} ({b.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Số tài khoản ngân hàng (STK) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value.replace(/\s/g, ''))}
                      placeholder="Ví dụ: 998877665544"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-black tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên chủ tài khoản (In hoa không dấu) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountHolder}
                      onChange={(e) => handleInputChange('bankAccountHolder', e.target.value.toUpperCase())}
                      placeholder="CTY TNHH DICH VU AUTOCARE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live VietQR Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-b from-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-indigo-800/60 shadow-xl flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-between w-full border-b border-indigo-800/80 pb-3">
                  <span className="text-xs font-black tracking-widest text-indigo-300 uppercase">
                    VIETQR PRO • NAPAS 247
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    ⚡ Tự động khớp lệnh
                  </span>
                </div>

                {getVietQrUrl() ? (
                  <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-white/20 w-52 h-52 flex items-center justify-center">
                    <img
                      src={getVietQrUrl()}
                      alt="VietQR Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl w-52 h-52 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-3xl mb-2">💳</span>
                    <span className="text-xs text-slate-300 font-bold">
                      Nhập STK & Chủ TK để tạo mã QR trực tiếp
                    </span>
                  </div>
                )}

                <div className="space-y-1 w-full text-left bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <strong className="text-white">{formData.bankName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <strong className="text-cyan-300 font-mono tracking-wider">{formData.bankAccountNumber || '---'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <strong className="text-white uppercase">{formData.bankAccountHolder || formData.garageName || '---'}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                  Mã QR này sẽ được đính kèm trực tiếp trên Phiếu thanh toán & Hóa đơn điện tử gửi đến ứng dụng của khách hàng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUBTAB 4: BÁO GIÁ, VAT & MẪU IN                                       */}
        {/* ===================================================================== */}
        {currentSubTab === 'invoicing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🧾</span> Cấu hình Hóa đơn & Thuế suất VAT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thiết lập thuế suất mặc định và lời cảm ơn in ở chân hóa đơn xuất xưởng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Thuế suất GTGT (VAT) mặc định (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={formData.vatRate}
                        onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="0">0% (Không áp dụng VAT)</option>
                        <option value="8">8% (Thuế suất ưu đãi)</option>
                        <option value="10">10% (Thuế suất tiêu chuẩn)</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lời cảm ơn / Lời dặn in chân Hóa đơn
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceFooterNote}
                      onChange={(e) => handleInputChange('invoiceFooterNote', e.target.value)}
                      placeholder="AutoCare trân trọng cảm ơn Quý khách. Kính chúc Quý khách vạn dặm bình an!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Điều khoản & Chính sách bảo hành dịch vụ
                    </label>
                    <textarea
                      rows="3"
                      value={formData.warrantyTerms}
                      onChange={(e) => handleInputChange('warrantyTerms', e.target.value)}
                      placeholder="Bảo hành phụ tùng chính hãng 12 tháng hoặc 20.000km..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Template preview trigger */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📄</span> Mẫu in phiếu tiếp nhận
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Xem trước mẫu Phiếu tiếp nhận xe & Hóa đơn chuẩn in khổ A4/A5 khi bàn giao cho khách hàng.
                </p>

                <button
                  type="button"
                  onClick={() => setShowInvoicePreview(true)}
                  className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Xem trước mẫu Hóa đơn / Phiếu in</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUBTAB 5: BẢO MẬT & GIAO DIỆN                                         */}
        {/* ===================================================================== */}
        {currentSubTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Theme & System settings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💻</span> Giao diện & Hiển thị
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tùy chỉnh chế độ hiển thị phù hợp với môi trường làm việc trong xưởng.
                </p>
              </div>

              {/* Role Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Cấp quyền & Phân hệ
                  </span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    Chủ Gara Đối Tác (Role: Garage Partner)
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tài khoản: {user?.email || formData.email}
                  </span>
                </div>
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-xs">
                  🏬 Đối tác chính thức
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Chế độ hiển thị màu sắc
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: '☀️ Sáng' },
                    { id: 'dark', label: '🌙 Tối' },
                    { id: 'system', label: '💻 Hệ thống' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateThemePreference(m.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer capitalize ${
                        themePreference === m.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🔒</span> Đổi mật khẩu tài khoản Gara
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nên sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>

              {passwordFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <span>{passwordFeedback.type === 'success' ? '✨' : '⚠️'}</span>
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {passwordLoading ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu mới'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* PREVIEW MODAL FOR INVOICE / RECEIPT TEMPLATE                          */}
      {/* ===================================================================== */}
      {showInvoicePreview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                  MẪU XEM TRƯỚC PHIẾU DỊCH VỤ XUẤT XƯỞNG
                </span>
                <h3 className="text-lg font-black text-slate-900">{formData.garageName}</h3>
              </div>
              <button
                onClick={() => setShowInvoicePreview(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-dashed pb-3 text-slate-600">
                <div>
                  <p><strong>Hotline:</strong> {formData.phone}</p>
                  <p><strong>Địa chỉ:</strong> {formData.address}</p>
                  <p><strong>MST:</strong> {formData.taxCode || '---'}</p>
                </div>
                <div className="text-right">
                  <p><strong>Số phiếu:</strong> AC-{new Date().getFullYear()}-0088</p>
                  <p><strong>Ngày lập:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                  <p><strong>VAT:</strong> {formData.vatRate}%</p>
                </div>
              </div>

              {/* Sample item table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-[11px] font-bold text-slate-700">
                    <th className="py-2 px-2">Hạng mục dịch vụ / Phụ tùng</th>
                    <th className="py-2 px-2 text-center">SL</th>
                    <th className="py-2 px-2 text-right">Đơn giá</th>
                    <th className="py-2 px-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="py-2 px-2 font-medium">Thay dầu nhớt động cơ cao cấp 5W-30</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">650.000 đ</td>
                    <td className="py-2 px-2 text-right font-bold">650.000 đ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Thay lọc dầu chính hãng & Công kiểm tra gầm</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right">250.000 đ</td>
                    <td className="py-2 px-2 text-right font-bold">250.000 đ</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền dịch vụ:</span>
                  <span>900.000 đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tiền thuế VAT ({formData.vatRate}%):</span>
                  <span>{((900000 * formData.vatRate) / 100).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between font-black text-indigo-600 text-sm pt-1 border-t">
                  <span>Tổng thanh toán:</span>
                  <span>{(900000 + (900000 * formData.vatRate) / 100).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] space-y-1">
                <strong>🛡️ Điều khoản bảo hành:</strong>
                <p className="text-slate-600">{formData.warrantyTerms}</p>
              </div>

              <div className="text-center pt-2 italic text-slate-500 text-[11px]">
                "{formData.invoiceFooterNote}"
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInvoicePreview(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GarageSettingsTab;
