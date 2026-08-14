import { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import aboutBannerBg from '../../assets/about_banner_bg.png';

const ContactPageSection = () => {
  const { toast } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Email, Số điện thoại).');
      return;
    }
    
    setSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      toast.success('Gửi lời nhắn liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        message: '',
      });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <section className="bg-white dark:bg-slate-900 transition-colors pb-16">
      
      {/* Top Banner */}
      <div
        className="relative w-full h-56 sm:h-64 md:h-72 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${aboutBannerBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black !text-white tracking-widest uppercase">
            Liên Hệ
          </h2>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm font-semibold tracking-wide">
            <a href="/user/dashboard" className="!text-zinc-300 hover:!text-white transition">
              TRANG CHỦ
            </a>
            <span className="!text-zinc-500">/</span>
            <span className="!text-indigo-400">LIÊN HỆ</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-indigo-600 dark:text-indigo-400 font-extrabold text-lg sm:text-xl tracking-wider uppercase leading-tight">
              CÔNG TY TNHH ACOH AUTOCARE
            </h3>
            
            <ul className="space-y-5 text-sm text-slate-650 dark:text-slate-350 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 shrink-0 text-base">📍</span>
                <span className="leading-relaxed">1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM</span>
              </li>
              
              <li className="flex items-center gap-3">
                <span className="text-rose-500 shrink-0 text-base">📞</span>
                <a href="tel:0313728397" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  (+84) 313-728-397
                </a>
              </li>
              
              <li className="flex items-center gap-3">
                <span className="text-rose-500 shrink-0 text-base">✉️</span>
                <a href="mailto:info@themona.global" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  info@themona.global
                </a>
              </li>
              
              <li className="flex items-center gap-3">
                <span className="text-rose-500 shrink-0 text-base">🌐</span>
                <a href="https://www.mona.media" target="_blank" rel="noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  www.mona.media
                </a>
              </li>
              
              <li className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                <span className="text-indigo-500 shrink-0 text-base">🕒</span>
                <div className="leading-relaxed">
                  <strong className="text-slate-850 dark:text-white block mb-0.5">Thời gian làm việc:</strong>
                  Thứ 2 – Thứ 6 (9h – 18h)
                </div>
              </li>
            </ul>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/20 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    name="name"
                    placeholder="Họ và tên"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-1">
                <textarea
                  name="message"
                  placeholder="Lời nhắn"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-450 text-white font-extrabold text-xs sm:text-sm px-10 py-3.5 rounded-xl shadow-md hover:shadow-lg transition uppercase tracking-wider shrink-0 cursor-pointer min-w-[150px] text-center"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Google Maps Location */}
        <div className="mt-14 sm:mt-18 rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 transition-all duration-300">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2246476100913!2d106.65215037571343!3d10.79410315886532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293409a25b3d%3A0x6b772b781a7bb505!2zMTA3My8yMyBDw6FjaCBN4bqhbmcgVGjDoW5nIFTDoW0sIFBoxrDhu51uZyA3LCBUw6JuIELDrG5oLCBI4buTIENow60gTWluaCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1786718911000!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="ACOH AutoCare Google Map Location"
            className="w-full h-[320px] sm:h-[400px] opacity-90 dark:opacity-80 dark:invert transition-all duration-300"
          ></iframe>
        </div>
      </div>

    </section>
  );
};

export default ContactPageSection;
