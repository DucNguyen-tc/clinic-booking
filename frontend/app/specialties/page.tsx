'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Search, Stethoscope } from 'lucide-react'
import * as Icons from 'lucide-react'
import { specialtyService } from '@/services/patient-booking.service'
import type { PatientSpecialty } from '@/types/patient-booking'
import PatientLayout from '@/components/patient/PatientLayout'

const FALLBACK_SPECIALTIES: PatientSpecialty[] = [
  { id: 'tim-mach', name: 'Tim mạch', count: 0, iconName: 'Heart' },
  { id: 'nhi-khoa', name: 'Nhi khoa', count: 0, iconName: 'Baby' },
  { id: 'da-lieu', name: 'Da liễu', count: 0, iconName: 'Sparkles' },
  { id: 'than-kinh', name: 'Thần kinh', count: 0, iconName: 'Brain' },
  { id: 'nha-khoa', name: 'Nha khoa', count: 0, iconName: 'Smile' },
  { id: 'tam-ly', name: 'Tâm lý', count: 0, iconName: 'Activity' },
]

export default function SpecialtiesPage() {
  const router = useRouter()
  const [specialties, setSpecialties] = useState<PatientSpecialty[]>(FALLBACK_SPECIALTIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    specialtyService.getAll().then((data) => {
      if (data.length > 0) setSpecialties(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = specialties.filter((s) =>
    s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  )

  return (
    <PatientLayout>
      {/* Hero banner */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase font-black text-primary tracking-widest">Danh mục dịch vụ</span>
          <h1 className="text-4xl font-black text-on-surface">Chuyên khoa y tế</h1>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Chọn chuyên khoa phù hợp để tìm bác sĩ chuyên trách và đặt lịch khám nhanh chóng.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto mt-6 relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm chuyên khoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-outline-variant/30 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 max-w-7xl mx-auto px-6 md:px-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Stethoscope className="w-12 h-12 text-primary/30 mx-auto" />
            <p className="text-on-surface-variant font-medium">Không tìm thấy chuyên khoa phù hợp.</p>
            <button onClick={() => setSearch('')} className="text-xs text-primary font-bold hover:underline">Xóa tìm kiếm</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((spec, i) => {
              const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[spec.iconName]
              return (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(`/doctors?specialty=${spec.id}`)}
                  className="group p-6 rounded-2xl clinical-shadow border border-outline-variant/10 bg-white hover:border-primary/50 hover:shadow-md transition-all text-center cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-4 transition-all">
                    {IconComponent ? <IconComponent className="w-7 h-7" /> : <Stethoscope className="w-7 h-7" />}
                  </div>
                  <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{spec.name}</h3>
                  <p className="text-xs mt-0.5 text-on-surface-variant">
                    {spec.count > 0 ? `${spec.count} Bác sĩ` : 'Chuyên khoa'}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </PatientLayout>
  )
}
