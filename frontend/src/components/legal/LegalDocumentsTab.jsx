import { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import * as legalService from '../../services/legalService';
import LegalDocumentModal from './LegalDocumentModal';
import RegistrationOcrModal from '../extensions/RegistrationOcrModal';

const LegalDocumentsTab = ({ vehicleId, vehicleType }) => {
  const { confirm, toast } = useModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('Đăng kiểm');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await legalService.getDocuments(vehicleId);
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin giấy tờ xe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchDocs();
    }
  }, [vehicleId]);

  const handleOpenAddModal = (docType) => {
    setSelectedDoc(null);
    setSelectedDocType(docType || 'Đăng kiểm');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setSelectedDoc(doc);
    if (doc?.DocumentType) {
      setSelectedDocType(doc.DocumentType);
    }
    setIsModalOpen(true);
  };

  const handleSaveDoc = async (docId, payload) => {
    try {
      if (docId) {
        await legalService.updateDocument(docId, payload);
        toast.success('Đã cập nhật thông tin giấy tờ!');
      } else {
        await legalService.createDocument(payload);
        toast.success('Đã thêm giấy tờ xe thành công!');
      }
      fetchDocs();
    } catch (err) {
      throw err;
    }
  };

  const handleApplyOcrData = async (ocrData) => {
    try {
      const existingDoc = documents.find(d => d.DocumentType === 'Đăng kiểm');
      const payload = {
        vehicleId,
        documentType: 'Đăng kiểm',
        issueDate: ocrData.issueDate || null,
        expiryDate: ocrData.expiryDate,
        alertThresholdDays: 30,
      };

      if (existingDoc) {
        await legalService.updateDocument(existingDoc.DocumentID, payload);
        toast.success('🎉 Đã cập nhật Sổ Đăng Kiểm thành công từ kết quả AI OCR!');
      } else {
        await legalService.createDocument(payload);
        toast.success('🎉 Đã khởi tạo mới Sổ Đăng Kiểm từ kết quả AI OCR!');
      }
      fetchDocs();
    } catch (err) {
      toast.error(err.message || 'Lưu thông tin từ OCR thất bại');
    }
  };

  const handleDelete = async (docId) => {
    const isConfirmed = await confirm({
      title: 'Xóa giấy tờ xe',
      message: 'Bạn có chắc chắn muốn xóa thông tin giấy tờ này?',
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy',
      type: 'danger',
    });

    if (isConfirmed) {
      try {
        await legalService.deleteDocument(docId);
        toast.success('Đã xóa thông tin giấy tờ!');
        fetchDocs();
      } catch (err) {
        toast.error(err.message || 'Xóa giấy tờ thất bại');
      }
    }
  };

  // Xác định những loại giấy tờ cần hiển thị theo loại xe
  const allowedDocTypes = vehicleType === 'Ô tô' 
    ? ['Đăng kiểm', 'Bảo hiểm dân sự', 'Bảo hiểm vật chất', 'Giấy phép lái xe']
    : ['Bảo hiểm dân sự', 'Bảo hiểm vật chất', 'Giấy phép lái xe'];

  const docMetaData = {
    'Đăng kiểm': {
      title: 'Đăng kiểm định kỳ',
      description: 'Lịch sử và chu kỳ kiểm định kỹ thuật & bảo vệ môi trường dành cho ô tô.',
      icon: '📋'
    },
    'Bảo hiểm dân sự': {
      title: 'Bảo hiểm dân sự',
      description: 'Bảo hiểm trách nhiệm dân sự bắt buộc của chủ xe cơ giới đối với bên thứ ba.',
      icon: '🛡️'
    },
    'Bảo hiểm vật chất': {
      title: 'Bảo hiểm vật chất',
      description: 'Bảo hiểm tự nguyện cho thiệt hại vật chất (thân vỏ, máy móc) của phương tiện.',
      icon: '🚗'
    },
    'Giấy phép lái xe': {
      title: 'Giấy phép lái xe (GPLX)',
      description: 'Quản lý thời hạn Giấy phép lái xe cá nhân để đảm bảo hợp pháp khi lưu thông.',
      icon: '🪪'
    }
  };

  const getRemainingDaysInfo = (expiryDate, status) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Đã quá hạn ${Math.abs(diffDays)} ngày`,
        colorClass: 'text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-950/40',
        badge: 'Quá hạn',
        badgeColor: 'bg-rose-500 text-white'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Hết hạn hôm nay!',
        colorClass: 'text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/40',
        badge: 'Hết hạn',
        badgeColor: 'bg-amber-500 text-white'
      };
    } else if (status === 'Sắp hết hạn' || diffDays <= 30) {
      return {
        text: `Còn ${diffDays} ngày (Sắp hết hạn)`,
        colorClass: 'text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/40',
        badge: 'Sắp hết hạn',
        badgeColor: 'bg-amber-500 text-white'
      };
    } else {
      return {
        text: `Còn ${diffDays} ngày nữa mới hết hạn`,
        colorClass: 'text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/40',
        badge: 'Còn hạn',
        badgeColor: 'bg-emerald-500 text-white'
      };
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      {vehicleType === 'Ô tô' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 rounded-3xl text-white shadow-xl border border-indigo-700/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                Module 2 • AI OCR
              </span>
            </div>
            <h3 className="text-base font-black tracking-tight">Quét & Bóc tách Sổ Đăng Kiểm tự động</h3>
            <p className="text-xs text-indigo-200/80">Tải ảnh Sổ Đăng Kiểm để AI tự nhận diện Ngày hết hạn, Số quản lý và tự điền dữ liệu</p>
          </div>
          <button
            onClick={() => setIsOcrModalOpen(true)}
            className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition cursor-pointer flex items-center gap-2"
          >
            <span>📋</span>
            <span>Quét Sổ Đăng Kiểm bằng AI</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allowedDocTypes.map((docType) => {
          const doc = documents.find(d => d.DocumentType === docType);
          const meta = docMetaData[docType];

          if (doc) {
            const statusInfo = getRemainingDaysInfo(doc.ExpiryDate, doc.Status);
            return (
              <div 
                key={docType}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center text-2xl">
                      {meta.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xxs font-black uppercase tracking-wider ${statusInfo.badgeColor}`}>
                      {statusInfo.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-850 dark:text-white mb-1">
                    {meta.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {meta.description}
                  </p>

                  <div className={`p-4 rounded-2xl border text-sm font-semibold mb-4 ${statusInfo.colorClass}`}>
                    {statusInfo.text}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-750/30 p-4 rounded-2xl mb-2">
                    <div className="flex justify-between">
                      <span>Ngày cấp:</span>
                      <span className="font-bold">
                        {doc.IssueDate ? new Date(doc.IssueDate).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày hết hạn:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {new Date(doc.ExpiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngưỡng cảnh báo:</span>
                      <span className="font-bold">{doc.AlertThresholdDays} ngày</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                  <button
                    onClick={() => handleOpenEditModal(doc)}
                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Gia hạn / Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(doc.DocumentID)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 dark:hover:bg-rose-950/40 rounded-xl transition"
                    title="Xóa giấy tờ"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          } else {
            // Trường hợp giấy tờ chưa được tạo
            return (
              <div 
                key={docType}
                className="bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/60 p-6 flex flex-col justify-between min-h-[300px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl opacity-40">
                      {meta.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xxs font-bold bg-slate-105 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      Chưa đăng ký
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-400 dark:text-slate-500 mb-1">
                    {meta.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-550 mb-6">
                    {meta.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {docType === 'Đăng kiểm' && (
                    <button
                      onClick={() => setIsOcrModalOpen(true)}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-650 dark:text-indigo-300 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5"
                    >
                      <span>📋</span>
                      Quét Sổ Đăng Kiểm bằng AI
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenAddModal(docType)}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Đăng ký thủ công
                  </button>
                </div>
              </div>
            );
          }
        })}
      </div>

      <LegalDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDoc}
        vehicleId={vehicleId}
        document={selectedDoc}
        defaultDocType={selectedDocType}
      />

      <RegistrationOcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onApplyData={handleApplyOcrData}
      />
    </div>
  );
};

export default LegalDocumentsTab;
