"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarDays, RefreshCw, Loader2, CheckCircle } from "lucide-react"
import { AppointmentTable } from "@/components/doctor/appointment-table"
import { cn } from "@/lib/utils"
import { appointmentService, type PatientApiResponse } from "@/services/appointment.service"
import type { Appointment, AppointmentApiResponse, SessionType, Patient } from "@/types/appointment"
import { toast } from "sonner"

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Lấy ngày hôm nay theo format YYYY-MM-DD */
function getTodayDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Format ngày hiển thị: "Thứ Hai, 09 Tháng 6, 2026" */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
  const dayName = days[date.getDay()]
  const day = String(date.getDate()).padStart(2, "0")
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${dayName}, ${day} Tháng ${month}, ${year}`
}

/** Tính sessionType từ slotTime ("08:00:00" → "morning", "14:00:00" → "afternoon") */
function getSessionType(slotTime: string): "morning" | "afternoon" {
  const hour = parseInt(slotTime.split(":")[0], 10)
  return hour < 12 ? "morning" : "afternoon"
}

/** Tính timeRange từ slotTime (mặc định 30 phút) */
function computeTimeRange(slotTime: string): string {
  const parts = slotTime.split(":")
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const start = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  const totalEndMin = h * 60 + m + 30
  const endH = Math.floor(totalEndMin / 60)
  const endM = totalEndMin % 60
  const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
  return `${start} - ${end}`
}

/** Tính tuổi từ ngày sinh */
function calculateAge(dob: string | null): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/** Tạo initials từ tên ("Nguyễn Văn A" → "NA") */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?"
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Map gender từ backend (MALE/FEMALE/OTHER) → frontend (male/female/other) */
function mapGender(gender: string | null): "male" | "female" | "other" {
  if (!gender) return "other"
  switch (gender.toUpperCase()) {
    case "MALE": return "male"
    case "FEMALE": return "female"
    default: return "other"
  }
}

// ── Session tabs ──────────────────────────────────────────────────────────────

const SESSION_TABS: { label: string; value: SessionType }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Ca sáng", value: "morning" },
  { label: "Ca chiều", value: "afternoon" },
]

type StatusFilter = "all" | "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED"
const STATUS_TABS: { label: string; value: StatusFilter; color: string }[] = [
  { label: "Tất cả", value: "all", color: "bg-primary" },
  { label: "Chờ xác nhận", value: "PENDING_PAYMENT", color: "bg-amber-500" },
  { label: "Đã xác nhận", value: "CONFIRMED", color: "bg-blue-500" },
  { label: "Đã khám", value: "COMPLETED", color: "bg-green-500" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TodayAppointmentsPage() {
  const [session, setSession] = useState<SessionType>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [date, setDate] = useState(getTodayDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  /**
   * Fetch appointments từ API và enrich với thông tin patient
   */
  const fetchAppointments = useCallback(async () => {
    try {
      setError(null)

      // 1. Lấy danh sách appointments từ clinic_appointment service
      const rawAppointments: AppointmentApiResponse[] = await appointmentService.getAppointments()

      // 2. Lọc theo ngày đã chọn — hiển thị tất cả trạng thái (kể cả PENDING_PAYMENT để bác sĩ xác nhận)
      const filteredByDate = rawAppointments.filter(
        (a) =>
          a.appointmentDate === date &&
          a.status !== "CANCELLED"
      )

      // 3. Sắp xếp theo slotTime
      filteredByDate.sort((a, b) => a.slotTime.localeCompare(b.slotTime))

      // 4. Fetch thông tin patient cho từng appointment (song song)
      const patientIds = [...new Set(filteredByDate.map((a) => a.patientId))]
      const patientMap = new Map<string, PatientApiResponse>()

      const patientResults = await Promise.allSettled(
        patientIds.map((id) => appointmentService.getPatientInfo(id))
      )

      patientResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          patientMap.set(patientIds[index], result.value)
        }
      })

      // 5. Map thành Appointment[] cho UI
      const mapped: Appointment[] = filteredByDate.map((raw, index) => {
        const patientInfo = patientMap.get(raw.patientId)

        const name = raw.patientName || patientInfo?.fullName || `Bệnh nhân #${raw.patientId.slice(0, 8)}`
        const phone = raw.patientPhone || patientInfo?.phone

        const patient: Patient = patientInfo
          ? {
              id: patientInfo.userId,
              name: name,
              age: calculateAge(patientInfo.dob),
              gender: mapGender(patientInfo.gender),
              initials: getInitials(name),
              phone: phone,
            }
          : {
              id: raw.patientId,
              name: name,
              age: 0,
              gender: "other" as const,
              initials: getInitials(name),
              phone: phone,
            }

        return {
          id: raw.id,
          orderNumber: index + 1,
          patient,
          timeRange: computeTimeRange(raw.slotTime),
          sessionType: getSessionType(raw.slotTime),
          status: raw.status,
          reason: raw.notes || "",
          date: raw.appointmentDate,
          doctorId: raw.doctorId,
          specialtyId: raw.specialtyId,
        }
      })

      setAppointments(mapped)
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err)
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách lịch khám")
    }
  }, [date])

  // Fetch khi component mount hoặc khi date thay đổi
  useEffect(() => {
    setLoading(true)
    fetchAppointments().finally(() => setLoading(false))
  }, [fetchAppointments])

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAppointments()
    setRefreshing(false)
  }

  // Lọc theo session và status
  const filtered = appointments.filter(
    (a) =>
      (session === "all" || a.sessionType === session) &&
      (statusFilter === "all" || a.status === statusFilter)
  )

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING_PAYMENT").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  }

  const handleConfirm = async (id: number) => {
    setConfirmingId(id)
    try {
      await appointmentService.confirmAppointment(id)
      toast.success("Đã xác nhận lịch hẹn!")
      await fetchAppointments()
    } catch (err: any) {
      toast.error("Xác nhận thất bại: " + (err?.response?.data?.message || err?.message))
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner */}
      <section className="relative p-8 rounded-3xl bg-primary-container text-on-primary-container overflow-hidden diagonal-bg-login">
        <div className="relative z-10">
          <h1 className="font-bold text-3xl mb-1">Lịch Khám Hôm Nay</h1>
          <p className="text-lg opacity-90">
            {formatDisplayDate(date)} •{" "}
            <span className="font-bold">Bạn có {counts.confirmed} đã xác nhận</span>{counts.pending > 0 && <span className="font-bold text-yellow-200"> • {counts.pending} chờ xác nhận</span>}
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

        {/* Status filter tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trạng thái</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                  statusFilter === tab.value
                    ? `${tab.color} text-white shadow-sm`
                    : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-container"
                )}
              >
                {tab.label}
                {tab.value === "PENDING_PAYMENT" && counts.pending > 0 && (
                  <span className="ml-1.5 bg-white/30 rounded-full px-1.5 py-0.5 text-[10px]">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary + Refresh */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span>Tổng: <strong className="text-on-surface">{filtered.length}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Chờ: <strong className="text-amber-500">{counts.pending}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Xác nhận: <strong className="text-primary">{counts.confirmed}</strong></span>
            <span className="w-px h-4 bg-outline-variant" />
            <span>Đã khám: <strong className="text-tertiary">{counts.completed}</strong></span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-primary hover:bg-primary-fixed rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </section>

      {/* Appointment List */}
      <section>
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
            <p className="font-semibold text-lg">Đang tải lịch khám...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-on-surface-variant">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error-container flex items-center justify-center">
              <span className="text-error text-xl">!</span>
            </div>
            <p className="font-semibold text-lg text-error">Có lỗi xảy ra</p>
            <p className="text-sm mt-1 opacity-70">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <AppointmentTable
            appointments={filtered}
            onConfirm={handleConfirm}
            confirmingId={confirmingId}
          />
        )}
      </section>
    </div>
  )
}
