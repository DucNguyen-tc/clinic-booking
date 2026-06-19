'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, Loader2, AlertCircle, X } from 'lucide-react'
import type { PatientDoctor, PatientSpecialty } from '@/types/patient-booking'
import { patientDoctorService, specialtyService } from '@/services/patient-booking.service'
import { useAuthStore } from '@/store/auth-store'
import DoctorCard from '@/components/patient/DoctorCard'
import BookingModal from '@/components/patient/BookingModal'
import PatientLayout from '@/components/patient/PatientLayout'

const FALLBACK_SPECIALTIES: PatientSpecialty[] = [
  { id: 'tim-mach', name: 'Tim mạch', count: 0, iconName: 'Heart' },
  { id: 'nhi-khoa', name: 'Nhi khoa', count: 0, iconName: 'Baby' },
  { id: 'da-lieu', name: 'Da liễu', count: 0, iconName: 'Sparkles' },
  { id: 'than-kinh', name: 'Thần kinh', count: 0, iconName: 'Brain' },
  { id: 'nha-khoa', name: 'Nha khoa', count: 0, iconName: 'Smile' },
  { id: 'tam-ly', name: 'Tâm lý', count: 0, iconName: 'Activity' },
]

function DoctorsContent() {
  const searchParams = useSearchParams()
  const specialtyParam = searchParams.get('specialty')

  const { isAuthenticated } = useAuthStore()

  const [doctorsList, setDoctorsList] = useState<PatientDoctor[]>([])
  const [specialtiesList, setSpecialtiesList] = useState<PatientSpecialty[]>(FALLBACK_SPECIALTIES)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSpecialties, setLoadingSpecialties] = useState(true)

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(specialtyParam)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('Tất cả địa điểm')
  const [searchDate, setSearchDate] = useState('')
  const [activeDoctor, setActiveDoctor] = useState<PatientDoctor | null>(null)
  const [showLoginHint, setShowLoginHint] = useState(false)

  const fetchDoctors = useCallback(async (specialtyNumericId?: number) => {
    setLoadingDoctors(true)
    try {
      const docs = await patientDoctorService.getAll(specialtyNumericId)
      setDoctorsList(docs)
    } catch {
      // keep existing
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  useEffect(() => {
    specialtyService.getAll().then((data) => {
      if (data.length > 0) setSpecialtiesList(data)
    }).catch(() => {}).finally(() => setLoadingSpecialties(false))
    fetchDoctors()
  }, [fetchDoctors])

  // When specialty filter changes → reload doctors
  useEffect(() => {
    const spec = selectedSpecialty ? specialtiesList.find((s) => s.id === selectedSpecialty) : null
    fetchDoctors(spec?.numericId)
  }, [selectedSpecialty, specialtiesList, fetchDoctors])

  // Apply client-side filters (search text + location)
  const filteredDoctors = doctorsList.filter((doc) => {
    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(searchQuery)
    const matchesKeyword = !q || normalize(doc.name).includes(q) || normalize(doc.hospital).includes(q) || normalize(doc.specialtyName).includes(q)
    const matchesLocation = selectedLocation === 'Tất cả địa điểm' || doc.location.toLowerCase().includes(selectedLocation.toLowerCase())
    return matchesKeyword && matchesLocation
  })

  const clearFilters = () => {
    setSelectedSpecialty(null)
    setSearchQuery('')
    setSelectedLocation('Tất cả địa điểm')
    setSearchDate('')
  }

  const hasFilters = selectedSpecialty || searchQuery || selectedLocation !== 'Tất cả địa điểm' || searchDate

  return (
    <>
      {/* Banner */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs uppercase font-black text-primary tracking-widest">Đội ngũ chuyên gia</span>
            <h1 className="text-4xl font-black text-on-surface">Danh sách bác sĩ</h1>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
              Tìm bác sĩ chuyên khoa phù hợp và đặt lịch khám trực tuyến ngay hôm nay.
            </p>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-3xl clinical-shadow-lg p-6 border border-outline-variant/25">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Tìm kiếm</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tên bác sĩ hoặc chuyên khoa..."
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Chuyên khoa</label>
                <select
                  value={selectedSpecialty || ''}
                  onChange={(e) => setSelectedSpecialty(e.target.value || null)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {loadingSpecialties
                    ? <option disabled>Đang tải...</option>
                    : specialtiesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                  }
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Khu vực</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option>Tất cả địa điểm</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Ngày khám dự kiến</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="mt-4 pt-4 border-t border-outline-variant/15 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-on-surface-variant font-bold">Bộ lọc:</span>
                {selectedSpecialty && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                    {specialtiesList.find((s) => s.id === selectedSpecialty)?.name}
                    <button onClick={() => setSelectedSpecialty(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedLocation !== 'Tất cả địa điểm' && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                    {selectedLocation}
                    <button onClick={() => setSelectedLocation('Tất cả địa điểm')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchDate && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                    {searchDate.split('-').reverse().join('/')}
                    <button onClick={() => setSearchDate('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-[10px] text-red-600 hover:underline font-extrabold ml-1">
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Doctor grid */}
      <section className="py-16 max-w-7xl mx-auto px-6 md:px-12">
        {/* Result count */}
        {!loadingDoctors && (
          <p className="text-xs text-on-surface-variant mb-6 font-medium">
            Hiển thị <strong className="text-primary">{filteredDoctors.length}</strong> bác sĩ
            {selectedSpecialty ? ` trong chuyên khoa "${specialtiesList.find((s) => s.id === selectedSpecialty)?.name}"` : ''}
          </p>
        )}

        {loadingDoctors ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DoctorCard
                  doctor={doc}
                  onBook={(doctor) => {
                    if (!isAuthenticated) {
                      setShowLoginHint(true)
                      setTimeout(() => setShowLoginHint(false), 3000)
                      return
                    }
                    setActiveDoctor(doctor)
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-outline-variant/20 shadow-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-primary mx-auto opacity-70" />
            <h4 className="font-extrabold text-on-surface text-base">Không tìm thấy bác sĩ phù hợp</h4>
            <p className="text-xs text-on-surface-variant">
              {doctorsList.length === 0 ? 'Không thể kết nối tới server.' : 'Thử xóa bộ lọc để xem tất cả bác sĩ.'}
            </p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white text-xs font-extrabold rounded-full cursor-pointer hover:bg-primary-hover border-none">
              Xóa bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Login hint toast */}
      <AnimatePresence>
        {showLoginHint && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-white px-6 py-3 rounded-full text-xs font-bold shadow-xl z-50"
          >
            Vui lòng đăng nhập để đặt lịch khám.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking modal */}
      <AnimatePresence>
        {activeDoctor && (
          <BookingModal
            doctor={activeDoctor}
            onClose={() => setActiveDoctor(null)}
            onBookingSuccess={() => setActiveDoctor(null)}
            isLoggedIn={isAuthenticated}
            onRequestLogin={() => {}}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function DoctorsPage() {
  return (
    <PatientLayout>
      <Suspense fallback={
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }>
        <DoctorsContent />
      </Suspense>
    </PatientLayout>
  )
}
