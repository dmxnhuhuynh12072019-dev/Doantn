import { useState, useEffect, useRef } from 'react';
import { getInvoiceData } from '../../services/extensionService';

const InvoicePreviewModal = ({ isOpen, onClose, appointmentId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printAreaRef = useRef(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchInvoice();
    }
  }, [isOpen, appointmentId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInvoiceData(appointmentId);
      setInvoice(data);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết hóa đơn bảo dưỡng');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Hóa đơn dịch vụ & Phiếu bảo dưỡng
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Xem trước bản in hóa đơn theo mẫu chuẩn garage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>In hóa đơn / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer text-lg font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Printable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950">
          
          {loading ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Đang chuẩn bị hóa đơn thanh toán...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold text-center">
              ⚠️ {error}
            </div>
          ) : invoice && (
            /* --- INVOICE PAPER (Matching Sample Image Exactly) --- */
            <div
              ref={printAreaRef}
              className="bg-white text-slate-900 p-8 sm:p-10 shadow-lg rounded-xl max-w-3xl mx-auto border border-slate-200 text-[13px] leading-snug font-serif print:shadow-none print:border-none print:p-0 print:m-0"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* 1. Brand Logo Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans leading-none text-black">
                    {invoice.garage.name || 'AUTO HUẤN ĐẶNG'}
                  </h1>
                  <div className="text-[12px] text-slate-800 mt-1.5 space-y-0.5 font-sans">
                    <p>Điện thoại: <strong>{invoice.garage.phone || '0945 561 535 – 0989 416 086'}</strong></p>
                    <p>E-Mail: <span className="text-blue-700 underline">{invoice.garage.email || 'dnghuan@gmail.com'}</span></p>
                    <p>Địa chỉ: {invoice.garage.address || 'Tứ Dân – Khoái Châu – Hưng Yên'}</p>
                  </div>
                </div>

                {/* Car Silhouette Logo */}
                <div className="text-4xl text-right select-none pt-1">
                  🏎️
                </div>
              </div>

              {/* Dividing Line */}
              <div className="border-t-[1.5px] border-black my-2.5"></div>

              {/* Invoice Title */}
              <div className="text-center py-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase font-sans tracking-wide text-black">
                  HÓA ĐƠN SỬA CHỮA - BẢO DƯỠNG
                </h2>
              </div>

              {/* Invoice Number & Date Meta */}
              <div className="flex flex-col sm:flex-row justify-between text-xs font-bold font-sans mb-3 gap-1">
                <div>
                  Số hóa đơn: <span className="font-normal">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex gap-4">
                  <span>Ngày tiếp nhận xe: <span className="font-normal">{invoice.dates.receivedDate}</span></span>
                  <span>Ngày giao xe: <span className="font-normal">{invoice.dates.deliveryDate}</span></span>
                </div>
              </div>

              {/* Section 1 Banner: Thông tin khách hàng, thông tin xe */}
              <div className="bg-[#d9d9d9] font-bold italic px-2.5 py-1 text-xs text-black border border-slate-400 mb-1.5 font-sans">
                Thông tin khách hàng, thông tin xe
              </div>

              {/* Table 1: Customer & Vehicle Info */}
              <table className="w-full border-collapse border border-black text-xs mb-3 font-sans">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-1/4 p-1.5 font-bold border-r border-black">Thông tin khách hàng</td>
                    <td className="w-1/4 p-1.5 font-bold border-r border-black">{invoice.customer.name}</td>
                    <td className="w-1/4 p-1.5 font-bold border-r border-black">Thông tin xe</td>
                    <td className="w-1/4 p-1.5 font-bold"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 border-r border-black">Khách hàng:</td>
                    <td className="p-1.5 border-r border-black">{invoice.customer.name}</td>
                    <td className="p-1.5 border-r border-black">Biển số:</td>
                    <td className="p-1.5 font-bold">{invoice.vehicle.licensePlate}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 border-r border-black">Điện thoại:</td>
                    <td className="p-1.5 border-r border-black">{invoice.customer.phone}</td>
                    <td className="p-1.5 border-r border-black">Loại xe:</td>
                    <td className="p-1.5">{invoice.vehicle.model}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 border-r border-black">Địa chỉ:</td>
                    <td className="p-1.5 border-r border-black">{invoice.customer.address}</td>
                    <td className="p-1.5 border-r border-black">Số Odo:</td>
                    <td className="p-1.5 font-semibold">{formatNumber(invoice.vehicle.odometer)} km</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 border-r border-black"></td>
                    <td className="p-1.5 border-r border-black"></td>
                    <td className="p-1.5 border-r border-black">Loại dịch vụ:</td>
                    <td className="p-1.5">{invoice.vehicle.serviceType}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 font-bold border-r border-black">Mô tả hiện trạng xe</td>
                    <td colSpan={3} className="p-1.5">{invoice.statusDescription}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1.5 font-bold border-r border-black">Yêu cầu khách hàng</td>
                    <td colSpan={3} className="p-1.5">{invoice.customerRequest}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-bold italic border-r border-black">Ghi chú:</td>
                    <td colSpan={3} className="p-1.5 italic">Cam kết linh kiện chính hãng, bảo hành chất lượng 6 tháng.</td>
                  </tr>
                </tbody>
              </table>

              {/* Section 2 Banner: Nội dung sửa chữa */}
              <div className="bg-[#d9d9d9] font-bold italic px-2.5 py-1 text-xs text-black border border-slate-400 mb-1.5 font-sans">
                Nội dung sửa chữa
              </div>

              {/* Table 2: Itemized Repair Services & Supplies */}
              <table className="w-full border-collapse border border-black text-xs font-sans mb-3">
                <thead>
                  <tr className="border-b border-black bg-white">
                    <th className="border-r border-black p-1.5 text-center w-8">STT</th>
                    <th className="border-r border-black p-1.5 text-center w-20">Mã vật tư</th>
                    <th className="border-r border-black p-1.5 text-center">Vật tư – Phụ tùng – Dịch vụ</th>
                    <th className="border-r border-black p-1.5 text-center w-14">ĐVT</th>
                    <th className="border-r border-black p-1.5 text-center w-10">SL</th>
                    <th className="border-r border-black p-1.5 text-right w-24">Đơn giá (vnđ)</th>
                    <th className="p-1.5 text-right w-28">Thành Tiền (vnđ)</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* Category A: Supplies */}
                  <tr className="border-b border-black bg-[#fafafa]">
                    <td colSpan={7} className="p-1.5 font-bold">Vật tư, phụ tùng thay thế</td>
                  </tr>
                  {invoice.supplies.map((item, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                      <td className="border-r border-black p-1 text-center font-mono">{item.code}</td>
                      <td className="border-r border-black p-1">{item.name}</td>
                      <td className="border-r border-black p-1 text-center">{item.unit}</td>
                      <td className="border-r border-black p-1 text-center">{item.quantity}</td>
                      <td className="border-r border-black p-1 text-right">{formatNumber(item.unitPrice)}</td>
                      <td className="p-1 text-right font-medium">{formatNumber(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-black bg-[#f2f2f2] font-bold">
                    <td colSpan={6} className="border-r border-black p-1.5 text-right">A - Tổng tiền:</td>
                    <td className="p-1.5 text-right">{formatNumber(invoice.totalSupplies)}</td>
                  </tr>

                  {/* Category B: Labor */}
                  <tr className="border-b border-black bg-[#fafafa]">
                    <td colSpan={7} className="p-1.5 font-bold">Công kiểm tra, sửa chữa</td>
                  </tr>
                  {invoice.labor.map((item, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-1 text-center">{idx + 1}</td>
                      <td className="border-r border-black p-1 text-center font-mono">{item.code}</td>
                      <td className="border-r border-black p-1">{item.name}</td>
                      <td className="border-r border-black p-1 text-center">{item.unit}</td>
                      <td className="border-r border-black p-1 text-center">{item.quantity}</td>
                      <td className="border-r border-black p-1 text-right">{formatNumber(item.unitPrice)}</td>
                      <td className="p-1 text-right font-medium">{formatNumber(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-black bg-[#f2f2f2] font-bold">
                    <td colSpan={6} className="border-r border-black p-1.5 text-right">B - Tổng Công:</td>
                    <td className="p-1.5 text-right">{formatNumber(invoice.totalLabor)}</td>
                  </tr>

                  {/* Category C: Old Debt */}
                  <tr className="border-b border-black bg-[#f2f2f2] font-bold">
                    <td colSpan={6} className="border-r border-black p-1.5 text-right">C - Nợ cũ:</td>
                    <td className="p-1.5 text-right">{formatNumber(invoice.oldDebt)}</td>
                  </tr>

                  {/* Grand Totals & Bank Info */}
                  <tr className="border-b border-black">
                    <td colSpan={4} rowSpan={5} className="border-r border-black p-2.5 align-top text-xs leading-relaxed">
                      <p className="font-bold">Thanh toán, cộng dồn theo nhóm</p>
                      <p className="mt-1">Chuyển khoản ngân hàng:</p>
                      <div className="mt-2 space-y-0.5 text-[12.5px]">
                        <p>STK: <strong>{invoice.bankInfo.accountNumber}</strong></p>
                        <p>Ngân hàng: <strong>{invoice.bankInfo.bankName}</strong></p>
                        <p>Chủ tài khoản: <strong>{invoice.bankInfo.accountHolder}</strong></p>
                      </div>
                    </td>
                    <td colSpan={2} className="border-r border-black p-1.5 font-bold">Tổng tiền (A + B + C):</td>
                    <td className="p-1.5 text-right font-bold">{formatNumber(invoice.totalSupplies + invoice.totalLabor + invoice.oldDebt)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="border-r border-black p-1.5">Giảm giá:</td>
                    <td className="p-1.5 text-right">{formatNumber(invoice.discount)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td colSpan={2} className="border-r border-black p-1.5 italic">Đưa trước:</td>
                    <td className="p-1.5 text-right italic">{formatNumber(invoice.prepaid)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border-r border-black p-2 font-black text-sm align-middle">Thanh toán:</td>
                    <td className="p-2 text-right font-black text-base align-middle">{formatNumber(invoice.grandTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Signatures */}
              <div className="grid grid-cols-2 text-center text-xs font-bold pt-4 font-sans print:pt-6">
                <div>
                  <p>KHÁCH HÀNG</p>
                  <p className="font-normal italic text-[11px] mt-0.5">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p>ĐẠI DIỆN GARA SỬA CHỮA</p>
                  <p className="font-normal italic text-[11px] mt-0.5">(Ký và đóng dấu xác nhận)</p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default InvoicePreviewModal;
