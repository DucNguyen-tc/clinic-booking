// ========================================
// Appointment Types
// ========================================

export type AppointmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type SessionType = "all" | "morning" | "afternoon"

export interface Patient {
  id: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  avatarUrl?: string
  initials: string  // e.g. "LH" for "Lê Hoàng"
  bloodType?: string
  weight?: number
  bloodPressure?: string
}

export interface Appointment {
  id: string
  orderNumber: number
  patient: Patient
  timeRange: string       // "08:00 - 08:15"
  sessionType: SessionType
  status: AppointmentStatus
  reason?: string          // "Khám định kỳ", "Đau thắt ngực"
  roomNumber?: string      // "UT1", "Phòng 402"
  doctorId?: string
  date: string             // ISO date string "2024-05-24"
}
