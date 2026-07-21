import { useState, useEffect } from 'react';
import { createReview } from '../../services/extensionService';

const ReviewModal = ({ isOpen, onClose, garageId, garageName, onSaveSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createReview(garageId, { rating, comment });
      alert('Cảm ơn bạn đã gửi đánh giá cho Gara!');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-700 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">⭐ Đánh giá dịch vụ Gara</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition text-slate-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider mb-1">Gara đối tác</span>
            <strong className="text-sm text-slate-750 dark:text-slate-200">{garageName}</strong>
          </div>

          {/* Star selector */}
          <div className="text-center py-2 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-750">
            <span className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider mb-2">Chấm điểm sao</span>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition duration-150 transform hover:scale-110 focus:outline-none"
                >
                  <span
                    className={
                      star <= (hoverRating || rating)
                        ? 'text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <span className="text-xs text-amber-500 dark:text-amber-400 font-bold mt-1.5 block">
              {rating === 1 ? 'Quá tệ 😡' :
               rating === 2 ? 'Kém 😞' :
               rating === 3 ? 'Bình thường 😐' :
               rating === 4 ? 'Tốt 🙂' :
               'Rất hài lòng! 😍'}
            </span>
          </div>

          {/* Comment input */}
          <div className="space-y-1">
            <label className="text-xxs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Ý kiến phản hồi (Tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về dịch vụ bảo dưỡng, thái độ nhân viên và giá cả..."
              rows={4}
              maxLength={500}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-semibold">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition disabled:bg-slate-350"
            >
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
