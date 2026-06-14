'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle, XCircle, Loader2, Home, Download, ArrowLeft,
  User, Calendar, Clock, Stethoscope, QrCode, Share2
} from 'lucide-react'

// ─── Booking ticket data shape ────────────────────────────────────────────────
interface TicketData {
  code: string          // e.g. #MB-2024-9982
  patientName: string
  patientDob: string
  patientEmail: string
  patientPhone: string
  doctorName: string
  specialty: string
  appointmentDate: string
  timeSlot: string
  transactionNo: string | null
}

// Build a simple deterministic QR-like SVG from a string (no external library needed)
function MiniQR({ value }: { value: string }) {
  // Create a 7x7 grid pattern based on hash of value
  const hash = value.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
  const grid: boolean[][] = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      // Finder patterns (corners)
      if ((r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2)) return true
      return ((hash >> (r * 7 + c)) & 1) === 1
    })
  )

  return (
    <svg viewBox="0 0 7 7" className="w-full h-full" shapeRendering="crispEdges">
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#1a1a2e" />
          ) : null
        )
      )}
    </svg>
  )
}

// ─── Progress stepper ─────────────────────────────────────────────────────────
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Đặt lịch', 'Xác nhận', 'Khám bệnh']
  return (
    <div className="flex items-center justify-center gap-0 mt-6">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done ? 'bg-primary border-primary text-white' : active ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {done ? <CheckCircle className="w-4 h-4" /> : num}
              </div>
              <span className={`text-xs font-medium ${active || done ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-1 ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

import { appointmentService } from '@/services/appointment.service'
import { patientDoctorService } from '@/services/patient-booking.service'
import { useAuthStore } from '@/store/auth-store'

// ─── Main ticket component ────────────────────────────────────────────────────
function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [ticket, setTicket] = useState<TicketData | null>(null)

  useEffect(() => {
    const fetchData = async (aptId: string, txnNo: string | null) => {
      try {
        const apt = await appointmentService.getAppointmentById(aptId)
        const patientInfo = await appointmentService.getPatientInfo(apt.patientId).catch(() => null)
        const doctors = await patientDoctorService.getAll()
        const doctor = doctors.find(d => d.id === apt.doctorId)

        const year = new Date().getFullYear()

        setTicket({
          code: `#MB-${year}-${aptId.padStart(4, '0')}`,
          patientName: apt.patientName || patientInfo?.fullName || 'Bệnh nhân',
          patientDob: patientInfo?.dob ? patientInfo.dob.split('-').reverse().join('/') : 'Chưa cập nhật',
          patientEmail: user?.email || 'Chưa cập nhật',
          patientPhone: apt.patientPhone || patientInfo?.phone || 'Chưa cập nhật',
          doctorName: doctor ? `${doctor.title} ${doctor.name}` : 'Bác sĩ MediBook',
          specialty: doctor ? doctor.specialtyName : 'Khoa Khám Bệnh',
          appointmentDate: apt.appointmentDate.split('-').reverse().join('/'),
          timeSlot: apt.slotTime.substring(0, 5),
          transactionNo: txnNo,
        })
        setStatus('success')
      } catch (e) {
        console.error('Failed to fetch ticket data:', e)
        setStatus('failed')
      }
    }

    const responseCode = searchParams.get('vnp_ResponseCode')
    const txnRef = searchParams.get('vnp_TxnRef')
    const txnNo = searchParams.get('vnp_TransactionNo')
    const orderId = searchParams.get('orderId')
    const resultCode = searchParams.get('resultCode')

    if (responseCode !== null) {
      if (responseCode === '00' && txnRef) {
        const aptId = txnRef.split('-')[0]
        fetchData(aptId, txnNo)
      } else {
        setStatus('failed')
      }
    } else if (resultCode !== null) {
      if (resultCode === '0' && orderId) {
        const aptId = orderId.split('-')[0]
        fetchData(aptId, null)
      } else {
        setStatus('failed')
      }
    } else {
      // Missing params
      setStatus('failed')
    }
  }, [searchParams])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-14 h-14 animate-spin text-primary mx-auto" />
          <p className="text-on-surface font-semibold">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    )
  }

  // ── Failed ───────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Thanh toán thất bại</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Giao dịch không thành công. Lịch hẹn vẫn được giữ trong 15 phút. Vui lòng thử lại.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-5 py-3 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Success: Phiếu Khám Điện Tử ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-start py-8 px-4">
      {/* Header branding */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black text-primary">MediBook</span>
      </div>

      {/* Ticket card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-pink-400 to-rose-400" />

        {/* Success badge */}
        <div className="px-8 pt-8 pb-0">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wide">
            <CheckCircle className="w-4 h-4" />
            Xác nhận thành công
          </div>
        </div>

        {/* Title */}
        <div className="px-8 pt-4 pb-2">
          <h1 className="text-3xl font-black text-gray-900">Phiếu Khám Điện Tử</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mã số phiếu:{' '}
            <span className="text-primary font-bold">{ticket?.code}</span>
          </p>
        </div>

        {/* Stepper */}
        <div className="px-8">
          <Stepper step={2} />
        </div>

        {/* Divider */}
        <div className="mx-8 my-5 border-t border-dashed border-gray-200" />

        {/* Body: Patient info + QR */}
        <div className="px-8 pb-6 grid grid-cols-3 gap-6">
          {/* Left: Patient + Appointment details */}
          <div className="col-span-2 space-y-5">
            {/* Patient info */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <User className="w-4 h-4" />
                <span className="font-bold text-sm uppercase tracking-wide">Thông Tin Bệnh Nhân</span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Họ tên</p>
                  <p className="font-bold text-gray-900">{ticket?.patientName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Ngày sinh</p>
                  <p className="font-bold text-gray-900">{ticket?.patientDob}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-700 text-xs">{ticket?.patientEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Số điện thoại</p>
                  <p className="font-bold text-gray-900">{ticket?.patientPhone}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Appointment details */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <Calendar className="w-4 h-4" />
                <span className="font-bold text-sm uppercase tracking-wide">Chi Tiết Lịch Hẹn</span>
              </div>

              {/* Doctor card */}
              <div className="bg-rose-50 rounded-xl p-4 mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bác sĩ phụ trách</p>
                <p className="font-black text-gray-900">{ticket?.doctorName}</p>
                <p className="text-xs text-gray-500 italic">{ticket?.specialty}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Ngày khám</p>
                    <p className="font-bold text-gray-900 text-xs">{ticket?.appointmentDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Khung giờ</p>
                    <p className="font-bold text-gray-900 text-xs">{ticket?.timeSlot}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: QR + Status */}
          <div className="col-span-1 flex flex-col items-center gap-3">
            {/* Status badge */}
            <div className="w-full bg-primary text-white text-center py-2 rounded-xl">
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5">Trạng thái</p>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span className="font-black text-sm">Đã xác nhận</span>
              </div>
            </div>

            {/* QR code */}
            <div className="w-full border-2 border-gray-200 rounded-xl p-2 aspect-square flex items-center justify-center">
              <MiniQR value={ticket?.code || 'MB-QR'} />
            </div>

            <p className="text-center text-xs text-gray-500 leading-tight">
              Vui lòng đưa mã này cho nhân viên lễ tân khi đến phòng khám để hoàn tất thủ tục check-in nhanh.
            </p>
          </div>
        </div>

        {/* Divider with cutout */}
        <div className="relative mx-0 my-0">
          <div className="border-t border-dashed border-gray-200 mx-6" />
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-50 rounded-full border border-rose-100" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-50 rounded-full border border-rose-100" />
        </div>

        {/* Footer actions */}
        <div className="px-8 py-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-full hover:opacity-90 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Tải file PDF
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3 rounded-full hover:bg-primary/5 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </button>
        </div>
      </div>

      {/* Clinic footer info */}
      <div className="mt-6 max-w-xl w-full flex justify-between items-center text-xs text-gray-500 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 text-primary">📍</div>
          <span>Tầng 4, Tòa nhà Medical Hub, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4">📞</div>
          <span>Hotline: 1900 1234</span>
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-rose-50">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
