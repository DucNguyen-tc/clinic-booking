// ========================================
// Appointment Types
// ========================================

// Backend enum: PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED
// UI chỉ hiển thị CONFIRMED và COMPLETED
export type AppointmentStatus = "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

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
  id: number
  orderNumber: number
  patient: Patient
  timeRange: string       // "08:00 - 08:30"
  sessionType: SessionType
  status: AppointmentStatus
  reason?: string          // "Khám định kỳ", "Đau thắt ngực"
  roomNumber?: string      // "UT1", "Phòng 402"
  doctorId?: string
  date: string             // ISO date string "2024-05-24"
  specialtyId?: number
}

// Raw response từ backend clinic_appointment
export interface AppointmentApiResponse {
  id: number
  patientId: string
  doctorId: string
  specialtyId: number
  appointmentDate: string    // "2024-05-24"
  slotTime: string           // "08:00:00"
  status: AppointmentStatus
  createdAt: string
}
