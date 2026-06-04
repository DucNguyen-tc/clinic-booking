"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowRightLeft, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarDay, ShiftSlot, ScheduleNote, WeeklyScheduleStats } from "@/types/doctor"

// ── Shift Badge ───────────────────────────────────────────────────────────────

const SHIFT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  morning:   { bg: "bg-primary/10",         border: "border-primary",   text: "text-primary" },
  afternoon: { bg: "bg-secondary/10",       border: "border-secondary", text: "text-secondary" },
  fullday:   { bg: "bg-tertiary-fixed/30",  border: "border-tertiary",  text: "text-tertiary" },
  leave:     { bg: "bg-error-container/30", border: "border-error",     text: "text-error" },
}

function ShiftBadge({ shift }: { shift: ShiftSlot }) {
  const style = SHIFT_STYLES[shift.type] ?? SHIFT_STYLES.morning
  return (
    <div className={cn("p-1.5 rounded-lg border-l-4", style.bg, style.border)}>
      <p className={cn("text-[10px] font-bold uppercase leading-tight", style.text)}>{shift.label}</p>
      <p className="text-[11px] text-on-surface font-semibold leading-tight mt-0.5">
        {shift.type === "leave" ? "Nghỉ phép" : `${shift.booked}/${shift.capacity}`}
      </p>
    </div>
  )
}

// ── Calendar Cell ─────────────────────────────────────────────────────────────

function CalendarCell({ day }: { day: CalendarDay }) {
  if (!day.isCurrentMonth) {
    return (
      <div className="p-2.5 border-r border-b border-outline-variant bg-surface-bright/50 opacity-40 min-h-[110px]">
        <span className="font-semibold text-sm text-on-surface-variant">{day.date}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "p-2.5 border-r border-b border-outline-variant min-h-[110px] transition-colors group",
        day.isToday
          ? "bg-surface-container-low ring-2 ring-primary ring-inset"
          : "bg-surface-container-lowest hover:bg-surface-container"
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className={cn("font-bold text-sm", day.isToday ? "text-primary" : "text-on-surface")}>
          {day.date}
        </span>
        {day.isToday && (
          <span className="px-1.5 py-0.5 bg-primary text-on-primary text-[9px] rounded-full font-bold leading-none">
            TODAY
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {day.shifts.map((shift, i) => (
          <ShiftBadge key={i} shift={shift} />
        ))}
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ScheduleCalendarProps {
  days: CalendarDay[]
  month: string              // "Tháng 10/2023"
  stats: WeeklyScheduleStats
  notes: ScheduleNote[]
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ScheduleCalendar({ days, month, stats, notes, onPrevMonth, onNextMonth }: ScheduleCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const DAYS_HEADER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end bg-surface-container-lowest p-8 rounded-2xl clinical-shadow border border-outline-variant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-secondary-container/10 -skew-x-12 translate-x-32" />
        <div className="relative z-10">
          <h1 className="font-bold text-3xl text-primary mb-2">Lịch Làm Việc Cá Nhân</h1>
          <p className="text-on-surface-variant">Quản lý ca trực và các slot khám bệnh trong {month}</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button className="px-5 py-2 rounded-full border border-primary text-primary font-semibold text-sm flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all">
            <ArrowRightLeft className="w-4 h-4" />
            Yêu cầu đổi lịch
          </button>
          <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-4 py-1.5 rounded-full font-semibold text-sm transition-all",
                viewMode === "month"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-variant"
              )}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={cn(
                "px-4 py-1.5 rounded-full font-semibold text-sm transition-all",
                viewMode === "week"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-variant"
              )}
            >
              Tuần
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-on-surface-variant">Ca sáng (08:00 - 12:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-xs font-semibold text-on-surface-variant">Ca chiều (13:30 - 17:30)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-tertiary" />
          <span className="text-xs font-semibold text-on-surface-variant">Slot còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error" />
          <span className="text-xs font-semibold text-on-surface-variant">Đầy / Bận</span>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
        <h3 className="font-bold text-lg text-on-surface">{month}</h3>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface-container-lowest clinical-shadow rounded-2xl border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low">
          {DAYS_HEADER.map((d) => (
            <div key={d} className="py-3 text-center font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => (
            <CalendarCell key={i} day={day} />
          ))}
        </div>
      </div>

      {/* Stats & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Stats */}
        <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-2xl clinical-shadow border border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/[0.03] -z-0" />
          <div className="relative z-10">
            <h3 className="font-bold text-xl text-on-surface mb-4">Phân tích ca trực tuần này</h3>
            <div className="flex gap-6">
              <div className="flex-1 p-4 bg-white/80 rounded-xl border border-outline-variant">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Tổng số ca</p>
                <p className="text-2xl font-bold text-primary mt-1">{stats.totalShifts}</p>
              </div>
              <div className="flex-1 p-4 bg-white/80 rounded-xl border border-outline-variant">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Bệnh nhân dự kiến</p>
                <p className="text-2xl font-bold text-secondary mt-1">{stats.expectedPatients}</p>
              </div>
              <div className="flex-1 p-4 bg-white/80 rounded-xl border border-outline-variant">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Tỉ lệ lấp đầy</p>
                <p className="text-2xl font-bold text-tertiary mt-1">{stats.fillRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl clinical-shadow border border-outline-variant">
          <h3 className="font-bold text-xl text-on-surface mb-4">Ghi chú & Nhắc nhở</h3>
          <ul className="space-y-4">
            {notes.map((note, i) => (
              <li key={i} className="flex gap-3">
                {note.variant === "info" ? (
                  <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-bold text-on-surface">{note.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{note.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
