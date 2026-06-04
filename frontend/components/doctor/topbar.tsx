"use client"

import Image from "next/image"
import { Search, Bell, HelpCircle, Settings } from "lucide-react"

interface TopBarProps {
  searchPlaceholder?: string
}

export function DoctorTopBar({ searchPlaceholder = "Tìm kiếm bệnh nhân, bệnh án..." }: TopBarProps) {
  return (
    <header className="flex justify-between items-center ml-64 px-6 h-16 w-[calc(100%-16rem)] bg-surface border-b border-outline-variant shadow-sm fixed top-0 z-40">
      {/* Search */}
      <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary transition-all gap-2">
        <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="bg-transparent border-none focus:ring-0 w-full text-sm placeholder:text-on-surface-variant/50 outline-none text-on-surface"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative hover:bg-surface-container-low rounded-full p-2.5 transition-all">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="hover:bg-surface-container-low rounded-full p-2.5 transition-all">
          <HelpCircle className="w-5 h-5 text-on-surface-variant" />
        </button>
        <button className="hover:bg-surface-container-low rounded-full p-2.5 transition-all">
          <Settings className="w-5 h-5 text-on-surface-variant" />
        </button>

        <div className="h-8 w-px bg-outline-variant mx-1" />

        {/* Doctor Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
            <Image
              src="/images/doctor-avatar.png"
              alt="Doctor Avatar"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
            {/* Fallback initials */}
            <div className="w-full h-full bg-secondary-container flex items-center justify-center">
              <span className="text-xs font-bold text-on-secondary-container">AN</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="font-bold text-sm text-on-surface leading-none">BS. Nguyễn Văn An</p>
            <p className="text-xs text-on-surface-variant opacity-70 mt-0.5">Chuyên khoa Tim mạch</p>
          </div>
        </div>
      </div>
    </header>
  )
}
