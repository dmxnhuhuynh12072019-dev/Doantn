import newsDrivingTips from '../../assets/news_driving_tips.png';
import newsLandCruiser from '../../assets/news_land_cruiser.png';
import newsUsedCar from '../../assets/news_used_car.png';
import newsSmallCars from '../../assets/news_small_cars.png';

const newsList = [
  {
    id: 1,
    title: 'Những mẹo lái ô tô an toàn cơ bản',
    snippet: 'Sắp xếp thời gian, không phân tâm, sử dụng GPS, là những thói quen cũng như kỹ năng cơ bản hàng đầu giúp bạn và gia đình luôn được an toàn trên mọi nẻo đường.',
    image: newsDrivingTips,
  },
  {
    id: 2,
    title: 'Thử nghiệm và đánh giá Toyota Land Cruiser 2018',
    snippet: 'Toyota Land Cruiser 2018 có khả năng off-road tốt và độ tin cậy cao trong phân khúc xe SUV cỡ lớn tại thị trường thế giới nói chung và Việt Nam nói riêng.',
    image: newsLandCruiser,
  },
  {
    id: 3,
    title: 'Những điều cần lưu ý khi mua xe đã qua sử dụng',
    snippet: 'Việc mua lại ô tô cũ để tiết kiệm chi phí không còn quá xa lạ đối với người tiêu dùng hiện nay. Tuy nhiên, để chọn được chiếc xe tốt bạn cần trang bị kỹ năng...',
    image: newsUsedCar,
  },
  {
    id: 4,
    title: 'Những mẫu xe cỡ nhỏ mới đáng mua nhất 2019',
    snippet: 'Ford Focus, Mazda 3, Honda Civic và Chevrolet Bolt phiên bản 2018 đều nằm trong danh sách những dòng xe hatchback/sedan đô thị nhỏ gọn, tiết kiệm nhiên liệu...',
    image: newsSmallCars,
  },
];

const NewsSection = () => {
  return (
    <section id="news" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800 transition-colors scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase relative inline-block">
            Tin Tức
            <span className="block w-12 h-1 bg-indigo-600 dark:bg-indigo-500 mx-auto mt-2.5 rounded-full"></span>
          </h2>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newsList.map((news) => (
            <article
              key={news.id}
              className="group flex flex-col bg-white dark:bg-slate-850 rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-150/60 dark:border-slate-750/70 transition-all duration-300 cursor-pointer"
            >
              {/* Image Header */}
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="text-slate-850 dark:text-white font-extrabold text-sm leading-snug tracking-wide uppercase transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {news.snippet}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xxs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Xem thêm →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
