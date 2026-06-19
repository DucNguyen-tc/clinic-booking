'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, CheckCircle, Info, Menu } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth-store'
import { bookingService } from '@/services/patient-booking.service'

export type NavNotification = { id: string; type: 'success' | 'info' | 'error'; text: string }

interface NavbarProps {
  notifications?: NavNotification[]
  onAddNotification?: (type: 'success' | 'info' | 'error', text: string) => void
}

export default function Navbar({ notifications = [], onAddNotification }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const { isAuthenticated, user, setAuth, logout: storeLogout } = useAuthStore()

  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const addNotif = useCallback(
    (type: 'success' | 'info' | 'error', text: string) => {
      onAddNotification?.(type, text)
    },
    [onAddNotification]
  )

  // Load appointment count for badge
  useEffect(() => {
    if (!isAuthenticated) { setUpcomingCount(0); return }
    bookingService.getMyAppointments().then((apts) => {
      setUpcomingCount(apts.filter((a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length)
    }).catch(() => {})
  }, [isAuthenticated])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.trim() || !authPassword.trim()) {
      addNotif('error', 'Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    setAuthLoading(true)
    try {
      if (showAuthModal === 'register') {
        await authService.register({ email: authEmail, password: authPassword, terms: true })
        addNotif('success', 'Đăng ký thành công! Vui lòng đăng nhập.')
        setShowAuthModal('login')
      } else {
        const res = await authService.login({ email: authEmail, password: authPassword })
        const token = res.data?.token || res.token
        const meRes = await authService.getMe(token)
        const userInfo = meRes.data
        setAuth(token, userInfo)
        addNotif('success', `Đăng nhập thành công! Chào mừng ${userInfo.email}.`)
        setShowAuthModal(null)
        setAuthEmail(''); setAuthPassword(''); setAuthName('')
        if (userInfo.role === 'DOCTOR') router.push('/doctor/today')
        else if (userInfo.role === 'ADMIN') router.push('/admin/dashboard')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      addNotif('error', msg || (showAuthModal === 'register' ? 'Đăng ký thất bại.' : 'Đăng nhập thất bại.'))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    storeLogout()
    addNotif('info', 'Bạn đã đăng xuất khỏi hệ thống.')
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/specialties', label: 'Chuyên khoa' },
    { href: '/doctors', label: 'Bác sĩ' },
    { href: '/appointments', label: upcomingCount > 0 ? `Lịch của tôi (${upcomingCount})` : 'Lịch của tôi' },
  ]

  const userDisplayName = user?.email?.split('@')[0] || ''

  return (
    <>
      {/* Toast notifications */}
      <div className="fixed top-24 right-6 z-[60] space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 pointer-events-auto ${
                n.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : n.type === 'error' ? 'bg-red-50 text-red-800 border-red-200'
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

      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/10 shadow-xs">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-7xl mx-auto">
          {/* Logo + Desktop nav */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg shadow-md">
                M
              </span>
              <span className="text-xl font-black text-primary tracking-tight">
                Medi<span className="text-secondary">Book</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      if (link.href === '/appointments' && !isAuthenticated) {
                        setShowAuthModal('login')
                        return
                      }
                    }}
                    className={`text-xs uppercase tracking-widest pb-1 transition-all duration-200 border-b-2 ${
                      isActive
                        ? 'text-primary border-primary font-black'
                        : 'text-on-surface-variant hover:text-primary border-transparent font-bold'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side: auth + mobile menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-full border border-primary/15">
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
              <div className="hidden md:flex items-center gap-2">
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
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-primary/5 transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-on-surface" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-surface-container-low">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-10">
                <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm">M</span>
                <span className="text-lg font-black text-primary">Medi<span className="text-secondary">Book</span></span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-bold py-2 border-b border-outline-variant/10 ${
                      pathname === link.href ? 'text-primary' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-8 border-t border-outline-variant/10">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-xs text-on-surface-variant font-medium">Xin chào, <strong className="text-primary">{userDisplayName}</strong></p>
                    <button onClick={() => { router.push('/profile'); setMobileOpen(false) }} className="w-full py-2 text-xs font-bold border border-primary/20 text-primary rounded-xl hover:bg-primary/5">Hồ sơ cá nhân</button>
                    <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="w-full py-2 text-xs font-bold border border-red-200 text-red-600 rounded-xl hover:bg-red-50">Đăng xuất</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button onClick={() => { setShowAuthModal('login'); setMobileOpen(false) }} className="w-full py-2.5 text-xs font-black text-primary border border-primary/20 rounded-xl hover:bg-primary/5">Đăng nhập</button>
                    <button onClick={() => { setShowAuthModal('register'); setMobileOpen(false) }} className="w-full py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-hover">Đăng ký</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
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
    </>
  )
}
