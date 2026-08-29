import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

const serviceSubItems = [
  { id: 'maintenance', label: 'Bảo dưỡng -Sửa chữa' },
  { id: 'care', label: 'Chăm sóc – Trang trí nội ngoại thất' },
  { id: 'paint', label: 'Làm đồng – Sơn màu – Dặm vá' },
];

const Header = ({ dashboardType = 'user', currentView, onOpenOcrScanner, onMenuClick }) => {
  const { user, logout, themePreference, updateThemePreference } = useAuth();
  const [activeMenu, setActiveMenu] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isGarage = dashboardType === 'garage' || user?.role === 'Garage';

  useEffect(() => {
    if (currentView) {
      setActiveMenu(currentView);
    }
  }, [currentView]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
    };
    if (isServicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let prevScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Shadow elevation state
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Smooth scroll direction detection:
      // Always keep header visible near top of page (0 - 80px)
      if (currentScrollY <= 80) {
        setIsVisible(true);
      } else if (currentScrollY > prevScrollY + 8) {
        // Scrolling DOWN -> slide header up out of view
        setIsVisible(false);
      } else if (currentScrollY < prevScrollY - 5) {
        // Scrolling UP -> slide header back down smoothly on top
        setIsVisible(true);
      }

      prevScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`w-full flex flex-col z-50 sticky top-0 transition-all duration-300 ${
        isScrolled
          ? 'shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md'
          : 'shadow-xs bg-white dark:bg-slate-900'
      }`}
    >
      {/* 1. TOP ANNOUNCEMENT BAR (Hidden on mobile for sleek space-saving header) */}
      <div className={`hidden md:block bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-semibold px-6 sm:px-10 lg:px-16 transition-all duration-300 overflow-hidden ${
        isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-10 py-2'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-indigo-100 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM
            </span>
            <span className="text-indigo-300">|</span>
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

      {/* 2. MAIN BRANDING & USER CONTROLS BAR */}
      <div className={`relative z-[100] bg-white dark:bg-slate-800 backdrop-blur-md px-4 sm:px-6 md:px-12 transition-all duration-300 border-b border-slate-100 dark:border-slate-700/60 ${
        isScrolled
          ? 'py-2.5 sm:py-3'
          : 'py-3 sm:py-5'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 md:gap-12">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2 h-9 md:h-10">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md border border-indigo-500 shrink-0">
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11l2-5h12l2 5M4 11h16M4 11v6h16v-6" />
              </svg>
            </div>
            <h1 className="text-[11px] md:text-xs font-bold tracking-tight text-slate-900 dark:text-white leading-none m-0 flex items-center h-9 md:h-10">
              {isGarage ? (
                <>ACOH <span className="text-indigo-600 dark:text-indigo-400">Garage</span></>
              ) : (
                <>ACOH <span className="text-indigo-600 dark:text-indigo-400">AutoCare</span></>
              )}
            </h1>
          </div>

          {/* Right Info: Working Hours, Hotline (Desktop) & User Controls */}
          <div className="flex items-center gap-10 lg:gap-16">
            {/* Working Hours (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center text-left h-9 md:h-10">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">Giờ làm việc:</span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight">Thứ 2 - thứ 6 (9h - 18h)</span>
            </div>

            {/* Hotline (Desktop Only) */}
            <div className="hidden md:flex flex-col justify-center text-left h-9 md:h-10">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">Gọi ngay:</span>
              <a href="tel:0313728397" className="font-bold text-xs sm:text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 leading-tight transition">
                (+84) 313-728-397
              </a>
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-4 sm:gap-5">

              {/* Garage special action: OCR Scan (Desktop) */}
              {isGarage && onOpenOcrScanner && (
                <button
                  onClick={onOpenOcrScanner}
                  className="hidden sm:flex px-3.5 h-9 md:h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md border border-indigo-500 hover:shadow-lg transition cursor-pointer items-center gap-1.5 animate-pulse"
                  title="Nhận diện biển số xe bằng AI (OCR)"
                >
                  📸 <span>Scan Biển số</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const nextTheme = themePreference === 'light' ? 'dark' : themePreference === 'dark' ? 'system' : 'light';
                  updateThemePreference(nextTheme);
                }}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 text-sm"
                title={`Giao diện: ${themePreference === 'light' ? 'Sáng' : themePreference === 'dark' ? 'Tối' : 'Hệ thống'}. Nhấn để đổi.`}
              >
                {themePreference === 'light' ? '☀️' : themePreference === 'dark' ? '🌙' : '💻'}
              </button>

              {/* User Avatar (Desktop & Tablet) */}
              <div className="hidden sm:flex items-center gap-2 h-9 md:h-10">
                <a
                  href="/profile"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-600 hover:shadow-xs transition shrink-0 text-xs sm:text-sm"
                  title="Hồ sơ cá nhân"
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </a>
                <div className="hidden xl:flex flex-col justify-center text-left h-9 md:h-10">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{user?.fullName}</span>
                  <span className="text-xxs text-slate-400 dark:text-slate-500 font-semibold leading-tight">{user?.role || 'Người dùng'}</span>
                </div>
              </div>

              {/* Logout Button (Desktop) */}
              <button
                onClick={logout}
                className="hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-full items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-950/40 transition shrink-0"
                title="Đăng xuất"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center border border-slate-800 dark:border-slate-700 shadow-sm transition active:scale-95 cursor-pointer ml-1"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DESKTOP BOTTOM NAVIGATION BAR */}
      <nav className="relative z-0 hidden md:block bg-slate-900 text-white border-t border-slate-800/60 shadow-md px-6 sm:px-10 lg:px-16 py-2.5">
        <div className="max-w-7xl mx-auto min-h-[40px] flex justify-center items-center relative">
          {isSearchOpen ? (
            /* Full-width sleek search mode */
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
              <div className="flex items-center justify-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-bold tracking-wider uppercase whitespace-nowrap no-scrollbar">
                {[
                  { id: 'home', label: 'TRANG CHỦ' },
                  ...(!isGarage ? [{ id: 'vehicles', label: 'DANH SÁCH XE' }] : []),
                  { id: 'about', label: 'GIỚI THIỆU' },
                  { id: 'services', label: 'DỊCH VỤ' },
                  { id: 'news', label: 'TIN TỨC' },
                  { id: 'contact', label: 'LIÊN HỆ' },
                ].map((menu) => {
                  const isActive = activeMenu === menu.id;

                  if (menu.id === 'services') {
                    return (
                      <div key={menu.id} className="relative inline-block" ref={dropdownRef}>
                        <button
                          onClick={() => {
                            setIsServicesDropdownOpen((prev) => !prev);
                            setActiveMenu('services');
                            if (onMenuClick) {
                              onMenuClick('services');
                            }
                          }}
                          className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                            isActive || isServicesDropdownOpen
                              ? 'text-indigo-400 font-black tracking-wide'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold'
                          }`}
                        >
                          <span>DỊCH VỤ</span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isServicesDropdownOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                          {isActive && (
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-950 shadow-md"></span>
                          )}
                        </button>

                        {/* Dropdown Popover */}
                        {isServicesDropdownOpen && (
                          <div className="absolute top-full mt-3.5 left-1/2 -translate-x-1/2 w-72 sm:w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-2.5 z-50 animate-fadeIn">
                            {/* Top Pointer Triangle Arrow */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-900 rotate-45 border-t border-l border-slate-700"></div>

                            <div className="relative z-10 flex flex-col space-y-1">
                              {serviceSubItems.map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => {
                                    setIsServicesDropdownOpen(false);
                                    setActiveMenu('services');
                                    if (onMenuClick) {
                                      onMenuClick('services', subItem.id);
                                    }
                                    const el = document.getElementById('services');
                                    if (el) {
                                      el.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-100 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors duration-150 flex items-center justify-between cursor-pointer border-b border-slate-800/80 last:border-b-0"
                                >
                                  <span>{subItem.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={menu.id}
                      onClick={() => {
                        setActiveMenu(menu.id);
                        if (onMenuClick) {
                          onMenuClick(menu.id);
                        }
                        if (menu.id === 'home') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          const el = document.getElementById(menu.id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      }}
                      className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'text-indigo-400 font-black tracking-wide'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-bold'
                      }`}
                    >
                      <span>{menu.label}</span>
                      {isActive && (
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-md"></span>
                      )}
                    </button>
                  );
                })}
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

      {/* 4. MOBILE SLIDE-OVER DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-slate-900/95 text-white backdrop-blur-xl animate-fadeIn overflow-y-auto">
          {/* Mobile Drawer Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM4 11l2-5h12l2 5M4 11h16M4 11v6h16v-6" />
                </svg>
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                ACOH <span className="text-indigo-400">{isGarage ? 'Garage' : 'AutoCare'}</span>
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search bar inside mobile drawer */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center bg-slate-900 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <svg className="w-4 h-4 text-indigo-400 mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dịch vụ, bảo dưỡng, xe..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Nav Links */}
          <div className="p-4 flex flex-col space-y-1.5">
            {[
              { id: 'home', label: 'TRANG CHỦ', icon: '🏠' },
              ...(!isGarage ? [{ id: 'vehicles', label: 'DANH SÁCH XE', icon: '🚗' }] : []),
              { id: 'about', label: 'GIỚI THIỆU', icon: 'ℹ️' },
              { id: 'services', label: 'DỊCH VỤ', icon: '🛠️' },
              { id: 'news', label: 'TIN TỨC', icon: '📰' },
              { id: 'contact', label: 'LIÊN HỆ', icon: '📞' },
            ].map((menu) => {
              if (menu.id === 'services') {
                return (
                  <div key={menu.id} className="flex flex-col space-y-1">
                    <button
                      onClick={() => {
                        setIsMobileServicesOpen(!isMobileServicesOpen);
                        setActiveMenu('services');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition text-left ${
                        activeMenu === 'services'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{menu.icon}</span>
                        <span>{menu.label}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isMobileServicesOpen && (
                      <div className="pl-6 space-y-1 py-1">
                        {serviceSubItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveMenu('services');
                              setIsMobileMenuOpen(false);
                              if (onMenuClick) {
                                onMenuClick('services', subItem.id);
                              }
                              const el = document.getElementById('services');
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition flex items-center gap-2"
                          >
                            <span className="text-indigo-400">•</span>
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveMenu(menu.id);
                    setIsMobileMenuOpen(false);
                    if (onMenuClick) {
                      onMenuClick(menu.id);
                    }
                    if (menu.id === 'home') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      const el = document.getElementById(menu.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition text-left ${
                    activeMenu === menu.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span className="text-base">{menu.icon}</span>
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </div>

          {/* Garage OCR Scanner Button for Mobile */}
          {isGarage && onOpenOcrScanner && (
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  onOpenOcrScanner();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📸</span>
                <span>Scan Biển số xe AI (OCR)</span>
              </button>
            </div>
          )}

          {/* User Account Section */}
          <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <a
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-black border border-slate-700"
                >
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </a>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">{user?.fullName || 'Người dùng'}</span>
                  <span className="text-xs text-slate-400 font-medium">{user?.role || 'User'}</span>
                </div>
              </div>
              <a
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Hồ sơ →
              </a>
            </div>

            <div className="text-xs text-slate-400 space-y-1 mb-4 pt-2 border-t border-slate-800/80">
              <p>📍 1073/23 CMT8, P.7, Q.Tân Bình, TP.HCM</p>
              <p>📞 Hotline: (+84) 313-728-397</p>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Permanent Sticky 2px Purple Accent Line attached to Header */}
      <div className="w-full h-[2px] bg-indigo-600 shrink-0 z-50"></div>
    </header>
  );
};

export default Header;

