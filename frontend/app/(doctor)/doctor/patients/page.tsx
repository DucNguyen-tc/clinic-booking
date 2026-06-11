"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Loader2 } from "lucide-react"
import { PatientListTable } from "@/components/doctor/patient-list-table"
import type { PatientRecord } from "@/types/patient"
import { appointmentService, type PatientApiResponse } from "@/services/appointment.service"
import type { AppointmentApiResponse } from "@/types/appointment"

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0 })

  const fetchPatients = useCallback(async () => {
    try {
      const rawAppointments: AppointmentApiResponse[] = await appointmentService.getAppointments()
      
      const patientMap = new Map<string, { totalVisits: number, lastVisitDate: string, code: string, visitDates: string[] }>()
      
      rawAppointments.forEach(appt => {
        const pId = appt.patientId
        if (!patientMap.has(pId)) {
          patientMap.set(pId, {
            totalVisits: 1,
            lastVisitDate: appt.appointmentDate,
            code: `BN-${pId.substring(0, 8).toUpperCase()}`,
            visitDates: [appt.appointmentDate]
          })
        } else {
          const current = patientMap.get(pId)!
          current.totalVisits += 1
          if (!current.visitDates.includes(appt.appointmentDate)) {
            current.visitDates.push(appt.appointmentDate)
          }
          if (appt.appointmentDate > current.lastVisitDate) {
            current.lastVisitDate = appt.appointmentDate
          }
        }
      })
      
      const total = patientMap.size
      
      const patientIds = Array.from(patientMap.keys())
      const profileMap = new Map<string, PatientApiResponse>()
      
      const results = await Promise.allSettled(
        patientIds.map(id => appointmentService.getPatientInfo(id))
      )
      
      results.forEach((res, i) => {
        if (res.status === "fulfilled") {
          profileMap.set(patientIds[i], res.value)
        }
      })
      
      const mapped: PatientRecord[] = patientIds.map(id => {
        const info = patientMap.get(id)!
        const profile = profileMap.get(id)
        
        let age = 0
        let gender: "male"|"female"|"other" = "other"
        let initials = "??"
        let name = `Bệnh nhân #${id.slice(0, 8)}`
        let phone = ""
        
        if (profile) {
          name = profile.fullName
          phone = profile.phone || ""
          if (profile.dob) {
            const birth = new Date(profile.dob)
            const today = new Date()
            age = today.getFullYear() - birth.getFullYear()
            const m = today.getMonth() - birth.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
          }
          if (profile.gender === "MALE") gender = "male"
          else if (profile.gender === "FEMALE") gender = "female"
          
          const parts = name.trim().split(/\s+/)
          if (parts.length === 1) initials = parts[0][0]?.toUpperCase() ?? "?"
          else if (parts.length > 1) initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        
        return {
          id: id,
          code: info.code,
          name: name,
          age: age,
          gender: gender,
          phone: phone || "Chưa cập nhật",
          initials: initials,
          lastVisitDate: new Date(info.lastVisitDate).toLocaleDateString("vi-VN"),
          totalVisits: info.totalVisits,
          status: "active",
          visitDates: info.visitDates,
        }
      })
      
      setPatients(mapped.sort((a, b) => b.totalVisits - a.totalVisits))
      setStats({ total, newThisMonth: Math.floor(total * 0.1) })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return (
    <div className="max-w-7xl mx-auto space-y-0">
      {/* Page Header */}
      <section className="relative bg-surface-container pb-20 pt-10 overflow-hidden rounded-3xl mb-0">
        <div className="absolute inset-0 bg-primary/[0.03] -z-10 diagonal-bg-login" />
        <div className="px-8 max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-sm font-semibold rounded-full mb-4">
                Quản lý lâm sàng
              </span>
              <h1 className="text-4xl font-bold text-on-surface">Danh sách Bệnh nhân</h1>
              <p className="text-on-surface-variant text-lg max-w-xl mt-3">
                Quản lý hồ sơ, lịch sử khám bệnh và thông tin liên lạc của bệnh nhân tập trung tại một nơi.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl border border-outline-variant clinical-shadow text-center min-w-[120px]">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tổng số</p>
                <p className="text-2xl font-bold text-primary mt-1">{stats.total.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-outline-variant clinical-shadow text-center min-w-[120px]">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tháng này</p>
                <p className="text-2xl font-bold text-tertiary mt-1">+{stats.newThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="-mt-10 relative z-10 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-outline-variant clinical-shadow mx-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-on-surface-variant font-medium">Đang tải danh sách...</span>
          </div>
        ) : (
          <PatientListTable patients={patients} stats={stats} />
        )}
      </section>
    </div>
  )
}
