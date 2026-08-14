import carWashImg from '../../assets/car_wash.png';
import carBodyPaintImg from '../../assets/car_body_paint.png';
import carRepairImg from '../../assets/car_repair.png';
import carInsuranceImg from '../../assets/car_insurance.png';

const services = [
  {
    id: 1,
    title: 'Dịch vụ rửa xe hơi ô tô',
    image: carWashImg,
  },
  {
    id: 2,
    title: 'Dịch vụ đồng sơn',
    image: carBodyPaintImg,
  },
  {
    id: 3,
    title: 'Bảo dưỡng, sửa chữa xe ô tô',
    image: carRepairImg,
  },
  {
    id: 4,
    title: 'Bảo hiểm Ôtô',
    image: carInsuranceImg,
  },
];

const NewServicesSection = ({ onOpenAppointment }) => {
  return (
    <section id="services" className="py-12 bg-slate-50 dark:bg-slate-900 transition-colors scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase relative inline-block">
            Dịch Vụ Mới
            <span className="block w-12 h-1 bg-indigo-600 dark:bg-indigo-500 mx-auto mt-2.5 rounded-full"></span>
          </h2>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => onOpenAppointment && onOpenAppointment(service.title)}
              className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 aspect-square sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3] cursor-pointer bg-slate-200 dark:bg-slate-800"
            >
              {/* Image */}
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Dark Overlay with transition */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Title Text */}
              <div className="absolute inset-0 flex flex-col justify-end items-center p-6 text-center">
                <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wide uppercase transition-transform duration-500 group-hover:-translate-y-1.5 leading-snug drop-shadow-md">
                  {service.title}
                </h3>
                {/* Underline decoration */}
                <span className="block w-10 h-[2px] bg-white/70 mt-3 transition-all duration-500 group-hover:w-20 group-hover:bg-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewServicesSection;
