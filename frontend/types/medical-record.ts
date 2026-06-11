import { z } from "zod"

// ========================================
// Medical Record Types
// ========================================

export interface PrescriptionItem {
  id: string
  medicationName: string
  dosage: string          // "1 viên/ngày"
  quantity: number | string
  instructions: string    // "Uống sáng sau ăn"
}

export interface MedicalHistoryEntry {
  date: string            // "15/02/2024"
  department: string      // "Nội khoa"
  diagnosis: string       // "Viêm phế quản cấp"
  notes: string           // "Bác sĩ: Trần Thu Hà. Điều trị ngoại trú 7 ngày."
}

export interface MedicalRecord {
  id?: string
  appointmentId: string
  primaryDiagnosis: string
  doctorAdvice?: string
  prescriptions: PrescriptionItem[]
  attachmentUrls?: string[]
  createdAt?: string
}

// ========================================
// Zod schemas for form validation
// ========================================

export const prescriptionItemSchema = z.object({
  id: z.string(),
  medicationName: z.string().min(1, "Tên thuốc không được để trống"),
  dosage: z.string().min(1, "Liều lượng không được để trống"),
  quantity: z.union([z.number().min(1), z.string()]),
  instructions: z.string().min(1, "Cách dùng không được để trống"),
})

export const medicalRecordSchema = z.object({
  primaryDiagnosis: z.string().min(2, "Chẩn đoán chính không được để trống"),
  doctorAdvice: z.string().optional(),
  prescriptions: z.array(prescriptionItemSchema),
})

export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>
