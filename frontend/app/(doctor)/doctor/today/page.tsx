"use client"

import { useState } from "react"
import { CalendarDays, RefreshCw } from "lucide-react"
import { AppointmentTable } from "@/components/doctor/appointment-table"
import { cn } from "@/lib/utils"
import type { Appointment, SessionType } from "@/types/appointment"

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "BN-00001",
    orderNumber: 1,
    patient: { id: "p1", name: "Nguyễn Văn A", age: 30, gender: "male", initials: "NA" },
    timeRange: "08:00 - 08:15",
    sessionType: "morning",
    status: "PENDING",
    reason: "Khám định kỳ",
    date: "2024-05-24",
  },
  {
    id: "BN-00002",
    orderNumber: 2,
    patient: { id: "p2", name: "Trần Thị Bình", age: 45, gender: "female", initials: "TB" },
    timeRange: "08:15 - 08:30",
    sessionType: "morning",
    status: "IN_PROGRESS",
    reason: "Đau thắt ngực",
    date: "2024-05-24",
  },
  {
    id: "BN-00003",
    orderNumber: 3,
    patient: { id: "p3", name: "Lê Văn Cường", age: 28, gender: "male", initials: "LC" },
    timeRange: "08:30 - 08:45",
    sessionType: "morning",
    status: "COMPLETED",
    reason: "Kiểm tra xét nghiệm",
    date: "2024-05-24",
  },
  {
    id: "BN-00004",
    orderNumber: 4,
    patient: { id: "p4", name: "Phạm Minh Hoàng", age: 52, gender: "male", initials: "PH" },
    timeRange: "08:45 - 09:00",
    sessionType: "morning",
    status: "CANCELLED",
    reason: "Khám tổng quát",
    date: "2024-05-24",
  },
  {
    id: "BN-00005",
    orderNumber: 5,
    patient: { id: "p5", name: "Nguyễn Thị Lan", age: 38, gender: "female", initials: "NL" },
    timeRange: "13:00 - 13:15",
    sessionType: "afternoon",
    status: "PENDING",
    reason: "Tái khám",
    date: "2024-05-24",
  },
  {
    id: "BN-00006",
    orderNumber: 6,
    patient: { id: "p6", name: "Võ Đình Tuấn", age: 60, gender: "male", initials: "VT" },
    timeRange: "13:15 - 13:30",
    sessionType: "afternoon",
    status: "PENDING",
    reason: "Đau đầu, chóng mặt",
    date: "2024-05-24",
  },
]

const SESSION_TABS: { label: string; value: SessionType }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Ca sáng", value: "morning" },
  { label: "Ca chiều", value: "afternoon" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TodayAppointmentsPage() {
  const [session, setSession] = useState<SessionType>("all")
  const [date, setDate] = useState("2024-05-24")

  const filtered = MOCK_APPOINTMENTS.filter(
    (a) => session === "all" || a.sessionType === session
  )

  const counts = {
    total: MOCK_APPOINTMENTS.length,
    waiting: MOCK_APPOINTMENTS.filter((a) => a.status === "PENDING").length,
    inProgress: MOCK_APPOINTMENTS.filter((a) => a.status === "IN_PROGRESS").length,
    completed: MOCK_APPOINTMENTS.filter((a) => a.status === "COMPLETED").length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner */}
      <section className="relative p-8 rounded-3xl bg-primary-container text-on-primary-container overflow-hidden diagonal-bg-login">
        <div className="relative z-10">
          <h1 className="font-bold text-3xl mb-1">Lịch Khám Hôm Nay</h1>
          <p className="text-lg opacity-90">
            Thứ Hai, 24 Tháng 5, 2024 •{" "}
            <span className="font-bold">Bạn có {counts.waiting} lịch hẹn đang chờ.</span>
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <CalendarDays className="w-36 h-36" />
        </div>
      </section>

      {/* Filters */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant clinical-shadow flex flex-wrap items-end gap-5">
        {/* Date picker */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Chọn ngày</label>
          <div className="flex items-center border border-outline rounded-xl px-4 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary gap-2 bg-white">
            <CalendarDays className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-none p-0 focus:ring-0 text-sm w-full bg-transparent outline-none text-on-surface"
            />
          </div>
        </div>

        {/* Session filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Chọn ca khám</label>
          <div className="flex gap-2">
            {SESSION_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSession(tab.value)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                  session === tab.value
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-container"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary + Refresh */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span>Tổng: <strong className="text-on-surface">{filtered.length}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Chờ: <strong className="text-primary">{counts.waiting}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Đang khám: <strong className="text-secondary">{counts.inProgress}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Xong: <strong className="text-tertiary">{counts.completed}</strong></span>
          </div>
          <button className="p-2 text-primary hover:bg-primary-fixed rounded-full transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Appointment List */}
      <section>
        <AppointmentTable appointments={filtered} />
      </section>
    </div>
  )
}
