import { useAuth } from '../../context/AuthContext';

const MobileGreetingCard = () => {
  const { user } = useAuth();

  // Dynamic time-of-day greeting (Sáng, Trưa, Chiều, Tối)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Chào buổi sáng,';
    if (hour >= 11 && hour < 14) return 'Chào buổi trưa,';
    if (hour >= 14 && hour < 18) return 'Chào buổi chiều,';
    return 'Chào buổi tối,';
  };

  const displayName = user?.fullName || user?.username || 'Huỳnh Võ Hoài Như';
  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isAdmin = userRole === 'admin';
  const isGarage = userRole === 'garage';

  return (
    <div className="w-full px-4 sm:px-6 pt-3 pb-2 max-w-7xl mx-auto">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3 transition-all">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-200 dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-base shadow-xs shrink-0 border border-indigo-100/80 dark:border-indigo-800/40">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <svg className="w-6 h-6 fill-current text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block leading-tight">
              {getGreeting()}
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate leading-snug">
              {displayName}
            </h2>
          </div>
        </div>

        {/* Quick Badge / Role Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] sm:text-xs">
            {isAdmin ? 'Super Admin' : isGarage ? 'Gara Partner' : 'Khách hàng'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileGreetingCard;
