import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const Header = ({ dashboardType = 'user', onOpenOcrScanner }) => {
  const { user, logout, themePreference, updateThemePreference } = useAuth();
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const isGarage = dashboardType === 'garage' || user?.role === 'Garage';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full flex flex-col z-40 sticky top-0 shadow-md transition-all duration-300 ease-in-out">
      {/* 1. TOP ANNOUNCEMENT BAR (Hidden when scrolled down) */}
      <div
        className={`bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-semibold px-4 sm:px-6 transition-all duration-300 ease-in-out overflow-hidden ${
          isScrolled ? 'max-h-0 opacity-0 py-0 border-none' : 'max-h-24 opacity-100 py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
            <span className="flex items-center gap-1.5 hover:text-indigo-100 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM
            </span>
            <span className="hidden md:inline text-indigo-300">|</span>
            <a href="mailto:info@acoh.com" className="flex items-center gap-1.5 hover:text-indigo-100 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Info@themona.global
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-indigo-200 transition" title="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-indigo-200 transition" title="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-indigo-200 transition" title="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BRANDING & CONTACT / USER ACTIONS BAR (Hidden when scrolled down) */}
      <div
        className={`bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 transition-all duration-300 ease-in-out overflow-hidden ${
          isScrolled ? 'max-h-0 opacity-0 py-0 border-none' : 'max-h-96 opacity-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md border border-indigo-500 shrink-0">
              <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11l2-5h12l2 5M4 11h16M4 11v6h16v-6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                {isGarage ? (
                  <>ACOH <span className="text-indigo-600 dark:text-indigo-400">Garage</span></>
                ) : (
                  <>ACOH <span className="text-indigo-600 dark:text-indigo-400">AutoCare</span></>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isGarage ? 'Hệ thống quản lý Gara đối tác chuyên nghiệp' : 'AutoCare Office Helper - Quản lý & Bảo dưỡng xe'}
              </p>
            </div>
          </div>

          {/* Right Info: Working Hours, Hotline, and User Controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs sm:text-sm">
            {/* Giờ làm việc */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">Giờ làm việc:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Thứ 2 - thứ 6 (9h - 18h)</span>
            </div>

            {/* Gọi ngay Hotline */}
            <div className="hidden sm:flex flex-col text-right pr-2 border-r border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">Gọi ngay:</span>
              <a href="tel:0313728397" className="font-black text-base text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition">
                (+84) 313-728-397
              </a>
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              {/* Garage special action: OCR Scan */}
              {isGarage && onOpenOcrScanner && (
                <button
                  onClick={onOpenOcrScanner}
                  className="px-3.5 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md border border-indigo-500 hover:shadow-lg transition cursor-pointer flex items-center gap-1.5 animate-pulse"
                  title="Nhận diện biển số xe bằng AI (OCR)"
                >
                  📸 <span className="hidden sm:inline">Scan Biển số</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const nextTheme = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'system' : 'light';
                  updateThemePreference(nextTheme);
                }}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
                title={`Giao diện: ${themePreference === 'light' ? 'Sáng' : themePreference === 'dark' ? 'Tối' : 'Hệ thống'}. Nhấn để đổi.`}
              >
                {themePreference === 'light' ? '☀️' : themePreference === 'dark' ? '🌙' : '💻'}
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <a
                  href="/profile"
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black border border-slate-200 dark:border-slate-600 hover:shadow-xs transition shrink-0"
                  title="Hồ sơ cá nhân"
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </a>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.fullName}</span>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-semibold">{user?.role || 'Người dùng'}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-10 h-10 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-950/40 transition shrink-0"
                title="Đăng xuất"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION BAR (ONLY THIS REMAINS VISIBLE WHEN SCROLLED DOWN) */}
      <nav className="bg-slate-950 dark:bg-slate-900 text-white border-b border-slate-800 shadow-md px-4 sm:px-6 py-2.5 transition-all duration-300">
        <div className="max-w-7xl mx-auto min-h-[40px] flex justify-center items-center relative">
          {isSearchOpen ? (
            /* Full-width sleek search mode (No text overlap) */
            <div className="w-full flex items-center justify-between gap-3 px-2 animate-fadeIn">
              <div className="flex-1 flex items-center bg-slate-900 border border-indigo-500/60 rounded-xl px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-inner">
                <svg className="w-4 h-4 text-indigo-400 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm dịch vụ, bảo dưỡng, gara, xe..."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white mr-2 text-xs font-semibold">
                    Xóa
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 border border-slate-800"
                title="Đóng tìm kiếm (Esc)"
              >
                <span>Đóng</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            /* Standard Centered Navigation Links */
            <>
              <div className="flex items-center justify-center space-x-1 sm:space-x-8 overflow-x-auto text-xs sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap px-8">
                <button
                  onClick={() => setActiveMenu('home')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activeMenu === 'home'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-black shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  TRANG CHỦ
                </button>
                <button
                  onClick={() => setActiveMenu('about')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activeMenu === 'about'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-black shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  GIỚI THIỆU
                </button>
                <button
                  onClick={() => setActiveMenu('services')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activeMenu === 'services'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-black shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  DỊCH VỤ ▾
                </button>
                <button
                  onClick={() => setActiveMenu('news')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activeMenu === 'news'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-black shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  TIN TỨC
                </button>
                <button
                  onClick={() => setActiveMenu('contact')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    activeMenu === 'contact'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-black shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  LIÊN HỆ
                </button>
              </div>

              {/* Right Search Toggle Button */}
              <div className="absolute right-0 flex items-center">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Mở tìm kiếm"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
