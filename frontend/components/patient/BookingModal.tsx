'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  CreditCard,
  CheckCircle,
  QrCode,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { PatientDoctor, PatientAppointment } from '@/types/patient-booking'
import { slotService, bookingService } from '@/services/patient-booking.service'
import { paymentService } from '@/services/payment.service'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/auth-store'

interface DoctorSchedule {
  id: number
  dayOfWeek: number  // 0=Sunday, 1=Monday, ..., 6=Saturday
  shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING'
  startTime: string
  endTime: string
  isActive: boolean
}

interface BookingModalProps {
  doctor: PatientDoctor | null
  onClose: () => void
  onBookingSuccess: (appointment: PatientAppointment) => void
  isLoggedIn: boolean
  onRequestLogin: () => void
}

export default function BookingModal({
  doctor,
  onClose,
  onBookingSuccess,
  isLoggedIn,
  onRequestLogin,
}: BookingModalProps) {
  if (!doctor) return null

  const { user } = useAuthStore()

  // Trả về YYYY-MM-DD theo giờ địa phương (tránh lỗi UTC vs VN +7)
  const getLocalDateStr = (date: Date): string =>
    date.toLocaleDateString('sv') // 'sv' locale cho ra format YYYY-MM-DD chuẩn

  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2)

  const [step, setStep] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateStr(tomorrow)
  )
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  // allScheduleSlots: toàn bộ slots của ca bác sĩ (grid ổn định)
  const [allScheduleSlots, setAllScheduleSlots] = useState<string[]>([])
  // availableSlots: subset còn trống (chưa bị đặt / lock)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false)
  // doctorOffDay: true khi API xác nhận bác sĩ không làm việc ngày được chọn
  const [doctorOffDay, setDoctorOffDay] = useState<boolean>(false)

  // filteredSlots: lọc những slot trong tương lai (nếu chọn hôm nay)
  // Dùng allScheduleSlots làm base để grid không nhảy
  const filteredScheduleSlots = useMemo(() => {
    const base = allScheduleSlots.length > 0 ? allScheduleSlots : availableSlots
    if (!base.length) return []
    const todayStr = getLocalDateStr(new Date())
    if (selectedDate !== todayStr) return base
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    return base.filter(slot => {
      const [hStr, mStr] = slot.split(':')
      const h = parseInt(hStr, 10)
      const m = parseInt(mStr, 10)
      return h > currentHour || (h === currentHour && m > currentMinute)
    })
  }, [allScheduleSlots, availableSlots, selectedDate])

  const [patientName, setPatientName] = useState<string>('')
  const [patientPhone, setPatientPhone] = useState<string>('')
  const [patientNotes, setPatientNotes] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<PatientAppointment | null>(null)
  // Track slot lock state
  const [currentLockId, setCurrentLockId] = useState<number | null>(null)
  const [lockingSlot, setLockingSlot] = useState<string | null>(null) // slot đang trong quá trình lock
  const currentLockIdRef = useRef<number | null>(null) // dùng ref để tránh stale closure trong cleanup

  const dateOptions = [
    { value: getLocalDateStr(today), label: 'Hôm nay' },
    { value: getLocalDateStr(tomorrow), label: 'Ngày mai' },
    { value: getLocalDateStr(dayAfter), label: 'Ngày kia' },
  ]

  // Hàm fetch slots có schedule filter — tái sử dụng được cả trong useEffect lẫn handleSelectSlot
  const fetchAvailableSlots = useCallback(async () => {
    setLoadingSlots(true)
    try {
      let allowedSlots: string[] | null = null
      // scheduleApiOk = true nếu gọi API lịch làm việc thành công (dù không có ca nào)
      let scheduleApiOk = false

      try {
        const schedRes = await api.get<{ data: DoctorSchedule[] }>(`/api/doctors/${doctor.id}/schedules`)
        scheduleApiOk = true
        const schedules: DoctorSchedule[] = schedRes.data.data || []
        const selectedDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay()
        const activeSchedule = schedules.find(
          (s) => s.dayOfWeek === selectedDayOfWeek && s.isActive
        )
        if (activeSchedule) {
          setDoctorOffDay(false)
          const MORNING_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
          const AFTERNOON_SLOTS = ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
          const EVENING_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30']
          if (activeSchedule.shiftType === 'MORNING') allowedSlots = MORNING_SLOTS
          else if (activeSchedule.shiftType === 'AFTERNOON') allowedSlots = AFTERNOON_SLOTS
          else if (activeSchedule.shiftType === 'EVENING') allowedSlots = EVENING_SLOTS
        } else {
          // Bác sĩ không làm việc ngày này → đánh dấu nghỉ, không hiển thị slot nào
          setDoctorOffDay(true)
          setAllScheduleSlots([])
          setAvailableSlots([])
          setLoadingSlots(false)
          return []
        }
      } catch {
        // API lịch làm việc lỗi → scheduleApiOk = false, dùng fallback bên dưới
        scheduleApiOk = false
        allowedSlots = null
      }

      const slots = await slotService.getAvailableSlots(doctor.id, selectedDate)
      const filteredBySchedule = allowedSlots
        ? slots.filter((s) => allowedSlots!.includes(s))
        : slots

      // Cập nhật toàn bộ slots của ca (để grid ổn định)
      if (allowedSlots) setAllScheduleSlots(allowedSlots)

      if (filteredBySchedule.length > 0) {
        setAvailableSlots(filteredBySchedule)
        return filteredBySchedule
      } else if (scheduleApiOk && allowedSlots) {
        // API hoạt động tốt, bác sĩ có ca nhưng tất cả slots đã bị đặt
        setAvailableSlots([])
        return []
      } else if (!scheduleApiOk) {
        // API lỗi → fallback để tránh màn hình trống hoàn toàn
        const fallback = [
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        ]
        setAvailableSlots(fallback)
        return fallback
      } else {
        setAvailableSlots([])
        return []
      }
    } catch {
      const fallback = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ]
      setAvailableSlots(fallback)
      return fallback
    } finally {
      setLoadingSlots(false)
    }
  }, [doctor.id, selectedDate])

  // Load available slots when date or doctor changes
  useEffect(() => {
    if (step === 1) fetchAvailableSlots()
  }, [selectedDate, doctor.id, step, fetchAvailableSlots])

  // Polling realtime: cập nhật slot không có sẵn loading (silent refresh)
  useEffect(() => {
    if (step !== 1 || doctorOffDay) return
    const poll = setInterval(async () => {
      try {
        const fresh = await slotService.getAvailableSlots(doctor.id, selectedDate)
        // Lọc theo allScheduleSlots nếu có
        const filtered = allScheduleSlots.length > 0
          ? fresh.filter((s) => allScheduleSlots.includes(s))
          : fresh
        setAvailableSlots(filtered)
      } catch {
        // ignore silent refresh error
      }
    }, 8000)
    return () => clearInterval(poll)
  }, [step, doctor.id, selectedDate, allScheduleSlots, doctorOffDay])

  // Khi người dùng đổi ngày, release lock hiện tại
  useEffect(() => {
    if (currentLockId) {
      slotService.unlockSlot(currentLockId)
      setCurrentLockId(null)
      currentLockIdRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  // Cleanup: release lock khi đóng modal — dùng ref để tránh stale closure
  useEffect(() => {
    currentLockIdRef.current = currentLockId
  }, [currentLockId])

  useEffect(() => {
    return () => {
      if (currentLockIdRef.current) {
        slotService.unlockSlot(currentLockIdRef.current)
      }
    }
  }, []) // chỉ chạy cleanup khi unmount, không chạy khi currentLockId thay đổi

  const handleSelectSlot = async (time: string) => {
    if (!isLoggedIn) {
      // Cho phép chọn slot mà không cần login, sẽ check lúc submit
      setSelectedTime(time)
      return
    }
    if (lockingSlot === time) return // đang xử lý slot này rồi

    setLockingSlot(time)
    setError(null)
    try {
      // Release lock cũ nếu có
      if (currentLockId) {
        await slotService.unlockSlot(currentLockId)
        setCurrentLockId(null)
      }
      // Lock slot mới
      const lock = await slotService.lockSlot(doctor.id, selectedDate, time + ':00')
      setCurrentLockId(lock.id)
      setSelectedTime(time)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (msg?.includes('locked') || msg?.includes('booked')) {
        // Slot bị người khác chiếm mất
        // Refresh với đầy đủ schedule filter
        setError('Slot này vừa được người khác chọn. Đang làm mới danh sách...')
        const refreshed = await fetchAvailableSlots()
        if (refreshed && refreshed.length > 0) setSelectedTime(refreshed[0])
      } else {
        setError('Không thể chọn slot này. Vui lòng thử lại.')
      }
    } finally {
      setLockingSlot(null)
    }
  }

  const handleNextStep = () => {
    if (step === 2) {
      if (!patientName.trim()) {
        setError('Vui lòng nhập họ và tên của bạn.')
        return
      }
      if (!patientPhone.trim() || patientPhone.length < 9) {
        setError('Vui lòng nhập số điện thoại hợp lệ.')
        return
      }
    }
    setError(null)
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setError(null)
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      onClose()
      onRequestLogin()
      return
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let activeLockId = currentLockId

      // Nếu chưa lock (user chưa login lúc chọn slot), lock ngay
      if (!activeLockId) {
        const slotLock = await slotService.lockSlot(
          doctor.id,
          selectedDate,
          selectedTime + ':00'
        )
        activeLockId = slotLock.id
        setCurrentLockId(slotLock.id)
      }

      // Tạo appointment
      const apt = await bookingService.createAppointment(
        activeLockId,
        parseInt(doctor.specialtyId),
        patientName,
        patientPhone,
        patientNotes
      )
      setCurrentLockId(null) // lock đã được dùng, clear đi

      const displayId = 'MB-' + String(apt.id).padStart(6, '0')
      const newAppointment: PatientAppointment = {
        id: displayId,
        backendId: apt.id,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorTitle: doctor.title,
        specialtyName: doctor.specialtyName,
        hospital: doctor.hospital,
        date: selectedDate,
        timeSlot: selectedTime,
        patientName,
        patientPhone,
        patientNotes,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      }

      setCreatedAppointment(newAppointment)
      onBookingSuccess(newAppointment)

      // Gọi Payment API (trừ bank transfer)
      if (paymentMethod === 'vnpay' || paymentMethod === 'momo') {
        try {
          const paymentRes = await paymentService.createPayment({
            appointmentId: apt.id,
            amount: doctor.price,
            paymentMethod: paymentMethod.toUpperCase(),
            orderInfo: `Thanh toan kham benh - Ma hen: ${displayId}`,
            patientEmail: user?.email ?? '',
            patientName: patientName,
            doctorName: `${doctor.title} ${doctor.name}`,
            specialty: doctor.specialtyName,
            appointmentDate: selectedDate,           // truyền ngày thực tế
            slotTime: selectedTime + ':00',           // truyền giờ thực tế
          })
          if (paymentRes.paymentUrl) {
            window.location.href = paymentRes.paymentUrl
            return
          }
        } catch (payErr) {
          console.error('Payment API error:', payErr)
          setError('Đặt lịch thành công nhưng không thể tạo link thanh toán. Vui lòng thanh toán tại quầy.')
        }
      }

      setStep(4)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Đặt lịch thất bại. Slot này có thể đã được đặt. Vui lòng chọn thời gian khác.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + ' đ'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all duration-150"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-outline-variant/20">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-surface">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=a72a7c&color=fff`
                }}
              />
            </div>
            <div>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                {doctor.specialtyName}
              </span>
              <h3 className="font-bold text-lg text-on-surface mt-1">
                {doctor.title} {doctor.name}
              </h3>
              <p className="text-xs text-on-surface-variant">{doctor.hospital}</p>
            </div>
          </div>

          {/* Step indicator */}
          {step <= 3 && (
            <div className="mb-8">
              <div className="flex justify-between text-xs text-on-surface-variant mb-2 px-1">
                <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Ngày giờ</span>
                <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Bệnh nhân</span>
                <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Thanh toán</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" /> Chọn ngày khám
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedDate(opt.value)}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-center ${
                          selectedDate === opt.value
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary'
                        }`}
                      >
                        {opt.label}
                        <span className="block text-xs font-normal opacity-85 mt-0.5">
                          {opt.value.split('-').reverse().slice(0, 2).join('/')}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-on-surface-variant ml-1 font-medium">
                      Hoặc chọn ngày khác:
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full py-2.5 px-4 mt-1 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Khung giờ điều trị
                  </h4>
                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-2">
                      {(allScheduleSlots.length > 0 ? allScheduleSlots : Array(8).fill('')).map((_, i) => (
                        <div key={i} className="h-[44px] rounded-xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredScheduleSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {filteredScheduleSlots.map((time) => {
                        const isAvailable = availableSlots.includes(time)
                        const isSelected = selectedTime === time
                        const isLocking = lockingSlot === time
                        const isLockedByMe = isSelected && currentLockId !== null
                        const isTaken = !isAvailable && !isSelected

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isTaken || isLocking}
                            onClick={() => !isTaken && handleSelectSlot(time)}
                            title={isTaken ? 'Khung giờ này đã được đặt' : time}
                            className={[
                              'h-[44px] rounded-xl text-sm font-semibold transition-all duration-200',
                              isTaken
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                                : isSelected && isLockedByMe
                                ? 'bg-primary text-white shadow-lg ring-2 ring-primary/30 scale-[1.04]'
                                : isSelected
                                ? 'bg-primary/80 text-white shadow-md scale-[1.04]'
                                : isLocking
                                ? 'bg-primary/15 text-primary cursor-wait'
                                : 'bg-rose-50 text-gray-700 hover:bg-rose-100 hover:scale-[1.04] active:scale-95',
                            ].join(' ')}
                          >
                            {isLocking ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              time
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-500">Đã hết khung giờ trống trong ngày này.</p>
                      <p className="text-xs text-gray-400 mt-1">Vui lòng chọn ngày khác.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div>
                    <p className="text-xs text-on-surface-variant">Chi phí dịch vụ</p>
                    <p className="text-xl font-black text-primary">{formatPrice(doctor.price)}</p>
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-hover active:scale-95 transition-all text-sm"
                  >
                    Tiếp tục
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Patient Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20 mb-2">
                  <p className="text-xs text-on-surface-variant">Lịch khám đã chọn:</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    🎯 {selectedTime} — ngày {selectedDate.split('-').reverse().join('-')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Họ và tên bệnh nhân{' '}
                      <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên đầy đủ..."
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Số điện thoại{' '}
                      <span className="text-primary">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại..."
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Triệu chứng / Yêu cầu đặc biệt
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả triệu chứng hoặc ghi chú..."
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-outline-variant/50 text-on-surface-variant hover:text-primary rounded-full transition-all text-sm"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-hover active:scale-95 transition-all text-sm"
                  >
                    Tiếp tục
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div>
                  <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Phương thức thanh toán
                  </h4>
                  <div className="space-y-3">
                    {[
                      { value: 'vnpay', label: 'Cổng thanh toán VNPay', desc: 'Thanh toán qua ví VNPay, quét mã QR hoặc thẻ ATM', badge: 'VNPAY', badgeColor: 'text-red-600 bg-red-50' },
                      { value: 'momo', label: 'Ví điện tử MoMo', desc: 'Xác thực nhanh bằng ứng dụng MoMo', badge: 'MOMO', badgeColor: 'text-pink-600 bg-pink-50' },
                      { value: 'bank', label: 'Chuyển khoản trực tiếp', desc: 'Quét mã QR số tài khoản ngân hàng MediBook', badge: 'BANK', badgeColor: 'text-emerald-700 bg-emerald-50' },
                    ].map((pm) => (
                      <label
                        key={pm.value}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === pm.value
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/30 bg-surface shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            value={pm.value}
                            checked={paymentMethod === pm.value}
                            onChange={() => setPaymentMethod(pm.value)}
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          <div>
                            <p className="text-sm font-bold text-on-surface">{pm.label}</p>
                            <p className="text-xs text-on-surface-variant">{pm.desc}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md ${pm.badgeColor}`}>
                          {pm.badge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Phí khám bệnh:</span>
                    <span>{formatPrice(doctor.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Phí hỗ trợ & Bảo hiểm y tế số:</span>
                    <span className="text-[#366b00] font-medium">Miễn phí dịch vụ</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-on-surface pt-1">
                    <span>Tổng cộng:</span>
                    <span className="text-lg text-primary">{formatPrice(doctor.price)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-outline-variant/50 text-on-surface-variant hover:text-primary rounded-full transition-all text-sm"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-hover active:scale-95 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đặt lịch & Thanh toán'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && createdAppointment && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-16 h-16 bg-[#366b00]/10 text-[#366b00] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-on-surface">Đặt lịch thành công!</h3>
                  <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                    Mã cuộc hẹn của bạn là{' '}
                    <span className="font-bold text-primary">{createdAppointment.id}</span>. Thông
                    tin đã được lưu trữ an toàn trong hồ sơ cá nhân.
                  </p>
                </div>

                <div className="bg-surface-container-low max-w-sm mx-auto p-5 rounded-2xl border border-outline-variant/30 text-left space-y-3">
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold border-b border-outline-variant/15 pb-1.5">
                    Phiếu thu cuộc hẹn điện tử
                  </p>
                  <div>
                    <span className="text-xs text-on-surface-variant">Bác sĩ:</span>
                    <p className="text-sm font-bold text-on-surface">
                      {doctor.title} {doctor.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant">Chuyên khoa:</span>
                    <p className="text-sm font-medium text-on-surface">{doctor.specialtyName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <div>
                      <span className="text-xs text-on-surface-variant">Thời gian:</span>
                      <p className="text-sm font-bold text-primary">{createdAppointment.timeSlot}</p>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant">Ngày khám:</span>
                      <p className="text-sm font-bold text-primary">
                        {createdAppointment.date.split('-').reverse().join('-')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl flex items-center gap-4 border border-outline-variant/20">
                    <QrCode className="w-12 h-12 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">Mã QR Check-in nhanh</p>
                      <p className="text-[10px] text-on-surface-variant">
                        Quét mã này tại quầy tiếp đón bệnh viện để vào phòng khám.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-surface border border-outline-variant/40 text-on-surface rounded-full text-sm hover:border-primary transition-all font-medium"
                  >
                    Đóng cửa sổ
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-hover shadow-sm transition-all"
                  >
                    Xem lịch của tôi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
