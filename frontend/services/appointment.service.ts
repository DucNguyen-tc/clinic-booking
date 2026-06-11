import { api } from '@/lib/axios'
import type { AppointmentApiResponse } from '@/types/appointment'

// Response thông tin bệnh nhân từ clinic_profile
export interface PatientApiResponse {
  userId: string
  fullName: string
  dob: string | null       // "1996-05-24"
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string | null
}

export const appointmentService = {
  /**
   * Lấy danh sách appointments
   * Backend tự phân biệt theo role (DOCTOR → trả appointments có doctorId = userId)
   */
  getAppointments: async (): Promise<AppointmentApiResponse[]> => {
    const response = await api.get<{ data: AppointmentApiResponse[] }>('/api/appointments')
    return response.data.data
  },

  /**
   * Xác nhận appointment (PENDING_PAYMENT → CONFIRMED)
   */
  confirmAppointment: async (id: number) => {
    const response = await api.put(`/api/appointments/${id}/confirm`)
    return response.data
  },

  /**
   * Hoàn thành appointment (CONFIRMED → COMPLETED)
   */
  completeAppointment: async (id: number) => {
    const response = await api.put(`/api/appointments/${id}/complete`)
    return response.data
  },

  /**
   * Hủy appointment
   */
  cancelAppointment: async (id: number) => {
    const response = await api.put(`/api/appointments/${id}/cancel`)
    return response.data
  },

  /**
   * Lấy thông tin chi tiết appointment theo ID
   */
  getAppointmentById: async (id: string | number): Promise<AppointmentApiResponse> => {
    const response = await api.get<{ data: AppointmentApiResponse }>(`/api/appointments/${id}`)
    return response.data.data
  },

  /**
   * Lấy thông tin bệnh nhân từ clinic_profile service
   */
  getPatientInfo: async (patientId: string): Promise<PatientApiResponse> => {
    const response = await api.get<{ data: PatientApiResponse }>(`/api/patients/${patientId}`)
    return response.data.data
  },
}

