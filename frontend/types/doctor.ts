// ========================================
// Doctor Types
// ========================================

export interface Doctor {
  id: string
  name: string
  specialty: string
  avatarUrl?: string
  rating?: number
  reviewCount?: number
}

export interface DoctorProfile extends Doctor {
  email: string
  phone: string
  department: string
  licenseNumber: string
  yearsOfExperience: number
}

export interface WeeklyShift {
  day: string        // "Thứ 2", "Thứ 3", ...
  dayIndex: number   // 0 = Mon, 6 = Sun
  date: number       // day of month
  shiftType: "morning" | "afternoon" | "fullday" | "off"
  shiftLabel: string // "Trực ca sáng", "Nghỉ bù", ...
  timeRange?: string // "08:00 - 12:00"
  room?: string      // "Phòng 402"
}

export interface DoctorStats {
  totalToday: number
  waiting: number
  inProgress: number
  completed: number
  monthlyTotal: number
  monthlyGrowth: number // percentage e.g. 12 means +12%
}

// ========================================
// Profile & Settings Types
// ========================================

export interface NotificationSettings {
  emailNewAppointment: boolean
  browserPush: boolean
  smsReminder: boolean
}

export interface DoctorProfileFormData {
  fullName: string
  specialtyId: number
  specialtyName?: string
  degree: string
  experienceYears: number
  price: number
}

export interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ========================================
// Schedule Calendar Types
// ========================================

export type ShiftSlotType = "morning" | "afternoon" | "fullday" | "leave"

export interface ShiftSlot {
  type: ShiftSlotType
  label: string         // "MORNING", "AFTERNOON", "FULL DAY", "On Leave"
  booked: number
  capacity: number
}

export interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  shifts: ShiftSlot[]
}

export interface ScheduleNote {
  title: string
  description: string
  variant: "info" | "warning"
}

export interface WeeklyScheduleStats {
  totalShifts: number
  expectedPatients: number
  fillRate: number      // percentage
}
