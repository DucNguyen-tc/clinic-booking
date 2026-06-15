'use client'

import { Star, MapPin } from 'lucide-react'
import type { PatientDoctor } from '@/types/patient-booking'

interface DoctorCardProps {
  doctor: PatientDoctor
  onBook: (doctor: PatientDoctor) => void
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + ' đ'

  return (
    <div className="bg-white rounded-2xl clinical-shadow overflow-hidden group border border-outline-variant/15 flex flex-col hover:border-primary transition-all duration-300">
      <div className="h-64 overflow-hidden relative bg-surface-container">
        <img
          src={doctor.imageUrl}
          alt={doctor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const el = e.currentTarget
            el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=a72a7c&color=fff&size=400`
          }}
        />
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-black text-on-surface">{doctor.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {doctor.specialtyName}
          </span>

          <h4 className="font-bold text-lg text-on-surface mt-3 leading-tight">
            {doctor.title} {doctor.name}
          </h4>

          <p className="text-xs font-semibold text-primary uppercase mt-1">
            {doctor.experience}
          </p>

          <div className="flex items-start gap-1.5 text-on-surface-variant text-xs mt-4">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="leading-relaxed">{doctor.hospital}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Chi phí dịch vụ:</span>
            <span className="text-sm font-bold text-primary">{formatPrice(doctor.price)}</span>
          </div>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover active:scale-95 transition-all text-sm cursor-pointer border-none shadow-sm"
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  )
}
