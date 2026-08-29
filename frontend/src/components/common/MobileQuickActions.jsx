const MobileQuickActions = ({
  onOpenServices,
  onOpenAppointments,
  onOpenNews,
  onOpenExpert,
}) => {
  const actions = [
    {
      id: 'services',
      label: 'Dịch vụ',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40 hover:bg-orange-100',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: onOpenServices,
    },
    {
      id: 'appointments',
      label: 'Lịch hẹn',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40 hover:bg-purple-100',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: onOpenAppointments,
    },
    {
      id: 'news',
      label: 'Tin tức',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40 hover:bg-sky-100',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      onClick: onOpenNews,
    },
    {
      id: 'expert',
      label: 'Chuyên gia',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/40 hover:bg-teal-100',
      icon: (
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: onOpenExpert,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 py-4 max-w-7xl mx-auto">
      {/* 4 Functional Action Buttons Grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-6 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-700/80">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={act.onClick}
            className="flex flex-col items-center justify-center gap-2 group cursor-pointer transition-transform duration-200 active:scale-95"
          >
            <div
              className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${act.bgColor}`}
            >
              {act.icon}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-750 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-center leading-tight">
              {act.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileQuickActions;
