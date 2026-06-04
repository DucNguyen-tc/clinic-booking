"use client"

import { ScheduleCalendar } from "@/components/doctor/schedule-calendar"
import type { CalendarDay, ScheduleNote, WeeklyScheduleStats } from "@/types/doctor"

// ── Mock Data ─────────────────────────────────────────────────────────────────

function generateCalendarDays(): CalendarDay[] {
  const days: CalendarDay[] = []

  // Previous month placeholders (28, 29, 30)
  for (let i = 28; i <= 30; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false, shifts: [] })
  }

  // Current month: 1-31
  for (let d = 1; d <= 31; d++) {
    const shifts = []

    if (d === 3) {
      shifts.push({ type: "leave" as const, label: "FULL DAY", booked: 0, capacity: 0 })
    } else if (d % 7 === 0 || d % 7 === 6) {
      // Weekend — no shifts
    } else {
      // Weekday shifts
      if (d % 3 !== 0) {
        shifts.push({
          type: "morning" as const,
          label: "MORNING",
          booked: d < 6 ? 15 : Math.min(15, 8 + d % 5),
          capacity: 15,
        })
      }
      if (d % 2 === 0) {
        shifts.push({
          type: "afternoon" as const,
          label: "AFTERNOON",
          booked: Math.min(15, 3 + d % 7),
          capacity: 15,
        })
      }
    }

    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: d === 6,
      shifts,
    })
  }

  // Fill remaining cells to make 5 full rows (35 cells total)
  const remaining = 35 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, isCurrentMonth: false, isToday: false, shifts: [] })
  }

  return days
}

const MOCK_STATS: WeeklyScheduleStats = {
  totalShifts: 12,
  expectedPatients: 168,
  fillRate: 92,
}

const MOCK_NOTES: ScheduleNote[] = [
  {
    title: "Họp khoa Sản",
    description: "14:00 - Thứ Tư, 11/10",
    variant: "info",
  },
  {
    title: "Cập nhật hồ sơ bệnh nhân",
    description: "Hạn chót: Thứ Sáu tuần này",
    variant: "warning",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorSchedulePage() {
  const days = generateCalendarDays()

  return (
    <div className="max-w-7xl mx-auto">
      <ScheduleCalendar
        days={days}
        month="Tháng 10/2023"
        stats={MOCK_STATS}
        notes={MOCK_NOTES}
      />
    </div>
  )
}
