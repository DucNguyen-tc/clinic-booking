'use client'

import { Calendar, Clock, MapPin, XCircle, FileText, QrCode, Stethoscope } from 'lucide-react'
import type { PatientAppointment } from '@/types/patient-booking'
import { useState } from 'react'
import { MedicalRecordModal } from './MedicalRecordModal'
import { AnimatePresence } from 'framer-motion'

interface AppointmentListProps {
  appointments: PatientAppointment[]
  onCancel: (id: string, backendId?: number) => void
}

export default function AppointmentList({ appointments, onCancel }: AppointmentListProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-outline-variant/20 shadow-xs">
        <p className="text-on-surface-variant font-medium text-sm">Bạn chưa có lịch khám nào được đặt.</p>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Sử dụng thanh tìm kiếm phía trên để đăng ký khám bệnh với các bác sĩ uy tín của chúng tôi.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="bg-white rounded-2xl p-6 border border-outline-variant/25 clinical-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {apt.id}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                  apt.status === 'upcoming'
                    ? 'bg-emerald-50 text-[#366b00]'
                    : apt.status === 'completed'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {apt.status === 'upcoming' ? 'Chưa diễn ra' : apt.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Đặt lúc: {new Date(apt.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-on-surface">
                {apt.doctorTitle} {apt.doctorName}
              </h4>
              <p className="text-xs text-primary font-semibold">{apt.specialtyName}</p>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{apt.hospital}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/15">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {apt.date.split('-').reverse().join('-')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {apt.timeSlot}
              </span>
              {apt.patientName && (
                <span className="flex items-center gap-1.5">👤 {apt.patientName}</span>
              )}
            </div>

            {apt.patientNotes && (
              <p className="text-xs text-on-surface-variant flex items-start gap-1 p-1">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="italic">"{apt.patientNotes}"</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-3 border-t border-outline-variant/10 md:border-t-0 pt-4 md:pt-0 shrink-0">
            {apt.status === 'upcoming' && (
              <>
                <div className="flex items-center gap-3 bg-primary/5 p-2 rounded-xl border border-primary/10">
                  <QrCode className="w-12 h-12 text-primary" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-on-surface">Mã tiếp đón</p>
                    <p className="text-xs font-mono font-black text-primary">{apt.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => onCancel(apt.id, apt.backendId)}
                  className="px-4 py-2 border border-red-200 hover:border-red-600 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-100 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy lịch hẹn
                </button>
              </>
            )}
            {apt.status === 'cancelled' && (
              <span className="text-xs text-on-surface-variant font-medium self-center italic">
                Đã hủy cuộc hẹn
              </span>
            )}
            {apt.status === 'completed' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-on-surface-variant font-medium self-center italic">
                  Đã hoàn thành khám
                </span>
                <button
                  onClick={() => setSelectedRecordId(apt.backendId ?? null)}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-100 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  Xem bệnh án
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {selectedRecordId && (
          <MedicalRecordModal
            appointmentId={selectedRecordId}
            onClose={() => setSelectedRecordId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
