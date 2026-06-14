import { api } from '@/lib/axios'
export interface MedicalRecordResponse {
  id: number
  appointmentId: number
  patientId: string
  doctorId: string
  diagnosis: string
  prescription: string
  doctorNote: string
  createdAt: string
}

export interface CreateMedicalRecordRequest {
  appointmentId: number
  patientId: string
  diagnosis: string
  prescription: string
  doctorNote: string
}


export const medicalRecordService = {
  /**
   * Lấy lịch sử bệnh án theo patientId cho bác sĩ
   */
  getRecordsByPatientId: async (patientId: string): Promise<MedicalRecordResponse[]> => {
    const response = await api.get<{ data: MedicalRecordResponse[] }>(`/api/medical-records/patient/${patientId}`)
    return response.data.data
  },

  /**
   * Bác sĩ tạo hồ sơ bệnh án
   */
  createRecord: async (payload: CreateMedicalRecordRequest): Promise<MedicalRecordResponse> => {
    const response = await api.post<{ data: MedicalRecordResponse }>('/api/medical-records', payload)
    return response.data.data
  },
  /**
   * Lấy chi tiết bệnh án theo appointmentId
   */
  getRecordByAppointmentId: async (appointmentId: number): Promise<MedicalRecordResponse> => {
    const response = await api.get<{ data: MedicalRecordResponse }>(`/api/medical-records/appointment/${appointmentId}`)
    return response.data.data
  },
}
