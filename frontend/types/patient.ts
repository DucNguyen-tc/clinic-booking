// ========================================
// Patient Types (for Doctor Portal)
// ========================================

export type PatientGender = "male" | "female" | "other"

export interface PatientRecord {
  id: string
  code: string            // "BN-2023-0891"
  name: string
  age: number
  gender: PatientGender
  phone: string
  email?: string
  avatarUrl?: string
  initials: string
  bloodType?: string
  lastVisitDate: string   // "12/10/2023"
  totalVisits: number
  status: "active" | "inactive"
  address?: string
  visitDates: string[]
}

export interface PatientFilter {
  searchQuery: string
  gender: PatientGender | "all"
  dateFrom?: string
  dateTo?: string
  status: "active" | "inactive" | "all"
}

export interface PatientListStats {
  total: number
  newThisMonth: number
}
