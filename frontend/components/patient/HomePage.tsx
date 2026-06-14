'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Activity,
  Phone,
  Mail,
  Globe,
  Info,
  CalendarDays,
  UserCheck,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'

import type { PatientDoctor, PatientSpecialty, PatientAppointment } from '@/types/patient-booking'
import { patientDoctorService, specialtyService, bookingService } from '@/services/patient-booking.service'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth-store'
import DoctorCard from '@/components/patient/DoctorCard'
import SpecialtyCard from '@/components/patient/SpecialtyCard'
import BookingModal from '@/components/patient/BookingModal'
import AppointmentList from '@/components/patient/AppointmentList'
import ChatWidget from '@/components/patient/ChatWidget'

// Fallback specialties if API is unavailable
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
  // Data states
  const [doctorsList, setDoctorsList] = useState<PatientDoctor[]>([])
  const [specialtiesList, setSpecialtiesList] = useState<PatientSpecialty[]>(FALLBACK_SPECIALTIES)
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true)
  const [loadingSpecialties, setLoadingSpecialties] = useState<boolean>(true)

  // Filter states
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('Tất cả địa điểm')
  const [searchDate, setSearchDate] = useState<string>('')

  // Booking states
  const [activeDoctor, setActiveDoctor] = useState<PatientDoctor | null>(null)
  const [appointments, setAppointments] = useState<PatientAppointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(false)

  // Auth states
  const { isAuthenticated, user, accessToken, setAuth, logout: storeLogout } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null)
  const [authEmail, setAuthEmail] = useState<string>('')
  const [authPassword, setAuthPassword] = useState<string>('')
  const [authName, setAuthName] = useState<string>('')
  const [authLoading, setAuthLoading] = useState<boolean>(false)

  // Notifications (toasts)
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'info' | 'error'; text: string }[]>([])

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('trang-chu')

  // Refs for scrolling
  const finderRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  // Toast helper
  const addNotification = useCallback((type: 'success' | 'info' | 'error', text: string) => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)
    setNotifications((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4500)
  }, [])

  // Load doctors
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

  // Load specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecialties(true)
      try {
        const specs = await specialtyService.getAll()
        if (specs.length > 0) setSpecialtiesList(specs)
      } catch {
        // use fallback
      } finally {
        setLoadingSpecialties(false)
      }
    }
    fetchSpecialties()
    fetchDoctors()
  }, [fetchDoctors])

  // Reload doctors when specialty filter changes
  useEffect(() => {
    const spec = selectedSpecialty
      ? specialtiesList.find((s) => s.id === selectedSpecialty)
      : null
    fetchDoctors(spec?.numericId)
  }, [selectedSpecialty, specialtiesList, fetchDoctors])

  // Load appointments after login
  const fetchMyAppointments = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingAppointments(true)
    try {
      const [raw, doctors] = await Promise.all([
        bookingService.getMyAppointments(),
        patientDoctorService.getAll()
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
      setLoadingAppointments(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyAppointments()
    } else {
      setAppointments([])
    }
  }, [isAuthenticated, fetchMyAppointments])

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120
      const sections = [
        { id: 'chuyen-khoa', element: document.getElementById('chuyen-khoa') },
        { id: 'bac-si', element: document.getElementById('bac-si-kiem-tra') },
        { id: 'quy-trinh', element: document.getElementById('quy-trinh') },
        { id: 'lich-kham', element: document.getElementById('lich-kham') },
      ]
      let currentSection = 'trang-chu'
      for (const section of sections) {
        if (section.element && scrollPosition >= section.element.offsetTop) {
          currentSection = section.id
        }
      }
      setActiveTab(currentSection)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter computation (client-side text search, location)
  const filteredDoctors = doctorsList.filter((doc) => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(searchQuery)
    const matchesKeyword =
      !q ||
      normalize(doc.name).includes(q) ||
      normalize(doc.hospital).includes(q) ||
      normalize(doc.specialtyName).includes(q)
    const matchesLocation =
      selectedLocation === 'Tất cả địa điểm' ||
      doc.location.toLowerCase().includes(selectedLocation.toLowerCase())
    return matchesKeyword && matchesLocation
  })

  // Auth handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.trim() || !authPassword.trim()) {
      addNotification('error', 'Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    setAuthLoading(true)
    try {
      if (showAuthModal === 'register') {
        await authService.register({ email: authEmail, password: authPassword, terms: true })
        addNotification('success', 'Đăng ký thành công! Vui lòng đăng nhập.')
        setShowAuthModal('login')
      } else {
        const res = await authService.login({ email: authEmail, password: authPassword })
        const token = res.data?.token || res.token
        // Get user info
        const meRes = await authService.getMe(token)
        const userInfo = meRes.data
        setAuth(token, userInfo)
        addNotification('success', `Đăng nhập thành công! Chào mừng ${userInfo.email}.`)
        setShowAuthModal(null)
        setAuthEmail('')
        setAuthPassword('')
        setAuthName('')
        
        if (userInfo.role === 'DOCTOR') {
          router.push('/doctor/today')
        } else if (userInfo.role === 'ADMIN') {
          router.push('/admin/dashboard')
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      addNotification('error', msg || (showAuthModal === 'register' ? 'Đăng ký thất bại. Email có thể đã tồn tại.' : 'Đăng nhập thất bại. Kiểm tra lại thông tin.'))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch { /* ignore */ }
    storeLogout()
    addNotification('info', 'Bạn đã đăng xuất khỏi hệ thống.')
  }

  // Booking handlers
  const handleBookingConfirm = (newApt: PatientAppointment) => {
    setAppointments((prev) => [newApt, ...prev])
    addNotification('success', `Đặt lịch thành công với ${newApt.doctorTitle} ${newApt.doctorName}!`)
    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 500)
  }

  const handleCancelAppointment = async (id: string, backendId?: number) => {
    const confirm = window.confirm('Bạn có chắc chắn muốn hủy cuộc hẹn này không?')
    if (!confirm) return
    if (backendId) {
      try {
        await bookingService.cancelAppointment(backendId)
      } catch {
        addNotification('error', 'Không thể hủy lịch hẹn. Vui lòng thử lại.')
        return
      }
    }
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' as const } : apt))
    )
    addNotification('info', 'Đã hủy lịch hẹn khám bệnh thành công.')
  }

  const scrollToFinder = () => {
    finderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navItems = [
    { id: 'trang-chu', label: 'Trang chủ', href: '#', onClick: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('trang-chu') } },
    { id: 'chuyen-khoa', label: 'Chuyên khoa', href: '#chuyen-khoa', onClick: () => { document.getElementById('chuyen-khoa')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('chuyen-khoa') } },
    { id: 'bac-si', label: 'Bác sĩ', href: '#bac-si', onClick: () => { document.getElementById('bac-si-kiem-tra')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('bac-si') } },
    { id: 'quy-trinh', label: 'Quy trình', href: '#quy-trinh', onClick: () => { document.getElementById('quy-trinh')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('quy-trinh') } },
  ]

  const userDisplayName = user?.email?.split('@')[0] || ''

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Toast notifications */}
      <div className="fixed top-24 right-6 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 pointer-events-auto ${
                n.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : n.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}
              <p className="text-xs font-semibold leading-relaxed">{n.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10 shadow-xs">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shadow-md tracking-wider">
                M
              </span>
              <span className="text-xl font-black text-primary tracking-tight">
                Medi<span className="text-secondary">Book</span>
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); item.onClick() }}
                  className={`text-xs uppercase tracking-widest pb-1 transition-all duration-200 border-b-2 ${
                    activeTab === item.id
                      ? 'text-primary border-primary font-black'
                      : 'text-on-surface-variant hover:text-primary border-transparent font-bold'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {appointments.length > 0 && (
                <a
                  href="#lich-kham"
                  onClick={(e) => { e.preventDefault(); document.getElementById('lich-kham')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('lich-kham') }}
                  className={`text-xs uppercase tracking-widest pb-1 transition-all duration-200 border-b-2 ${
                    activeTab === 'lich-kham'
                      ? 'text-primary border-primary font-black'
                      : 'text-on-surface-variant hover:text-primary border-transparent font-bold'
                  }`}
                >
                  Lịch của tôi ({appointments.filter((a) => a.status === 'upcoming').length})
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-full border border-primary/15">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-primary">Hi, {userDisplayName}</span>
                <button
                  onClick={() => router.push('/profile')}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer ml-2 font-medium"
                >
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-on-surface-variant hover:text-red-600 transition-colors cursor-pointer ml-1 underline font-medium border-l border-outline-variant/30 pl-3"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal('login')}
                  className="px-5 py-2.5 text-xs font-black text-primary hover:bg-primary-container/20 rounded-full transition-all cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setShowAuthModal('register')}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </header>

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
              <button
                onClick={scrollToFinder}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer border-none text-xs uppercase tracking-wider"
              >
                <span>Đặt lịch khám ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => document.getElementById('bac-si-kiem-tra')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary/5 font-black rounded-full transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Tìm bác sĩ chuyên khoa
              </button>
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

            <div className="absolute bottom-6 -left-2 sm:-left-6 bg-white p-4 rounded-2xl clinical-shadow border border-outline-variant/30 flex items-center gap-3.5 max-w-xs hover:shadow-lg transition-all duration-300">
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

      {/* Quick Finder Section */}
      <section ref={finderRef} id="dat-lich-tim-kiem" className="relative z-20 -mt-10 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl clinical-shadow-lg p-6 md:p-8 border border-outline-variant/25">
          <h3 className="text-xs uppercase font-extrabold text-primary tracking-widest mb-4 flex items-center gap-1.5 justify-center md:justify-start">
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
                  placeholder="Nhập tên bác sĩ hoặc chuyên khoa..."
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface"
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
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface appearance-none cursor-pointer"
                >
                  <option value="Tất cả địa điểm">Tất cả địa điểm</option>
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
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
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface cursor-pointer"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  addNotification('info', `Đang hiển thị ${filteredDoctors.length} bác sĩ phù hợp.`)
                  document.getElementById('bac-si-kiem-tra')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none uppercase tracking-wider active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Bác Sĩ Ngay</span>
              </button>
            </div>
          </div>

          {/* Active filters */}
          {(selectedSpecialty || searchQuery || selectedLocation !== 'Tất cả địa điểm' || searchDate) && (
            <div className="mt-4 pt-4 border-t border-outline-variant/15 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-on-surface-variant mr-1 font-bold">Bộ lọc đang bật:</span>
              {selectedSpecialty && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                  Chuyên khoa: {specialtiesList.find((s) => s.id === selectedSpecialty)?.name}
                  <button onClick={() => setSelectedSpecialty(null)} className="text-primary hover:text-red-600 font-extrabold ml-1">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                  Từ khóa: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="text-primary hover:text-red-600 font-extrabold ml-1">×</button>
                </span>
              )}
              {selectedLocation !== 'Tất cả địa điểm' && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                  Khu vực: {selectedLocation}
                  <button onClick={() => setSelectedLocation('Tất cả địa điểm')} className="text-primary hover:text-red-600 font-extrabold ml-1">×</button>
                </span>
              )}
              {searchDate && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                  Ngày: {searchDate.split('-').reverse().join('/')}
                  <button onClick={() => setSearchDate('')} className="text-primary hover:text-red-600 font-extrabold ml-1">×</button>
                </span>
              )}
              <button
                onClick={() => { setSelectedSpecialty(null); setSearchQuery(''); setSelectedLocation('Tất cả địa điểm'); setSearchDate('') }}
                className="text-[10px] text-red-600 hover:underline font-extrabold border-none bg-transparent cursor-pointer ml-1"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Specialties Section */}
      <section id="chuyen-khoa" className="py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-black text-primary tracking-widest">Danh mục dịch vụ</span>
              <h2 className="text-3xl font-black text-on-surface mt-1">Chuyên khoa phổ biến</h2>
              <p className="text-sm text-on-surface-variant mt-2">Duyệt qua các chuyên khoa để đặt lịch với đúng bác sĩ chuyên trách</p>
            </div>
            {selectedSpecialty && (
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="text-xs font-bold text-primary hover:underline border border-primary/20 px-4 py-2 rounded-full cursor-pointer bg-white"
              >
                Hiển thị tất cả bác sĩ
              </button>
            )}
          </div>

          {loadingSpecialties ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {specialtiesList.map((spec) => (
                <SpecialtyCard
                  key={spec.id}
                  specialty={spec}
                  isSelected={selectedSpecialty === spec.id}
                  onSelect={(id) => {
                    setSelectedSpecialty(id)
                    if (id) addNotification('info', `Đang hiển thị chuyên khoa: ${spec.name}`)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Doctors Section */}
      <section id="bac-si-kiem-tra" className="py-20 bg-surface-container-low clip-diagonal">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="mb-12 text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold text-primary tracking-widest">Đội ngũ chuyên gia</span>
            <h2 className="text-3xl font-black text-on-surface">Danh sách bác sĩ nổi bật</h2>
            <p className="text-sm text-on-surface-variant">Lựa chọn đặt lịch tư vấn với Tiến sĩ, Thạc sĩ ưu tú.</p>
          </div>

          {loadingDoctors ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBook={(doctor) => {
                    if (!isAuthenticated) {
                      addNotification('info', 'Vui lòng đăng nhập để đặt lịch khám.')
                      setShowAuthModal('login')
                      return
                    }
                    setActiveDoctor(doctor)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-outline-variant/20 shadow-sm space-y-4">
              <AlertCircle className="w-12 h-12 text-primary mx-auto opacity-70" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-on-surface text-base">Không tìm thấy bác sĩ phù hợp</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {doctorsList.length === 0 ? 'Không thể kết nối tới server. Vui lòng kiểm tra backend đang chạy.' : 'Bộ lọc của bạn không khớp với bác sĩ nào.'}
                </p>
              </div>
              <button
                onClick={() => { setSelectedSpecialty(null); setSearchQuery(''); setSelectedLocation('Tất cả địa điểm'); setSearchDate('') }}
                className="px-6 py-2.5 bg-primary text-white text-xs font-extrabold rounded-full cursor-pointer hover:bg-primary-hover border-none active:scale-95 transition-all"
              >
                Xóa bộ lọc tìm lại
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="quy-trinh" className="py-20 bg-background">
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
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-2xl clinical-shadow border border-outline-variant/10 text-center hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-primary-container text-primary rounded-xl flex items-center justify-center mx-auto mb-5 font-bold text-lg">
                  {step.num}
                </div>
                <h4 className="font-bold text-on-surface mb-2">{step.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
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
                { icon: UserCheck, title: 'Quản Lý Hồ Sơ Điện Tử', desc: 'Lưu lịch sử khám, đơn thuốc và hóa đơn trực tuyến trên nền tảng di động.' },
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

      {/* Appointments Section */}
      <section ref={historyRef} id="lich-kham" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs uppercase font-black text-primary tracking-widest">Tra cứu hồ sơ</span>
            <h2 className="text-3xl font-black text-on-surface">Lịch khám cá nhân của bạn</h2>
            <p className="text-sm text-on-surface-variant">Lịch sử và danh sách cuộc hẹn khám bệnh đã đăng ký.</p>
          </div>

          {!isAuthenticated ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-outline-variant/20 shadow-xs">
              <p className="text-on-surface-variant font-medium text-sm">Vui lòng đăng nhập để xem lịch khám của bạn.</p>
              <button
                onClick={() => setShowAuthModal('login')}
                className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-extrabold rounded-full cursor-pointer hover:bg-primary-hover border-none active:scale-95 transition-all"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : loadingAppointments ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentList appointments={appointments} onCancel={handleCancelAppointment} />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-high clip-diagonal-footer pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shadow">M</span>
              <span className="text-lg font-black text-primary tracking-tight">Medi<span className="text-secondary">Book</span></span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
              © 2026 MediBook. Nền tảng đặt lịch khám bệnh trực tuyến và giải pháp quản lý y tế thông minh cho hàng triệu gia đình Việt Nam.
            </p>
            <div className="flex gap-4">
              {[Globe, Mail, Phone].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-on-surface text-sm uppercase tracking-wider">Liên kết hữu ích</h4>
            <div className="grid grid-cols-1 gap-3">
              {['Giới thiệu dịch vụ', 'Điều khoản sử dụng', 'Chính sách bảo mật y tế', 'Câu hỏi thường gặp'].map((link) => (
                <a key={link} href="#" className="text-xs text-on-surface-variant hover:text-primary underline">{link}</a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-on-surface text-sm uppercase tracking-wider">Thống kê hệ thống</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-xl border border-outline-variant/15">
                <p className="text-lg font-black text-primary">500k+</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Bệnh nhân</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-outline-variant/15">
                <p className="text-lg font-black text-primary">1.2k+</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Bác sĩ</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-outline-variant/15 col-span-2">
                <p className="text-lg font-black text-primary">1,000,000+</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Lịch khám thành công</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-outline-variant/10 text-center text-on-surface-variant/80 text-[10px]">
          <p>Cơ quan chủ quản: Công ty Cổ phần Công nghệ MediBook Việt Nam • MST: 0101234567 • Giấy phép số 89/GP-BYT</p>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Booking Modal */}
      <AnimatePresence>
        {activeDoctor && (
          <BookingModal
            doctor={activeDoctor}
            onClose={() => setActiveDoctor(null)}
            onBookingSuccess={handleBookingConfirm}
            isLoggedIn={isAuthenticated}
            onRequestLogin={() => setShowAuthModal('login')}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl relative border border-outline-variant/20"
            >
              <button
                onClick={() => setShowAuthModal(null)}
                className="absolute top-4 right-4 p-1.5 text-on-surface-variant hover:text-primary rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-on-surface text-center mb-6">
                {showAuthModal === 'login' ? 'Đăng nhập MediBook' : 'Đăng ký tài khoản mới'}
              </h3>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {showAuthModal === 'register' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant">Tên hiển thị:</label>
                    <input
                      type="text"
                      placeholder="Nhập tên của bạn..."
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full py-2.5 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Địa chỉ Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="example@medibook.vn"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full py-2.5 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Mật khẩu bảo mật:</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full py-2.5 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:bg-primary-hover active:scale-95 transition-all border-none mt-2 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {authLoading ? 'Đang xử lý...' : showAuthModal === 'login' ? 'Xác nhận Đăng nhập' : 'Hoàn tất Đăng ký'}
                </button>
              </form>

              <div className="text-center mt-4">
                {showAuthModal === 'login' ? (
                  <p className="text-xs text-on-surface-variant">
                    Chưa có tài khoản?{' '}
                    <button onClick={() => setShowAuthModal('register')} className="text-primary font-bold hover:underline cursor-pointer">
                      Đăng ký ngay
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    Đã có tài khoản?{' '}
                    <button onClick={() => setShowAuthModal('login')} className="text-primary font-bold hover:underline cursor-pointer">
                      Đăng nhập trực tiếp
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
