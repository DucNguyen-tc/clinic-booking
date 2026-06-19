'use client'

import { useState, useCallback } from 'react'
import { Globe, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import Navbar, { NavNotification } from '@/components/patient/Navbar'
import ChatWidget from '@/components/patient/ChatWidget'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NavNotification[]>([])

  const addNotification = useCallback((type: 'success' | 'info' | 'error', text: string) => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)
    setNotifications((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4500)
  }, [])

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <Navbar notifications={notifications} onAddNotification={addNotification} />

      <main className="flex-1">{children}</main>

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
              {[
                { label: 'Chuyên khoa', href: '/specialties' },
                { label: 'Danh sách bác sĩ', href: '/doctors' },
                { label: 'Lịch của tôi', href: '/appointments' },
                { label: 'Hồ sơ cá nhân', href: '/profile' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-xs text-on-surface-variant hover:text-primary underline">
                  {link.label}
                </Link>
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

      <ChatWidget />
    </div>
  )
}
