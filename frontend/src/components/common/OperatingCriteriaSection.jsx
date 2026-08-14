const criteria = [
  {
    id: 1,
    title: 'Không để khách hàng đợi lâu',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-transform duration-500 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Ưu tiên sửa chữa, hạn chế thay thế',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-transform duration-750 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Đặt hẹn online',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-transform duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Cam kết đúng giá',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-transform duration-500 group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Đội ngũ thợ hơn 10 năm kinh nghiệm',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-all duration-500 group-hover:scale-105 group-hover:rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Bảo hành lâu dài',
    icon: (
      <svg className="w-14 h-14 text-indigo-600 dark:text-indigo-400 mx-auto transition-transform duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const OperatingCriteriaSection = () => {
  return (
    <section className="py-16 bg-slate-100/70 dark:bg-slate-800/20 border-t border-b border-slate-200/50 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase relative inline-block">
            Tiêu Chí Hoạt Động
            <span className="block w-12 h-1 bg-indigo-600 dark:bg-indigo-500 mx-auto mt-2.5 rounded-full"></span>
          </h2>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 md:gap-x-12 max-w-5xl mx-auto">
          {criteria.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center text-center p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-850 hover:shadow-md transition-all duration-300 cursor-default"
            >
              {/* Icon Container */}
              <div className="mb-4 flex items-center justify-center h-16">
                {item.icon}
              </div>
              {/* Text */}
              <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white tracking-wide transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperatingCriteriaSection;
