import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Check,
  AlertCircle,
  Calendar,
  Car,
  Settings,
  Database,
  Cpu,
  Users,
  Award,
  TrendingUp,
  LogOut,
  ArrowRight,
  Clock,
  Wrench,
  FileText,
  PieChart as PieIcon,
  Shield,
  Code,
  Sparkles,
  Layers,
  Activity,
  Plus,
  RotateCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Data for Slide 6 (Work Contribution)
const contributionData = [
  { name: 'Phát triển Frontend (User)', value: 35, color: '#aa3bff' },
  { name: 'Xây dựng Backend (Admin)', value: 30, color: '#3b82f6' },
  { name: 'Thiết kế DB & Gara (Garage)', value: 20, color: '#10b981' },
  { name: 'Kiểm thử & Viết Tài liệu', value: 15, color: '#f59e0b' }
];

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 6;
  const containerRef = useRef(null);

  // --- Keyboard & Fullscreen Event Handlers ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // --- Slide 3 Interactive ERD State ---
  const [activeEntity, setActiveEntity] = useState('Vehicles');
  const entities = {
    Users: {
      name: 'Users (Người dùng)',
      fields: [
        { name: 'UserID', type: 'INT (PK, Identity)' },
        { name: 'FullName', type: 'NVARCHAR(100)' },
        { name: 'Email', type: 'VARCHAR(100) (Unique)' },
        { name: 'PhoneNumber', type: 'VARCHAR(15)' },
        { name: 'PasswordHash', type: 'VARCHAR(255)' },
        { name: 'Role', type: "VARCHAR(20) (User/Garage/Admin)" },
        { name: 'Status', type: 'NVARCHAR(20)' },
        { name: 'CreatedAt', type: 'DATETIME' }
      ],
      relations: '1-N với Vehicles, 1-N với Appointments, 1-N với Notifications, 1-1 với Garages.'
    },
    Vehicles: {
      name: 'Vehicles (Phương tiện)',
      fields: [
        { name: 'VehicleID', type: 'INT (PK, Identity)' },
        { name: 'UserID', type: 'INT (FK -> Users)' },
        { name: 'LicensePlate', type: 'VARCHAR(20) (Unique)' },
        { name: 'VehicleType', type: 'NVARCHAR(20) (Ô tô/Xe máy)' },
        { name: 'Brand', type: 'NVARCHAR(50)' },
        { name: 'Model', type: 'NVARCHAR(50)' },
        { name: 'ManufactureYear', type: 'INT' },
        { name: 'PurchaseDate', type: 'DATE' },
        { name: 'CurrentOdometer', type: 'INT' }
      ],
      relations: 'Thuộc về Users. 1-N với LegalDocuments, MaintenanceSchedules, Appointments, MaintenanceHistory.'
    },
    LegalDocuments: {
      name: 'LegalDocuments (Giấy tờ)',
      fields: [
        { name: 'DocumentID', type: 'INT (PK, Identity)' },
        { name: 'VehicleID', type: 'INT (FK -> Vehicles)' },
        { name: 'DocumentType', type: 'NVARCHAR(50) (Đăng kiểm/Bảo hiểm)' },
        { name: 'IssueDate', type: 'DATE' },
        { name: 'ExpiryDate', type: 'DATE' },
        { name: 'AlertThresholdDays', type: 'INT' },
        { name: 'Status', type: 'NVARCHAR(20)' }
      ],
      relations: 'Thuộc về Vehicles. Chứa hạn đăng kiểm và bảo hiểm bắt buộc.'
    },
    MaintenanceSchedules: {
      name: 'MaintenanceSchedules (Lịch nhắc)',
      fields: [
        { name: 'ScheduleID', type: 'INT (PK, Identity)' },
        { name: 'VehicleID', type: 'INT (FK -> Vehicles)' },
        { name: 'CategoryName', type: 'NVARCHAR(100) (Thay dầu, phanh...)' },
        { name: 'TargetOdometer', type: 'INT' },
        { name: 'TargetDate', type: 'DATE' },
        { name: 'AlertThresholdKM', type: 'INT' },
        { name: 'Status', type: 'NVARCHAR(20)' },
        { name: 'Notes', type: 'NVARCHAR(MAX)' }
      ],
      relations: 'Thuộc về Vehicles. Cảnh báo bảo dưỡng định kỳ dựa trên số Odometer hiện tại.'
    },
    Garages: {
      name: 'Garages (Đối tác liên kết)',
      fields: [
        { name: 'GarageID', type: 'INT (PK, Identity)' },
        { name: 'UserID', type: 'INT (FK -> Users)' },
        { name: 'GarageName', type: 'NVARCHAR(200)' },
        { name: 'Address', type: 'NVARCHAR(500)' },
        { name: 'Phone', type: 'VARCHAR(15)' },
        { name: 'Email', type: 'VARCHAR(100)' },
        { name: 'Rating', type: 'DECIMAL(3,2)' },
        { name: 'IsActive', type: 'BIT' }
      ],
      relations: 'Được quản lý bởi tài khoản Role=Garage. Nhận Appointments và ghi MaintenanceHistory.'
    },
    Appointments: {
      name: 'Appointments (Lịch hẹn)',
      fields: [
        { name: 'AppointmentID', type: 'INT (PK, Identity)' },
        { name: 'UserID', type: 'INT (FK -> Users)' },
        { name: 'GarageID', type: 'INT (FK -> Garages)' },
        { name: 'VehicleID', type: 'INT (FK -> Vehicles)' },
        { name: 'AppointmentDate', type: 'DATETIME' },
        { name: 'Status', type: 'NVARCHAR(30) (Chờ xác nhận/Đã xác nhận...)' },
        { name: 'Notes', type: 'NVARCHAR(MAX)' },
        { name: 'CreatedAt', type: 'DATETIME' }
      ],
      relations: 'Liên kết giữa Chủ xe, Gara và Phương tiện. Khởi đầu cho chuỗi bảo dưỡng sửa chữa.'
    },
    MaintenanceHistory: {
      name: 'MaintenanceHistory (Nhật ký)',
      fields: [
        { name: 'HistoryID', type: 'INT (PK, Identity)' },
        { name: 'VehicleID', type: 'INT (FK -> Vehicles)' },
        { name: 'GarageID', type: 'INT (FK -> Garages)' },
        { name: 'AppointmentID', type: 'INT (FK -> Appointments)' },
        { name: 'ExecutionDate', type: 'DATE' },
        { name: 'ExecutionOdometer', type: 'INT' },
        { name: 'TotalCost', type: 'DECIMAL(18,2)' },
        { name: 'Details', type: 'NVARCHAR(MAX)' }
      ],
      relations: 'Số hóa lịch sử sửa chữa của xe. Có thể liên kết hoặc không liên kết lịch hẹn.'
    },
    Notifications: {
      name: 'Notifications (Thông báo)',
      fields: [
        { name: 'NotificationID', type: 'INT (PK, Identity)' },
        { name: 'UserID', type: 'INT (FK -> Users)' },
        { name: 'Title', type: 'NVARCHAR(200)' },
        { name: 'Message', type: 'NVARCHAR(MAX)' },
        { name: 'NotificationType', type: 'VARCHAR(20) (InApp/Email/All)' },
        { name: 'IsRead', type: 'BIT' },
        { name: 'CreatedAt', type: 'DATETIME' }
      ],
      relations: 'Gửi đến Users để nhắc hẹn đăng kiểm, bảo hiểm, đổi nhớt.'
    }
  };

  // --- Slide 4 Interactive Step State ---
  const [vibeStep, setVibeStep] = useState(1);
  const vibeSteps = [
    {
      id: 1,
      title: '1. Đặc tả & Ra lệnh (Prompting)',
      desc: 'Lập trình viên viết tài liệu kiến trúc (module.md) và mô tả yêu cầu nghiệp vụ rõ ràng bằng Tiếng Việt.',
      details: 'AI Agent đọc hiểu toàn bộ cấu trúc cơ sở dữ liệu và mã nguồn hiện tại của dự án để đảm bảo tính đồng bộ.'
    },
    {
      id: 2,
      title: '2. Sinh code & Draft tự động',
      desc: 'AI viết backend NestJS APIs hoàn chỉnh và xây dựng frontend React UI có cấu trúc tối ưu.',
      details: 'Tự động tạo các schema database SQL Server, controller định tuyến, validation DTOs và React forms nhập liệu.'
    },
    {
      id: 3,
      title: '3. Đánh giá & Sửa đổi (Review)',
      desc: 'Lập trình viên kiểm duyệt code do AI đề xuất, yêu cầu chỉnh sửa và sửa các lỗi phát sinh (lint, logic).',
      details: 'Phương pháp lặp nhanh: Nhận diện phản hồi tức thì để cải thiện độ mượt của UI và tính bảo mật của JWT Token.'
    },
    {
      id: 4,
      title: '4. Kiểm thử tự động (Testing)',
      desc: 'Sử dụng các kịch bản kiểm thử (test_scenarios.md) có sẵn để kiểm tra API bằng Postman & UI.',
      details: 'Kiểm tra phân quyền RBAC (Chủ xe, Gara, Admin) để chắc chắn người dùng không truy cập trái phép tài nguyên.'
    },
    {
      id: 5,
      title: '5. Hoàn thiện & Triển khai',
      desc: 'Hoàn tất nghiệm thu, cập nhật tài liệu walkthrough và sẵn sàng cho việc trình diễn đồ án trước hội đồng.',
      details: 'Rút ngắn 70% thời gian phát triển so với viết code thủ công. UI/UX đạt độ hoàn thiện cao nhờ Glassmorphism.'
    }
  ];

  // --- Slide 5 Simulator App States ---
  const [simActiveTab, setSimActiveTab] = useState('vehicles');
  // Vehicles Sim State
  const [simOdoToyota, setSimOdoToyota] = useState(35200);
  const [simOdoHonda, setSimOdoHonda] = useState(12350);
  // Appointments Sim State
  const [simAppointments, setSimAppointments] = useState([
    { id: 1, garage: 'AutoCare Central Garage Q5', date: '2026-07-25 09:00', status: 'Chờ xác nhận', vehicle: 'Toyota Vios 59A-123.45' }
  ]);
  const [newAppDate, setNewAppDate] = useState('2026-07-28');
  const [newAppTime, setNewAppTime] = useState('10:00');
  const [newAppVehicle, setNewAppVehicle] = useState('Toyota Vios 59A-123.45');

  const addSimAppointment = () => {
    if (!newAppDate || !newAppTime) return;
    const newApp = {
      id: Date.now(),
      garage: 'AutoCare Central Garage Q5',
      date: `${newAppDate} ${newAppTime}`,
      status: 'Chờ xác nhận',
      vehicle: newAppVehicle
    };
    setSimAppointments([...simAppointments, newApp]);
    alert('Đặt lịch hẹn thành công (Mô phỏng)!');
  };

  const handleOdoChange = (type, val) => {
    const numeric = parseInt(val) || 0;
    if (type === 'toyota') setSimOdoToyota(numeric);
    else setSimOdoHonda(numeric);
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-500 bg-slate-950 text-slate-100 ${
        isFullscreen ? 'p-12' : 'p-6 md:p-8'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, rgba(0, 0, 0, 0) 90%)'
      }}
    >
      {/* HEADER BAR */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/25 border border-indigo-500 text-indigo-400 p-2 rounded-2xl">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
              ACOH <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">Project Defense</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">AutoCare Office Helper — Thuyết trình Đồ án Tốt nghiệp</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Bạn có muốn quay lại giao diện đăng nhập?')) {
                navigate('/login');
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-950 px-3 py-1.5 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát Slide</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 bg-slate-900 border border-slate-800 hover:border-indigo-950 px-3 py-1.5 rounded-xl transition-all duration-200"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </header>

      {/* MAIN SLIDE CONTAINER */}
      <main className="flex-grow flex flex-col justify-center items-center py-4 w-full">
        
        {/* SLIDE 1: OVERVIEW */}
        {currentSlide === 1 && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-500">
            <div className="md:col-span-7 space-y-6 text-left">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                Đồ án Tốt nghiệp ngành Công nghệ Thông tin
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                XÂY DỰNG HỆ THỐNG <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  AUTOCARE OFFICE HELPER
                </span>
              </h2>
              <p className="text-slate-300 text-lg font-light leading-relaxed font-sans">
                Hệ thống hỗ trợ tự động giám sát thời hạn đăng kiểm, nhắc lịch bảo dưỡng định kỳ và quản lý bảo hiểm phương tiện, tích hợp kết nối gara sửa chữa trực tuyến.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-bold">Nền tảng phát triển</h4>
                  <p className="text-white text-base font-semibold">Web Application (Responsive)</p>
                </div>
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-bold">Mô hình phát triển</h4>
                  <p className="text-white text-base font-semibold">Vibe Coding (AI Pair Programming)</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 bg-purple-500/10 w-32 h-32 rounded-full blur-3xl -mr-6 -mt-6"></div>
              
              <h3 className="text-white font-bold text-lg border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Thông tin Đề tài</span>
              </h3>
              
              <div className="space-y-4 text-sm text-left">
                <div>
                  <span className="text-slate-400 block mb-1">Giảng viên hướng dẫn:</span>
                  <strong className="text-white text-base font-bold">PGS. TS. Nguyễn Văn A</strong>
                </div>
                
                <div className="border-t border-slate-900 pt-4">
                  <span className="text-slate-400 block mb-2 font-semibold">Sinh viên thực hiện (Nhóm 3 thành viên):</span>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-3.5 py-2.5 rounded-xl">
                      <div>
                        <strong className="text-white block">Lê Văn User</strong>
                        <span className="text-slate-400 text-xs">MSSV: 22010001</span>
                      </div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded font-bold uppercase">FE & Nghiệp vụ User</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-3.5 py-2.5 rounded-xl">
                      <div>
                        <strong className="text-white block">Trần Thị Garage</strong>
                        <span className="text-slate-400 text-xs">MSSV: 22010002</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-bold uppercase">DB & Nghiệp vụ Gara</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-3.5 py-2.5 rounded-xl">
                      <div>
                        <strong className="text-white block">Nguyễn Văn Admin</strong>
                        <span className="text-slate-400 text-xs">MSSV: 22010003</span>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded font-bold uppercase">BE & Quản trị Admin</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: PROBLEM STATEMENT & TARGET USERS */}
        {currentSlide === 2 && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-500 text-left">
            <div className="text-center md:text-left mb-4">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                Slide 2: Phân Tích Thực Tiễn
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">Bài toán thực tế & Đối tượng sử dụng</h2>
              <p className="text-slate-400 text-sm md:text-base mt-1">Lý do phát triển dự án ACOH và tệp khách hàng tiềm năng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Problem */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                <h3 className="text-rose-400 font-bold text-xl flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AlertCircle className="w-5.5 h-5.5 text-rose-500" />
                  <span>Bài toán thực tế cần giải quyết</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-rose-950/50 transition-all">
                    <span className="w-6 h-6 shrink-0 bg-rose-500/10 text-rose-400 flex items-center justify-center rounded-full font-bold text-xs">1</span>
                    <p className="text-slate-300 text-sm">
                      <strong>Thói quen bận rộn:</strong> Đa phần người dùng (đặc biệt là nhân viên văn phòng) quên hạn đăng kiểm, thay nhớt máy hoặc đóng phí bảo hiểm do thông tin tản mát.
                    </p>
                  </div>
                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-rose-950/50 transition-all">
                    <span className="w-6 h-6 shrink-0 bg-rose-500/10 text-rose-400 flex items-center justify-center rounded-full font-bold text-xs">2</span>
                    <p className="text-slate-300 text-sm">
                      <strong>Thiệt hại pháp lý & chi phí:</strong> Trễ hạn đăng kiểm bị xử phạt nặng và tước giấy phép lái xe. Quên thay nhớt động cơ, đảo lốp gây mất an toàn nghiêm trọng.
                    </p>
                  </div>
                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-rose-950/50 transition-all">
                    <span className="w-6 h-6 shrink-0 bg-rose-500/10 text-rose-400 flex items-center justify-center rounded-full font-bold text-xs">3</span>
                    <p className="text-slate-300 text-sm">
                      <strong>Khó khăn đặt lịch sửa chữa:</strong> Không thể đặt chỗ trước tại garage trong giờ cao điểm, ghi chép nhật ký sửa xe thủ công bằng giấy dễ rách nát, thất lạc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Target Users */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                <h3 className="text-indigo-400 font-bold text-xl flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Users className="w-5.5 h-5.5 text-indigo-400" />
                  <span>Đối tượng người dùng hướng tới</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-indigo-950/50 transition-all">
                    <span className="w-10 h-10 shrink-0 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-xl font-bold">
                      <Car className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-white text-sm font-bold">Chủ phương tiện cá nhân (User)</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Sở hữu ô tô, xe máy, cần quản lý tập trung thời hạn giấy tờ, số km đi được và nhận cảnh báo sớm qua Email & In-app.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-indigo-950/50 transition-all">
                    <span className="w-10 h-10 shrink-0 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-xl font-bold">
                      <Wrench className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-white text-sm font-bold">Các Gara sửa chữa liên kết (Garage)</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Tiếp cận khách hàng đặt lịch trực tuyến, số hóa sổ theo dõi kỹ thuật, ghi chép nhật ký sửa chữa trực tiếp cho chủ xe.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-900 hover:border-indigo-950/50 transition-all">
                    <span className="w-10 h-10 shrink-0 bg-purple-500/10 text-purple-400 flex items-center justify-center rounded-xl font-bold">
                      <Settings className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-white text-sm font-bold">Quản trị viên hệ thống (Admin)</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Kiểm soát hoạt động của Gara liên kết, quản trị danh mục người dùng và xem báo cáo phân tích chi phí toàn hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: TECH ARCHITECTURE & ERD */}
        {currentSlide === 3 && (
          <div className="w-full max-w-5xl space-y-4 animate-in fade-in duration-500 text-left">
            <div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                Slide 3: Thiết Kế Hệ Thống
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">Kiến trúc Công nghệ & Mô hình Cơ sở Dữ liệu (ERD)</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Tech Stack & Clean Architecture Info */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-indigo-400 font-bold text-base flex items-center gap-2">
                    <Cpu className="w-4.5 h-4.5" />
                    <span>Hạ tầng Công nghệ (Tech Stack)</span>
                  </h3>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Frontend Framework:</span>
                      <strong className="text-white">React.js + Vite (v19)</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">CSS Styling:</span>
                      <strong className="text-white">Tailwind CSS (v4)</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Backend API Framework:</span>
                      <strong className="text-white">NestJS (Node.js)</strong>
                    </li>
                    <li className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Database Engine:</span>
                      <strong className="text-white">Microsoft SQL Server 2014</strong>
                    </li>
                    <li className="flex justify-between pb-0.5">
                      <span className="text-slate-400">Giao thức / Xác thực:</span>
                      <strong className="text-white">RESTful API + JWT + Nodemailer</strong>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex-grow space-y-3">
                  <h3 className="text-emerald-400 font-bold text-base flex items-center gap-2">
                    <Layers className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Kiến trúc hệ thống (Clean Architecture)</span>
                  </h3>
                  <div className="text-xs text-slate-300 space-y-2">
                    <p>Hệ thống được tổ chức phân lớp rõ ràng để dễ bảo trì và mở rộng:</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-indigo-950/60 border border-indigo-850 p-2 rounded text-indigo-300">Presentation (React)</div>
                      <div className="bg-blue-950/60 border border-blue-850 p-2 rounded text-blue-300">Core Services (NestJS)</div>
                      <div className="bg-emerald-950/60 border border-emerald-850 p-2 rounded text-emerald-300">Database (SQL Server)</div>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">Luồng dữ liệu: Client gửi HTTPS requests -> JWT Middleware kiểm tra -> Controllers -> Services xử lý logic -> SQL Driver truy vấn DB.</p>
                  </div>
                </div>
              </div>

              {/* Interactive ERD Diagram */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-purple-400 font-bold text-base flex items-center gap-2 mb-3">
                    <Database className="w-4.5 h-4.5" />
                    <span>Mô hình Dữ liệu (ERD) Tương tác</span>
                  </h3>
                  
                  {/* Visual Node Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {Object.keys(entities).map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveEntity(key)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ${
                          activeEntity === key
                            ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10 scale-105'
                            : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail View of selected entity */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-white text-sm font-bold flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                      <span>{entities[activeEntity].name}</span>
                      <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-normal">Schema Fields</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs overflow-y-auto max-h-36 pr-2">
                      {entities[activeEntity].fields.map((f, i) => (
                        <div key={i} className="flex justify-between border-b border-slate-900/50 pb-1">
                          <span className="text-slate-300 font-mono font-medium">{f.name}</span>
                          <span className="text-slate-500 text-[10px]">{f.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-slate-900/80 pt-2.5 mt-2.5 text-xs text-left">
                    <span className="text-slate-400 font-semibold block mb-0.5">Liên kết quan hệ (Relationships):</span>
                    <p className="text-purple-300 italic">{entities[activeEntity].relations}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: VIBE CODING WORKFLOW */}
        {currentSlide === 4 && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-500 text-left">
            <div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                Slide 4: Phương Pháp Phát Triển
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">Quy trình ứng dụng Vibe Coding (AI-Driven Development)</h2>
              <p className="text-slate-400 text-sm mt-0.5">Cách nhóm lập trình viên tương tác cùng AI Agent để tối ưu hóa 70% thời gian xây dựng hệ thống</p>
            </div>

            {/* Steps Visual Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {vibeSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => setVibeStep(step.id)}
                  className={`cursor-pointer border rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
                    vibeStep === step.id
                      ? 'bg-gradient-to-br from-indigo-950/70 to-indigo-900/50 border-indigo-500 shadow-xl scale-[1.02]'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${vibeStep === step.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {step.title.split('.')[0]}
                    </h3>
                    <h4 className="text-white text-sm font-bold mb-1.5">{step.title.substring(3)}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{step.desc}</p>
                  </div>
                  <div className="pt-3 flex justify-between items-center text-[10px]">
                    <span className={vibeStep === step.id ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                      {vibeStep === step.id ? 'Đang chọn' : 'Click để xem'}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${vibeStep === step.id ? 'text-indigo-400 translate-x-1' : 'text-slate-600'} transition-transform`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed view of active Vibe Step */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-indigo-950/60 border border-indigo-900 text-indigo-400 w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-black text-xl shadow-lg">
                {vibeStep}
              </div>
              <div className="flex-grow space-y-1.5 text-left">
                <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <span>{vibeSteps[vibeStep - 1].title}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded uppercase font-semibold">AI Interaction</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{vibeSteps[vibeStep - 1].desc}</p>
                <p className="text-slate-400 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-850 mt-2">
                  <span className="text-purple-400">Hành động thực tế:</span> {vibeSteps[vibeStep - 1].details}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: INTERACTIVE DEMO SIMULATOR */}
        {currentSlide === 5 && (
          <div className="w-full max-w-5xl space-y-4 animate-in fade-in duration-500 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                  Slide 5: Trực Quan Tính Năng
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">Mô phỏng Giao diện & Các Tính Năng Cốt Lõi</h2>
              </div>
              <p className="text-slate-400 text-xs italic hidden md:block">Click các tab để trải nghiệm mô phỏng ứng dụng thực tế</p>
            </div>

            {/* App Mockup Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[360px] md:h-[400px]">
              
              {/* Sidebar Simulation */}
              <div className="w-full md:w-48 bg-slate-950 border-r border-slate-850 flex flex-row md:flex-col justify-around md:justify-start gap-1 p-2">
                <div className="p-2 mb-3 border-b border-slate-850 text-white font-bold tracking-tight text-center text-sm hidden md:block">
                  ACOH App Shell
                </div>
                
                <button
                  onClick={() => setSimActiveTab('vehicles')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all w-full cursor-pointer ${
                    simActiveTab === 'vehicles' ? 'bg-indigo-500/20 border border-indigo-500/35 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Car className="w-4 h-4 shrink-0" />
                  <span>Quản lý Xe ({simOdoToyota ? '2' : '1'})</span>
                </button>

                <button
                  onClick={() => setSimActiveTab('alerts')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all w-full cursor-pointer ${
                    simActiveTab === 'alerts' ? 'bg-indigo-500/20 border border-indigo-500/35 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="flex justify-between w-full">
                    <span>Cảnh Báo Hạn</span>
                    <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">1</span>
                  </span>
                </button>

                <button
                  onClick={() => setSimActiveTab('booking')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all w-full cursor-pointer ${
                    simActiveTab === 'booking' ? 'bg-indigo-500/20 border border-indigo-500/35 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Đặt Lịch Bảo Dưỡng</span>
                </button>

                <button
                  onClick={() => setSimActiveTab('history')}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all w-full cursor-pointer ${
                    simActiveTab === 'history' ? 'bg-indigo-500/20 border border-indigo-500/35 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Wrench className="w-4 h-4 shrink-0" />
                  <span>Nhật Ký & Chi Phí</span>
                </button>
              </div>

              {/* Main Content Area Simulation */}
              <div className="flex-grow p-4 md:p-6 bg-slate-900 overflow-y-auto">
                
                {/* 1. Vehicles Tab */}
                {simActiveTab === 'vehicles' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-sm">Danh Sách Phương Tiện</h3>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3 h-3" /> Thêm xe
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Car Toyota */}
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold">Ô tô</span>
                            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded font-mono text-slate-400">59A-123.45</span>
                          </div>
                          <h4 className="text-white font-bold text-xs mt-2">Toyota Vios 1.5G (2020)</h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                          <span className="text-[10px] text-slate-500">Odometer:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={simOdoToyota}
                              onChange={(e) => handleOdoChange('toyota', e.target.value)}
                              className="w-16 bg-slate-900 border border-slate-850 text-[11px] font-mono text-right px-1 py-0.5 rounded text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 font-mono">km</span>
                          </div>
                        </div>
                      </div>

                      {/* Motor Honda */}
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Xe máy</span>
                            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded font-mono text-slate-400">59B-678.90</span>
                          </div>
                          <h4 className="text-white font-bold text-xs mt-2">Honda SH Mode 125cc (2021)</h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between items-center">
                          <span className="text-[10px] text-slate-500">Odometer:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={simOdoHonda}
                              onChange={(e) => handleOdoChange('honda', e.target.value)}
                              className="w-16 bg-slate-900 border border-slate-850 text-[11px] font-mono text-right px-1 py-0.5 rounded text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 font-mono">km</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-950/40 border border-indigo-900/60 p-3 rounded-xl text-xs text-indigo-300">
                      💡 <strong>Gợi ý:</strong> Odometer (Số km đi được) là biến đầu vào cốt lõi. Khi số km thay đổi, hệ thống tự động cập nhật thời hạn bảo dưỡng và cảnh báo cho bạn!
                    </div>
                  </div>
                )}

                {/* 2. Alerts Tab */}
                {simActiveTab === 'alerts' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h3 className="text-white font-bold text-sm">Cảnh Báo Hạn Giấy Tờ & Lịch Bảo Dưỡng</h3>
                    
                    <div className="space-y-2">
                      <div className="bg-rose-950/30 border border-rose-900/50 p-3.5 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex-grow text-xs text-left">
                          <div className="flex justify-between">
                            <strong className="text-rose-400">Bảo hiểm vật chất xe 59A-123.45</strong>
                            <span className="text-[9px] bg-rose-900 text-white px-1.5 py-0.5 rounded font-bold">QUÁ HẠN</span>
                          </div>
                          <p className="text-slate-300 mt-1">Đã hết hạn từ ngày <strong>10/05/2025</strong>. Cần liên hệ mua bảo hiểm mới để phòng ngừa rủi ro tài chính khi xảy ra tai nạn.</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="flex-grow text-xs text-left">
                          <div className="flex justify-between">
                            <strong className="text-white">Giấy tờ đăng kiểm xe Toyota Vios</strong>
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-semibold border border-emerald-900/30">CÒN HẠN</span>
                          </div>
                          <p className="text-slate-400 mt-1">Có giá trị đến ngày <strong>31/12/2026</strong>. Trạng thái hoạt động bình thường.</p>
                        </div>
                      </div>

                      <div className="bg-amber-950/30 border border-amber-900/50 p-3.5 rounded-xl flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-grow text-xs text-left">
                          <div className="flex justify-between">
                            <strong className="text-amber-400">Nhắc lịch bảo dưỡng: Thay nhớt động cơ</strong>
                            <span className="text-[9px] bg-amber-900 text-white px-1.5 py-0.5 rounded font-semibold">SẮP ĐẾN HẠN</span>
                          </div>
                          <p className="text-slate-300 mt-1">Mốc km bảo dưỡng: <strong>40,000 km</strong>. Hiện tại đã đạt <strong>{simOdoToyota} km</strong> (Còn {40000 - simOdoToyota} km).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Booking Tab */}
                {simActiveTab === 'booking' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h3 className="text-white font-bold text-sm">Đặt Lịch Hẹn Bảo Dưỡng Trực Tuyến</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Form */}
                      <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-3 text-xs text-left">
                        <strong className="text-white block">Tạo Lịch Hẹn Mới</strong>
                        <div>
                          <label className="text-slate-400 block mb-1">Chọn phương tiện:</label>
                          <select
                            value={newAppVehicle}
                            onChange={(e) => setNewAppVehicle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-805 p-1.5 rounded text-white focus:outline-none"
                          >
                            <option>Toyota Vios 59A-123.45</option>
                            <option>Honda SH Mode 59B-678.90</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-400 block mb-1">Ngày hẹn:</label>
                            <input
                              type="date"
                              value={newAppDate}
                              onChange={(e) => setNewAppDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-805 p-1.5 rounded text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Giờ hẹn:</label>
                            <input
                              type="time"
                              value={newAppTime}
                              onChange={(e) => setNewAppTime(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-805 p-1.5 rounded text-white text-xs"
                            />
                          </div>
                        </div>
                        <button
                          onClick={addSimAppointment}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded transition-colors cursor-pointer"
                        >
                          Xác nhận Đặt lịch
                        </button>
                      </div>

                      {/* Appointments List */}
                      <div className="space-y-2 text-left">
                        <strong className="text-slate-400 text-xs block">Lịch Hẹn Của Bạn:</strong>
                        <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1">
                          {simAppointments.map((app) => (
                            <div key={app.id} className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-[11px] flex justify-between items-center">
                              <div>
                                <span className="text-white block font-bold">{app.vehicle}</span>
                                <span className="text-slate-400 block">{app.garage}</span>
                                <span className="text-slate-500 font-mono block">{app.date}</span>
                              </div>
                              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/35 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase">
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. History Tab */}
                {simActiveTab === 'history' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-sm">Nhật Ký Bảo Dưỡng & Chi Phí Xe</h3>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Tổng chi: 1.500.000 đ</span>
                    </div>

                    <div className="space-y-2 text-xs text-left">
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                        <div className="flex justify-between items-start border-b border-slate-900 pb-1.5 mb-1.5">
                          <div>
                            <strong className="text-white font-bold">Toyota Vios 59A-123.45</strong>
                            <span className="text-slate-400 block text-[10px]">Thực hiện tại: AutoCare Central Garage Q5</span>
                          </div>
                          <span className="text-white font-bold font-mono">1.500.000 đ</span>
                        </div>
                        <p className="text-slate-400 text-xs">
                          Chi tiết công việc tại mốc 30.000 km:
                        </p>
                        <ul className="list-disc pl-4 text-[10px] text-slate-500 mt-1 space-y-0.5">
                          <li>Thay nhớt động cơ Castrol Magnatec</li>
                          <li>Thay lọc nhớt, vệ sinh lọc gió động cơ</li>
                          <li>Bảo dưỡng, vệ sinh hệ thống phanh 4 bánh</li>
                        </ul>
                        <span className="text-slate-500 block text-[9px] mt-2 font-mono">Ngày thực hiện: 10/01/2026</span>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: WORK CONTRIBUTION & CONCLUSION */}
        {currentSlide === 6 && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-500 text-left">
            <div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block">
                Slide 6: Đánh Giá Đóng Góp & Tổng Kết
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-white mt-1">Đóng góp công việc & Kết luận</h2>
              <p className="text-slate-400 text-sm mt-0.5">Phân chia nhiệm vụ của các thành viên trong nhóm và định hướng tương lai</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Chart of Work Contribution */}
              <div className="md:col-span-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[300px]">
                <h3 className="text-white font-bold text-base flex items-center gap-2 mb-2">
                  <PieIcon className="w-5 h-5 text-indigo-400" />
                  <span>Biểu đồ Phân chia Công việc</span>
                </h3>
                
                {/* Recharts Pie component */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#1f2937', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
                  {contributionData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-400 font-medium">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion & Roadmap */}
              <div className="md:col-span-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <h3 className="text-indigo-400 font-bold text-lg flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Award className="w-5.5 h-5.5 text-indigo-400" />
                    <span>Kết quả đạt được</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Xây dựng thành công hệ thống AutoCare Office Helper (ACOH) hoàn thiện cả Frontend và Backend, kết nối thông suốt với SQL Server 2014.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Hiện thực hóa cơ chế cảnh báo sớm, tự động tính toán thời hạn đăng kiểm, bảo hiểm và thay nhớt để bảo vệ chủ phương tiện.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Hoàn thành phân quyền RBAC và hệ thống in-app notification đẩy nhanh tiến độ làm việc giữa Chủ xe, Gara sửa chữa và Quản trị viên.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/65">
                  <h4 className="text-purple-400 font-bold text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
                    <span>Định hướng phát triển</span>
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Nâng cấp OCR quét biển số xe nhận diện thông tin đăng kiểm, phát triển native app trên iOS/Android, và tích hợp thuật toán gợi ý gara thông minh dựa trên vị trí GPS thực tế.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAVIGATION & CONTROL PANEL */}
      <footer className="border-t border-slate-800 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSlides }, (_, i) => i + 1).map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  currentSlide === idx
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-white hover:border-slate-700'
                }`}
              >
                {idx}
              </button>
            ))}
          </div>
          <span className="text-slate-500 font-mono">Slide {currentSlide} / {totalSlides}</span>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className="flex items-center gap-1 bg-slate-900 border border-slate-805 hover:border-slate-700 hover:text-white px-3.5 py-2 rounded-xl transition disabled:opacity-40 disabled:pointer-events-none text-slate-400 font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition disabled:opacity-40 disabled:pointer-events-none font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <span>Tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
