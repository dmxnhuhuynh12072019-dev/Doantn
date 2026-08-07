import { useState, useEffect } from 'react';
import * as paymentService from '../../services/paymentService';

const PaymentCheckoutModal = ({
  isOpen,
  onClose,
  appointmentId = null,
  defaultAmount = 100000,
  garageName = 'Gara đối tác ACOH',
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [amount, setAmount] = useState(defaultAmount);
  const [orderInfo, setOrderInfo] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(defaultAmount);
      setOrderInfo(`Dat coc giu cho lich hen #${appointmentId || 'MOI'}`);
      setPaidSuccess(false);
      setError('');
      setPaymentData(null);
      initPayment('VNPAY', defaultAmount);
    }
  }, [isOpen, appointmentId, defaultAmount]);

  const initPayment = async (method, payAmount) => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.createPaymentUrl({
        appointmentId: appointmentId || undefined,
        amount: payAmount,
        paymentMethod: method,
        orderInfo: orderInfo || `Thanh toan coc lich hen #${appointmentId || 'ACOH'}`,
      });
      setPaymentData(res);
    } catch (err) {
      setError(err.message || 'Không thể khởi tạo cổng thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (newMethod) => {
    setPaymentMethod(newMethod);
    initPayment(newMethod, amount);
  };

  const handleSimulateSuccess = async () => {
    if (!paymentData || !paymentData.paymentId) return;
    setSimulating(true);
    setError('');
    try {
      await paymentService.simulateSandboxSuccess(paymentData.paymentId);
      setPaidSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      setError(err.message || 'Giả lập thanh toán thất bại.');
    } finally {
      setSimulating(false);
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('vi-VN').format(amt || 0) + ' đ';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xl shadow-xs">
              💳
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white">
                Thanh toán & Đặt cọc giữ chỗ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tích hợp cổng VNPAY QR, Ví MoMo & ZaloPay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {paidSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-md">
              ✓
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-850 dark:text-white">
                Thanh toán thành công!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Giao dịch số tiền <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(amount)}</strong> đã được xác nhận.
              </p>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">
                Trạng thái lịch hẹn tại {garageName} đã chuyển sang <span className="text-amber-600 font-bold">Đã cọc</span>.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Thông tin đơn hàng */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xxs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Đơn vị thụ hưởng:
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white block truncate max-w-[220px]">
                  {garageName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xxs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Số tiền cọc:
                </span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>

            {/* Phương thức thanh toán Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Chọn cổng thanh toán:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleMethodChange('VNPAY')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border flex flex-col items-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'VNPAY'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">🏦</span>
                  VNPAY
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('MoMo')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border flex flex-col items-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'MoMo'
                      ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-700 dark:text-pink-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">👛</span>
                  Ví MoMo
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('ZaloPay')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border flex flex-col items-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'ZaloPay'
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">⚡</span>
                  ZaloPay
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodChange('Cash')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border flex flex-col items-center gap-1 transition cursor-pointer ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">💵</span>
                  Tiền mặt
                </button>
              </div>
            </div>

            {/* QR Code / Payment Action Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-3 relative overflow-hidden">
              {loading ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-300">Đang khởi tạo mã QR thanh toán...</span>
                </div>
              ) : paymentMethod === 'Cash' ? (
                <div className="py-4 space-y-2">
                  <span className="text-3xl block">💵</span>
                  <p className="text-sm font-bold text-emerald-400">Thanh toán tiền mặt trực tiếp tại Gara</p>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Bạn có thể thanh toán khoản phí/tiền cọc này trực tiếp bằng tiền mặt khi mang xe đến làm dịch vụ.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative inline-block bg-white p-3 rounded-2xl shadow-lg border border-slate-700">
                    <img
                      src={paymentData?.qrCodeUrl || 'https://img.vietqr.io/image/MB-ACOH2026-compact2.png?amount=100000'}
                      alt="Payment QR Code"
                      className="w-44 h-44 object-contain mx-auto rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Quét mã QR bằng App Ngân hàng hoặc Ví điện tử ({paymentMethod})
                    </p>
                    {paymentData?.txnRef && (
                      <p className="text-xxs font-mono text-indigo-300">
                        Nội dung CK: <strong className="bg-slate-800 px-2 py-0.5 rounded text-white">{paymentData.txnRef}</strong>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {paymentData?.paymentUrl && paymentMethod === 'VNPAY' && (
                <a
                  href={paymentData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  🌐 Mở cổng thanh toán VNPAY Sandbox (Trang ngoài)
                </a>
              )}

              {paymentMethod !== 'Cash' && paymentData?.paymentId && (
                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  disabled={simulating}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {simulating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  ⚡ Giả lập thanh toán thành công (Sandbox 1-Click Test)
                </button>
              )}

              {paymentMethod === 'Cash' && (
                <button
                  type="button"
                  onClick={() => {
                    setPaidSuccess(true);
                    if (onPaymentSuccess) onPaymentSuccess();
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Xác nhận đặt hẹn với tùy chọn Tiền mặt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCheckoutModal;
