'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CalendarDays, LogIn } from 'lucide-react'
import { bookingService, patientDoctorService } from '@/services/patient-booking.service'
import { useAuthStore } from '@/store/auth-store'
import type { PatientAppointment } from '@/types/patient-booking'
import AppointmentList from '@/components/patient/AppointmentList'
import PatientLayout from '@/components/patient/PatientLayout'

export default function AppointmentsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  const [appointments, setAppointments] = useState<PatientAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return }
    setLoading(true)
    try {
      const [raw, doctors] = await Promise.all([
        bookingService.getMyAppointments(),
        patientDoctorService.getAll(),
      ])
      const mapped: PatientAppointment[] = raw.map((apt) => {
        const doc = doctors.find((d) => d.id === apt.doctorId)
        return {
          id: 'MB-' + String(apt.id).padStart(6, '0'),
          backendId: apt.id,
          doctorId: apt.doctorId,
          doctorName: doc?.name || 'Bác sĩ',
          doctorTitle: doc?.title || '',
          specialtyName: doc?.specialtyName || '',
          hospital: doc?.hospital || 'Phòng khám MediBook',
          date: apt.appointmentDate,
          timeSlot: apt.slotTime?.substring(0, 5) || '',
          patientName: apt.patientName || user?.email || '',
          patientPhone: apt.patientPhone || '',
          paymentMethod: '',
          status: apt.status === 'CANCELLED' ? 'cancelled' : apt.status === 'COMPLETED' ? 'completed' : 'upcoming',
          createdAt: apt.createdAt,
        }
      })
      setAppointments(mapped)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleCancel = async (id: string, backendId?: number) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này không?')
    if (!confirmed) return
    setCancellingId(id)
    if (backendId) {
      try {
        await bookingService.cancelAppointment(backendId)
      } catch {
        alert('Không thể hủy lịch hẹn. Vui lòng thử lại.')
        setCancellingId(null)
        return
      }
    }
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' as const } : apt))
    )
    setCancellingId(null)
  }

  const upcoming = appointments.filter((a) => a.status === 'upcoming')
  const past = appointments.filter((a) => a.status !== 'upcoming')

  return (
    <PatientLayout>
      {/* Banner */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 border-b border-outline-variant/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-3">
          <span className="text-xs uppercase font-black text-primary tracking-widest">Tra cứu hồ sơ</span>
          <h1 className="text-4xl font-black text-on-surface">Lịch khám của tôi</h1>
          <p className="text-sm text-on-surface-variant">Quản lý lịch hẹn, xem bệnh án và theo dõi trạng thái cuộc hẹn.</p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-6 md:px-12">
        {/* Not logged in */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center border border-outline-variant/20 shadow-sm space-y-5"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-on-surface">Bạn chưa đăng nhập</h3>
            <p className="text-sm text-on-surface-variant">Vui lòng đăng nhập để xem lịch khám và quản lý cuộc hẹn của bạn.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white text-sm font-extrabold rounded-full hover:bg-primary-hover active:scale-95 transition-all border-none shadow-md cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Về trang chủ để đăng nhập
            </button>
          </motion.div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-extrabold text-on-surface text-base">Lịch hẹn sắp tới</h2>
                  <p className="text-xs text-on-surface-variant">{upcoming.length} cuộc hẹn đang chờ</p>
                </div>
              </div>
              <AppointmentList
                appointments={upcoming}
                onCancel={handleCancel}
              />
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-surface-container-high rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-on-surface text-base">Lịch sử khám bệnh</h2>
                    <p className="text-xs text-on-surface-variant">{past.length} cuộc hẹn đã qua</p>
                  </div>
                </div>
                <AppointmentList appointments={past} onCancel={handleCancel} />
              </div>
            )}
          </div>
        )}
      </section>
    </PatientLayout>
  )
}
