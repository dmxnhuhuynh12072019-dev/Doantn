import { useState, useEffect, useMemo, useCallback } from 'react';
import * as garageService from '../../services/garageService';
import * as appointmentService from '../../services/appointmentService';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MAX_BOOKINGS_PER_SLOT = 3;

const BookingAppointmentPage = ({
  onBack,
  onBookingSuccess,
  preselectedVehicle,
  selectedService,
  vehicles = [],
  onAddNewVehicle,
}) => {
  // 1. Vehicle Selection State
  const [selectedVehicle, setSelectedVehicle] = useState(preselectedVehicle || vehicles[0] || null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  // 2. Garage Selection State
  const [garages, setGarages] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [loadingGarages, setLoadingGarages] = useState(false);

  // 3. Calendar & Time State
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState('08:00');

  // 4. Real-time Slots Availability State
  const [slotBookings, setSlotBookings] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 5. Notes & Form State
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedVehicle) {
      setSelectedVehicle(preselectedVehicle);
    } else if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [preselectedVehicle, vehicles]);

  useEffect(() => {
    const fetchGarages = async () => {
      setLoadingGarages(true);
      try {
        const data = await garageService.getGarages();
        setGarages(data || []);
        if (data && data.length > 0) {
          setSelectedGarageId(data[0].GarageID.toString());
        }
      } catch (err) {
        console.error('Error fetching garages:', err);
      } finally {
        setLoadingGarages(false);
      }
    };
    fetchGarages();
  }, []);

  // Calendar Helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const formattedSelectedDate = useMemo(() => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(selectedDate).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }, [year, month, selectedDate]);

  // Fetch slot availability from backend when garage or date changes
  const fetchSlotAvailability = useCallback(async () => {
    if (!selectedGarageId) return;
    setLoadingSlots(true);
    try {
      const data = await appointmentService.getSlotAvailability(selectedGarageId, formattedSelectedDate);
      const map = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item.TimeSlot) {
            map[item.TimeSlot] = item.BookedCount || 0;
          }
        });
      }
      setSlotBookings(map);
    } catch (err) {
      console.warn('Could not fetch slot availability:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedGarageId, formattedSelectedDate]);

  useEffect(() => {
    fetchSlotAvailability();
  }, [fetchSlotAvailability]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday is index 0 in Vietnamese calendar: getDay() returns 0 for Sunday -> 6, 1 for Mon -> 0
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentMonthDate(prev);
    // Adjust selected date if needed
    const maxDays = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate();
    if (selectedDate > maxDays) setSelectedDate(maxDays);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentMonthDate(next);
    const maxDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    if (selectedDate > maxDays) setSelectedDate(maxDays);
  };

  // Calendar day cells
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const isPastDate = (d) => {
    if (!d) return true;
    const now = new Date();
    const cellDate = new Date(year, month, d, 23, 59, 59);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return cellDate < todayStart;
  };

  const isCurrentSelectedDate = (d) => {
    return (
      d === selectedDate &&
      year === currentMonthDate.getFullYear() &&
      month === currentMonthDate.getMonth()
    );
  };

  // Real-time check if a specific time slot is in the past for the selected date
  const isPastTimeSlot = (slot) => {
    const now = new Date();
    const isToday =
      year === now.getFullYear() &&
      month === now.getMonth() &&
      selectedDate === now.getDate();

    if (isToday) {
      const [sh, sm] = slot.split(':').map(Number);
      const slotDateTime = new Date(year, month, selectedDate, sh, sm, 0);
      return slotDateTime <= now;
    }

    // Check if the entire selected date is before today
    const selectedDateTime = new Date(year, month, selectedDate, 23, 59, 59);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return selectedDateTime < todayStart;
  };

  // Check if slot has reached limit of 3 bookings
  const isSlotFull = (slot) => {
    const booked = slotBookings[slot] || 0;
    return booked >= MAX_BOOKINGS_PER_SLOT;
  };

  // Auto-select first valid slot if current selected slot is past or full
  useEffect(() => {
    const currentIsInvalid = isPastTimeSlot(selectedTime) || isSlotFull(selectedTime);
    if (currentIsInvalid) {
      const firstAvailable = TIME_SLOTS.find(
        (slot) => !isPastTimeSlot(slot) && !isSlotFull(slot)
      );
      if (firstAvailable) {
        setSelectedTime(firstAvailable);
      }
    }
  }, [selectedDate, currentMonthDate, slotBookings]);

  // Form Submit
  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!selectedVehicle) {
      setError('Vui lòng chọn xe cần đặt lịch bảo dưỡng.');
      return;
    }

    if (!selectedGarageId) {
      setError('Vui lòng chọn Gara thực hiện dịch vụ.');
      return;
    }

    if (isPastTimeSlot(selectedTime)) {
      setError('Khung giờ bạn chọn đã trôi qua so với thời gian thực. Vui lòng chọn khung giờ khác.');
      return;
    }

    if (isSlotFull(selectedTime)) {
      setError(`Khung giờ ${selectedTime} đã đủ tối đa 3 khách đặt. Vui lòng chọn khung giờ khác.`);
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDateTime = new Date(year, month, selectedDate, hours, minutes, 0);

    if (appointmentDateTime <= new Date()) {
      setError('Thời gian đặt lịch không thể ở trong quá khứ.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        garageId: parseInt(selectedGarageId, 10),
        vehicleId: selectedVehicle.VehicleID,
        appointmentDate: appointmentDateTime.toISOString(),
        notes: notes.trim() || undefined,
      };

      await appointmentService.createAppointment(payload);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (err) {
      setError(err.message || 'Đặt lịch hẹn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-24 select-none">
      {/* 1. Header Bar: Mobile top bar + Desktop Breadcrumb Banner */}
      <div className="md:hidden bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Quay lại"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="!text-white text-base font-black tracking-tight !m-0 !p-0" style={{ color: '#ffffff' }}>
            Đặt lịch
          </h1>
        </div>
      </div>

      {/* Desktop Header Banner */}
      <div className="hidden md:block bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-6 px-6 shadow-sm border-b border-indigo-950/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200 mb-1">
              <button onClick={onBack} className="hover:text-white transition cursor-pointer">Trang chủ</button>
              <span>/</span>
              {selectedService && (
                <>
                  <button onClick={onBack} className="hover:text-white transition cursor-pointer">Dịch vụ</button>
                  <span>/</span>
                </>
              )}
              <span className="text-white font-bold">Đặt lịch hẹn</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight !m-0 !p-0">
              {selectedService ? `Đặt lịch: ${selectedService.title}` : 'Đặt lịch hẹn bảo dưỡng & sửa chữa'}
            </h1>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-5">
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
          
          {/* Left Column: Service preview, Vehicle picker, and Calendar */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Selected Service Preview Card matching user screenshot */}
            {selectedService && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-3.5 sm:p-4 border border-slate-150 dark:border-slate-700 shadow-2xs flex items-center gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-100 dark:border-slate-700">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Dịch vụ đã chọn
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug truncate mt-0.5">
                    {selectedService.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                      {typeof selectedService.price === 'number'
                        ? new Intl.NumberFormat('vi-VN').format(selectedService.price) + 'đ'
                        : selectedService.price}
                    </span>
                    {selectedService.oldPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {typeof selectedService.oldPrice === 'number'
                          ? new Intl.NumberFormat('vi-VN').format(selectedService.oldPrice) + 'đ'
                          : selectedService.oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 1: Xe của bạn */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                Xe của bạn
              </label>
              <div
                onClick={() => setShowVehiclePicker(true)}
                className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-150 dark:border-slate-700 shadow-2xs hover:border-indigo-400 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center text-xl shrink-0">
                    🚘
                  </div>
                  {selectedVehicle ? (
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-tight">
                        {selectedVehicle.Brand} {selectedVehicle.Model}
                      </h4>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                        Biển số: {selectedVehicle.LicensePlate}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-medium text-slate-400">Chọn xe</span>
                  )}
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Section 3: Chọn ngày (Interactive Calendar widget) */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                Chọn ngày
              </label>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-150 dark:border-slate-700 shadow-2xs">
                {/* Month Switcher Row */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700">
                    <span>Tháng {month + 1} {year}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Weekdays Header */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
                  {WEEK_DAYS.map((wd) => (
                    <div key={wd} className="py-1">
                      {wd}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs sm:text-sm">
                  {calendarCells.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="h-9 w-9"></div>;
                    }

                    const isPast = isPastDate(day);
                    const isSelected = isCurrentSelectedDate(day);

                    return (
                      <div key={`day-${day}`} className="flex items-center justify-center">
                        <button
                          type="button"
                          disabled={isPast}
                          onClick={() => setSelectedDate(day)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all duration-150 ${
                            isSelected
                              ? 'border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300 shadow-xs ring-2 ring-indigo-200 dark:ring-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30'
                              : isPast
                              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer'
                          }`}
                        >
                          {day}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Time slots, Partner Garage, Notes, and Submit */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Section 4: Chọn giờ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                  Chọn giờ
                </label>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  (Tối đa 3 khách / khung giờ)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isPast = isPastTimeSlot(slot);
                  const isFull = isSlotFull(slot);
                  const isDisabled = isPast || isFull;
                  const isSelected = selectedTime === slot && !isDisabled;
                  const bookedCount = slotBookings[slot] || 0;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-800'
                          : isDisabled
                          ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-600 border-slate-200/40 dark:border-slate-750/40 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer'
                      }`}
                      title={
                        isPast
                          ? 'Khung giờ này đã trôi qua'
                          : isFull
                          ? 'Khung giờ này đã đủ 3 khách đặt (Hết chỗ)'
                          : `Đã có ${bookedCount}/3 lượt đặt`
                      }
                    >
                      <span>{slot}</span>

                      {/* Status Indicator text under the time */}
                      {isFull ? (
                        <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 leading-tight">
                          Đầy (3/3)
                        </span>
                      ) : bookedCount > 0 && !isPast ? (
                        <span className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-indigo-100' : 'text-amber-600 dark:text-amber-400'}`}>
                          {bookedCount}/3 chỗ
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Gara đối tác */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                Chọn Gara đối tác
              </label>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 border border-slate-150 dark:border-slate-700 shadow-2xs">
                {loadingGarages ? (
                  <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse"></div>
                ) : (
                  <select
                    value={selectedGarageId}
                    onChange={(e) => setSelectedGarageId(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-slate-800 dark:text-white font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    {garages.map((g) => (
                      <option key={g.GarageID} value={g.GarageID} className="dark:bg-slate-800">
                        {g.GarageName} — {g.Address} ({g.Rating || '5.0'} ⭐)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Section 5: Ghi chú */}
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mô tả vấn đề hoặc yêu cầu của bạn..."
                rows="3"
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-xs sm:text-sm resize-none shadow-2xs"
              ></textarea>
            </div>

            {/* Bottom Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={submitting || isPastTimeSlot(selectedTime) || isSlotFull(selectedTime)}
                onClick={handleBookingSubmit}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Đang gửi thông tin...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Đặt lịch</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Vehicle Picker Modal / Bottom Sheet */}
      {showVehiclePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowVehiclePicker(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                Chọn phương tiện của bạn
              </h3>
              <button
                onClick={() => setShowVehiclePicker(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 mb-3">Bạn chưa có phương tiện nào trong danh sách.</p>
                <button
                  onClick={() => {
                    setShowVehiclePicker(false);
                    if (onAddNewVehicle) onAddNewVehicle();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + Thêm xe mới
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicle?.VehicleID === v.VehicleID;
                  return (
                    <div
                      key={v.VehicleID}
                      onClick={() => {
                        setSelectedVehicle(v);
                        setShowVehiclePicker(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:border-indigo-500'
                          : 'border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🚗</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white">
                            {v.Brand} {v.Model}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Biển số: <strong className="text-indigo-600 dark:text-indigo-400">{v.LicensePlate}</strong>
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingAppointmentPage;
