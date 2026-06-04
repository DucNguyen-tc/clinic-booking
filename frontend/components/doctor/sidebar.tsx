"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CalendarCheck2,
  Users,
  User,
  Plus,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/doctor",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Lịch khám hôm nay",
    href: "/doctor/today",
    icon: CalendarDays,
  },
  {
    label: "Bệnh án",
    href: "/doctor/appointments",
    icon: FileText,
  },
  {
    label: "Lịch làm việc",
    href: "/doctor/schedule",
    icon: CalendarCheck2,
  },
  {
    label: "Bệnh nhân",
    href: "/doctor/patients",
    icon: Users,
  },
  {
    label: "Hồ sơ",
    href: "/doctor/profile",
    icon: User,
  },
]

export function DoctorSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <span className="font-bold text-xl text-primary tracking-tight leading-none block">MediBook</span>
            <span className="text-xs text-on-surface-variant opacity-70 font-medium leading-none mt-0.5 block">Doctor Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active ? "text-on-secondary-container" : "text-current"
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* CTA Button */}
      <div className="p-4 border-t border-outline-variant/30">
        <button className="w-full py-3 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary/90 active:scale-95 shadow-md text-sm">
          <Plus className="w-4 h-4" />
          <span>Bệnh nhân mới</span>
        </button>
      </div>
    </aside>
  )
}
