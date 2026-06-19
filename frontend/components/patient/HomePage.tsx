'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Activity,
  CalendarDays,
  UserCheck,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import * as Icons from 'lucide-react'

import type { PatientDoctor, PatientSpecialty } from '@/types/patient-booking'
import { patientDoctorService, specialtyService } from '@/services/patient-booking.service'
import DoctorCard from '@/components/patient/DoctorCard'
import BookingModal from '@/components/patient/BookingModal'
import PatientLayout from '@/components/patient/PatientLayout'
import { useAuthStore } from '@/store/auth-store'
import { AnimatePresence } from 'framer-motion'

const FALLBACK_SPECIALTIES: PatientSpecialty[] = [
  { id: 'tim-mach', name: 'Tim mạch', count: 0, iconName: 'Heart' },
  { id: 'nhi-khoa', name: 'Nhi khoa', count: 0, iconName: 'Baby' },
  { id: 'da-lieu', name: 'Da liễu', count: 0, iconName: 'Sparkles' },
  { id: 'than-kinh', name: 'Thần kinh', count: 0, iconName: 'Brain' },
  { id: 'nha-khoa', name: 'Nha khoa', count: 0, iconName: 'Smile' },
  { id: 'tam-ly', name: 'Tâm lý', count: 0, iconName: 'Activity' },
]

export default function PatientHomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const [doctorsList, setDoctorsList] = useState<PatientDoctor[]>([])
  const [specialtiesList, setSpecialtiesList] = useState<PatientSpecialty[]>(FALLBACK_SPECIALTIES)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSpecialties, setLoadingSpecialties] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('Tất cả địa điểm')
  const [searchDate, setSearchDate] = useState('')
  const [activeDoctor, setActiveDoctor] = useState<PatientDoctor | null>(null)
  const [showLoginHint, setShowLoginHint] = useState(false)

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true)
    try {
      const docs = await patientDoctorService.getAll()
      setDoctorsList(docs)
    } catch {
      // silent fail
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

  // Navigate to doctors page with optional filters
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedLocation !== 'Tất cả địa điểm') params.set('location', selectedLocation)
    if (searchDate) params.set('date', searchDate)
    router.push(`/doctors?${params.toString()}`)
  }

  // Preview: first 6 specialties, first 3 doctors
  const previewSpecialties = specialtiesList.slice(0, 6)
  const previewDoctors = doctorsList.slice(0, 3)

  return (
    <PatientLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-12 pb-24 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight">
              Không còn phải chờ đợi<br />
              <span className="text-primary italic relative">
                tại phòng khám!
                <span className="absolute bottom-0.5 left-0 w-full h-1 bg-primary/30 rounded-full" />
              </span>
            </h1>

            <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-lg">
              Đặt lịch khám bệnh nhanh chóng với bác sĩ uy tín — Tư vấn trực tuyến — Nhận kết quả ngay.
              Giải pháp y tế số hiện đại được tin tưởng bởi hơn 500.000 người Việt.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/doctors"
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 text-xs uppercase tracking-wider"
              >
                <span>Đặt lịch khám ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/specialties"
                className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary/5 font-black rounded-full transition-all text-xs uppercase tracking-wider"
              >
                Tìm bác sĩ chuyên khoa
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl" />

            <div className="heart-shape w-80 h-80 sm:w-96 sm:h-96 overflow-hidden clinical-shadow border-4 border-white bg-surface-container-low transition-all duration-500 hover:scale-[1.01]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAki2IrfF1r3DB-VYzCo-VSQldXOnEcUbh4SpIflqHpDv3k2HmvbVREk2yXHqUXeV7rYuRUa6bFIj45Ys4n_RIsyMBueTiQz5792Ap8NTKrfzAHcjEwQVStNEirPPU6V4bE6SWbZiOuBg0ZPAzeMgx1qKUVvntMfODxJbdMy1NCp5y3LPiUSKISDlAx74GSqX3RqGR3tkTFj9-l5L7hVEfm278c5eXyQolZaulaEasahhPnJvxf1S2afeLsuRAExlKyXfh5wLh9qPM"
                alt="Vietnamese doctor care patient"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="absolute bottom-6 -left-2 sm:-left-6 bg-white p-4 rounded-2xl clinical-shadow border border-outline-variant/30 flex items-center gap-3.5 max-w-xs hover:shadow-lg transition-all">
              <div className="w-11 h-11 bg-[#366b00]/10 text-[#366b00] rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-[#366b00] text-sm">1,200+ Bác Sĩ</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Chuyên gia đầu ngành toàn quốc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Finder */}
      <section className="relative z-20 -mt-10 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl clinical-shadow-lg p-6 md:p-8 border border-outline-variant/25">
          <h3 className="text-xs uppercase font-extrabold text-primary tracking-widest mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary shrink-0" /> Tìm kiếm thông minh bằng bộ lọc
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Chuyên khoa hoặc Bác sĩ</label>
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Tỉnh / Thành phố</label>
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

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-on-surface-variant/90 ml-1">Chọn ngày khám dự kiến</label>
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

            <div>
              <button
                onClick={handleSearch}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Bác Sĩ Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Preview */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-black text-primary tracking-widest">Danh mục dịch vụ</span>
              <h2 className="text-3xl font-black text-on-surface mt-1">Chuyên khoa phổ biến</h2>
              <p className="text-sm text-on-surface-variant mt-2">Duyệt qua các chuyên khoa để đặt lịch với đúng bác sĩ chuyên trách</p>
            </div>
            <Link
              href="/specialties"
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline border border-primary/20 px-4 py-2 rounded-full bg-white whitespace-nowrap"
            >
              Xem tất cả chuyên khoa <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingSpecialties ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {previewSpecialties.map((spec, i) => {
                const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[spec.iconName]
                return (
                  <motion.div
                    key={spec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => router.push(`/doctors?specialty=${spec.id}`)}
                    className="group p-6 rounded-2xl clinical-shadow border border-outline-variant/10 bg-white hover:border-primary/50 transition-all text-center cursor-pointer flex flex-col items-center justify-center hover:shadow-md"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center mb-4 transition-all">
                      {IconComponent ? <IconComponent className="w-7 h-7" /> : null}
                    </div>
                    <h3 className="font-bold text-sm text-on-surface">{spec.name}</h3>
                    <p className="text-xs mt-0.5 text-on-surface-variant">
                      {spec.count > 0 ? `${spec.count} Bác sĩ` : 'Chuyên khoa'}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Doctors Preview */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-primary tracking-widest">Đội ngũ chuyên gia</span>
              <h2 className="text-3xl font-black text-on-surface mt-1">Bác sĩ nổi bật</h2>
              <p className="text-sm text-on-surface-variant mt-2">Lựa chọn đặt lịch tư vấn với Tiến sĩ, Thạc sĩ ưu tú.</p>
            </div>
            <Link
              href="/doctors"
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline border border-primary/20 px-4 py-2 rounded-full bg-white whitespace-nowrap"
            >
              Xem tất cả bác sĩ <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingDoctors ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {previewDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
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
              ))}
            </div>
          )}

          {!loadingDoctors && doctorsList.length > 3 && (
            <div className="mt-10 text-center">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-all text-sm"
              >
                Xem thêm {doctorsList.length - 3} bác sĩ khác <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-black text-primary tracking-widest">Sơ đồ hướng dẫn</span>
            <h2 className="text-3xl font-black text-on-surface">Đặt lịch khám chỉ với 4 bước đơn giản</h2>
            <p className="text-sm text-on-surface-variant">Quy trình tối giản hóa giúp tiết kiệm tối đa thời gian chờ đợi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Chọn bác sĩ', desc: 'Tìm kiếm theo tên, học hàm hoặc lọc theo bệnh viện tuyến đầu.' },
              { num: '02', title: 'Chọn khung giờ rảnh', desc: 'Hệ thống gợi ý các ngày & thời điểm trống khớp lịch bác sĩ.' },
              { num: '03', title: 'Xác nhận thanh toán', desc: 'Thanh toán bảo mật qua VNPay, MoMo hoặc chuyển khoản.' },
              { num: '04', title: 'Nhận mã tiếp đón (QR)', desc: 'Nhận mã QR điện tử tích hợp nhắc lịch tự động và ưu tiên xếp chỗ.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl clinical-shadow border border-outline-variant/10 text-center hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-primary-container text-primary rounded-xl flex items-center justify-center mx-auto mb-5 font-bold text-lg">
                  {step.num}
                </div>
                <h4 className="font-bold text-on-surface mb-2">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-container-low/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
              {[
                { icon: Activity, title: 'Cập Nhật Thời Gian Thực', desc: 'Dữ liệu giờ trực của bác sĩ khớp thực tế, loại bỏ nguy cơ trùng lịch.' },
                { icon: CalendarDays, title: 'Tích Hợp Nhiều Ví Điện Tử', desc: 'MoMo, VNPay, thẻ nội địa và quốc tế bảo mật hàng đầu.', extraClass: 'lg:translate-y-4' },
                { icon: UserCheck, title: 'Quản Lý Hồ Sơ Điện Tử', desc: 'Lưu lịch sử khám, đơn thuốc và hóa đơn trực tuyến.' },
                { icon: ShieldCheck, title: 'Telemedicine Từ Xa', desc: 'Kết nối video độ nét cao để xin tư vấn khẩn cấp từ Tiến sĩ y khoa.', extraClass: 'lg:translate-y-4' },
              ].map((feature) => (
                <div key={feature.title} className={`bg-white p-6 rounded-2xl clinical-shadow border border-outline-variant/10 ${feature.extraClass || ''}`}>
                  <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-on-surface">{feature.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-2">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 text-left order-1 lg:order-2">
              <span className="text-xs uppercase font-black text-primary tracking-widest">Tiện ích ưu việt</span>
              <h2 className="text-3xl font-black text-on-surface leading-tight">
                Giải pháp chăm sóc y tế thông minh thời đại 4.0
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                MediBook không chỉ là công cụ đặt lịch. Chúng tôi tiên phong kiến tạo hệ sinh thái kết nối bảo mật giữa y bác sĩ tuyến đầu và người bệnh mọi miền.
              </p>
              <div className="space-y-3.5 pt-2">
                {[
                  'Liên kết mật thiết với hơn 50 bệnh viện lớn toàn quốc',
                  'Bảo mật thông tin dữ liệu bệnh án chuẩn HIPAA quốc tế',
                  'Đội ngũ kỹ thuật hỗ trợ khẩn cấp 24/7 tận tâm',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#366b00]/10 text-[#366b00] flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-on-surface">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login hint */}
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
    </PatientLayout>
  )
}
