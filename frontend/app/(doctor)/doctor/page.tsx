import Link from "next/link"
import {
  CalendarDays,
  TrendingUp,
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
  Loader2,
  Plus,
} from "lucide-react"
import type { WeeklyShift, DoctorStats } from "@/types/doctor"
import type { Appointment } from "@/types/appointment"

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_STATS: DoctorStats = {
  totalToday: 25,
  waiting: 10,
  inProgress: 2,
  completed: 13,
  monthlyTotal: 350,
  monthlyGrowth: 12,
}

const MOCK_SHIFTS: WeeklyShift[] = [
  { day: "Thứ 2", dayIndex: 0, date: 12, shiftType: "morning", shiftLabel: "Trực ca sáng", timeRange: "08:00 - 12:00", room: "Phòng 402" },
  { day: "Thứ 3", dayIndex: 1, date: 13, shiftType: "off", shiftLabel: "Nghỉ bù" },
  { day: "Thứ 4", dayIndex: 2, date: 14, shiftType: "fullday", shiftLabel: "Trực ca cả ngày", timeRange: "08:00 - 17:00", room: "Phòng 105" },
  { day: "Thứ 5", dayIndex: 3, date: 15, shiftType: "afternoon", shiftLabel: "Trực ca chiều", timeRange: "13:30 - 17:30", room: "Phòng 402" },
]

const NEXT_UP_PATIENTS: Pick<Appointment, "id" | "patient" | "timeRange" | "roomNumber">[] = [
  {
    id: "appt-1",
    patient: { id: "p1", name: "Lê Hoàng Nam", age: 28, gender: "male", initials: "LH" },
    timeRange: "09:30 AM",
    roomNumber: "UT1",
  },
  {
    id: "appt-2",
    patient: { id: "p2", name: "Ngô Minh Tú", age: 45, gender: "male", initials: "MT" },
    timeRange: "09:45 AM",
    roomNumber: "UT2",
  },
]

// ── Bar Chart ─────────────────────────────────────────────────────────────────

const CHART_BARS = [
  { height: "h-2/3", variant: "bg-surface-container" },
  { height: "h-1/2", variant: "bg-surface-container" },
  { height: "h-3/4", variant: "bg-surface-container" },
  { height: "h-4/5", variant: "bg-primary/20" },
  { height: "h-2/3", variant: "bg-primary/40" },
  { height: "h-5/6", variant: "bg-primary/60" },
  { height: "h-full", variant: "bg-primary" },
  { height: "h-3/4", variant: "bg-surface-container" },
  { height: "h-1/2", variant: "bg-surface-container" },
  { height: "h-2/3", variant: "bg-surface-container" },
  { height: "h-3/5", variant: "bg-surface-container" },
  { height: "h-4/5", variant: "bg-surface-container" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorDashboardPage() {
  const stats = MOCK_STATS

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <section className="relative bg-primary-container text-on-primary-container p-10 rounded-3xl overflow-hidden diagonal-bg-login">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-headline-xl text-4xl font-bold mb-3">
            Chào buổi sáng, BS. An 👋
          </h1>
          <p className="text-lg opacity-90 mb-7">
            Hôm nay bạn có <span className="font-bold">{stats.totalToday} bệnh nhân</span> đã đặt lịch. Chúc bạn một ngày làm việc hiệu quả!
          </p>
          <Link
            href="/doctor/today"
            className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <CalendarDays className="w-5 h-5" />
            Xem lịch khám hôm nay
          </Link>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <CalendarDays className="w-48 h-48" />
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats Bento */}
          <div className="grid grid-cols-3 gap-4">
            {/* Waiting */}
            <div className="bg-white p-5 rounded-2xl border border-outline-variant clinical-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-surface-container rounded-xl">
                  <Clock className="w-5 h-5 text-on-surface-variant" />
                </div>
                <span className="text-xs text-on-surface-variant/50 font-semibold uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium mb-1">Chờ khám</p>
              <p className="text-4xl font-bold text-on-surface">{stats.waiting}</p>
            </div>

            {/* In Progress */}
            <div className="bg-white p-5 rounded-2xl border border-outline-variant border-l-4 border-l-primary clinical-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary-fixed text-primary rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium mb-1">Đang khám</p>
              <p className="text-4xl font-bold text-on-surface">{String(stats.inProgress).padStart(2, "0")}</p>
            </div>

            {/* Completed */}
            <div className="bg-white p-5 rounded-2xl border border-outline-variant clinical-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-tertiary-fixed-dim text-tertiary rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs text-tertiary font-semibold uppercase tracking-wider">Done</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium mb-1">Đã khám</p>
              <p className="text-4xl font-bold text-on-surface">{stats.completed}</p>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white p-7 rounded-2xl border border-outline-variant clinical-shadow">
            <div className="flex justify-between items-center mb-7">
              <div>
                <h3 className="font-bold text-xl text-on-surface">Hoạt động khám bệnh</h3>
                <p className="text-sm text-on-surface-variant/70 mt-0.5">Số lượng ca khám trong 30 ngày qua</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-primary">{stats.monthlyTotal} ca</p>
                <p className="text-xs text-tertiary font-bold flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{stats.monthlyGrowth}% so với tháng trước
                </p>
              </div>
            </div>
            <div className="flex items-end gap-2 h-44 w-full">
              {CHART_BARS.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 ${bar.variant} rounded-t-lg ${bar.height} transition-all hover:opacity-80`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-on-surface-variant opacity-50 px-1">
              <span>Tuần 1</span>
              <span>Tuần 2</span>
              <span>Tuần 3</span>
              <span>Tuần 4</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Rating Card */}
          <div className="bg-secondary text-on-secondary p-6 rounded-2xl clinical-shadow relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-semibold mb-3 opacity-80">Đánh giá trung bình</p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold">4.9</span>
                <div>
                  <div className="flex text-yellow-300 gap-0.5">
                    {[1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <Star className="w-4 h-4 fill-current opacity-50" />
                  </div>
                  <p className="text-xs opacity-70 mt-1">Từ 1,240 lượt bệnh nhân</p>
                </div>
              </div>
            </div>
            <Star className="absolute -right-3 -bottom-3 w-24 h-24 opacity-10" />
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white p-5 rounded-2xl border border-outline-variant clinical-shadow">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-on-surface">Lịch trực tuần này</h4>
              <button className="text-sm text-primary font-semibold hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-3">
              {MOCK_SHIFTS.map((shift) => (
                <div
                  key={shift.dayIndex}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    shift.shiftType !== "off"
                      ? "bg-surface-container-low border border-primary/10"
                      : "hover:bg-surface-container-low opacity-60"
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-outline-variant/30 flex-shrink-0">
                    <span className="text-[10px] font-bold text-on-surface-variant">{shift.day}</span>
                    <span className={`text-base font-bold ${shift.shiftType !== "off" ? "text-primary" : "text-on-surface"}`}>
                      {shift.date}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{shift.shiftLabel}</p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {shift.timeRange ? `${shift.timeRange}${shift.room ? ` • ${shift.room}` : ""}` : "Không có lịch trực"}
                    </p>
                  </div>
                  {shift.shiftType !== "off" && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Report */}
          <div className="bg-surface-container-highest p-5 rounded-2xl border-2 border-dashed border-outline-variant/50 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-bold text-on-surface text-sm mb-1">Báo cáo tuần</p>
            <p className="text-xs text-on-surface-variant mb-4">Bản tóm tắt hiệu suất làm việc tuần qua đã sẵn sàng.</p>
            <button className="w-full py-2 bg-white text-primary rounded-full font-bold text-sm border border-primary/20 shadow-sm hover:bg-primary-fixed transition-colors">
              Tải báo cáo (.pdf)
            </button>
          </div>
        </div>
      </div>

      {/* Next Up Patients */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-xl text-on-surface">Đang chờ khám (Next Up)</h2>
          <Link
            href="/doctor/today"
            className="flex items-center gap-1.5 text-primary font-bold text-sm hover:underline"
          >
            Tất cả danh sách
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {NEXT_UP_PATIENTS.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-5 clinical-shadow hover:scale-[1.01] transition-transform cursor-pointer border border-outline-variant/20"
            >
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                {item.patient.initials}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-lg text-on-surface leading-none mb-1">
                  {item.patient.name}
                </h4>
                <div className="flex gap-3 text-sm text-on-surface-variant">
                  <span>{item.patient.age} tuổi</span>
                  <span>•</span>
                  <span>{item.patient.gender === "male" ? "Nam" : "Nữ"}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className="bg-surface-container px-3.5 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant">
                  {item.timeRange}
                </span>
                {item.roomNumber && (
                  <span className="bg-secondary-container px-3.5 py-1.5 rounded-full text-sm font-semibold text-on-secondary-container">
                    {item.roomNumber}
                  </span>
                )}
              </div>
              <Link
                href={`/doctor/appointments/${item.id}`}
                className="bg-primary text-on-primary px-5 py-2 rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex-shrink-0"
              >
                Mời vào
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative">
          <Plus className="w-6 h-6" />
          <span className="absolute right-16 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
            Thêm bệnh nhân mới
          </span>
        </button>
      </div>
    </div>
  )
}
