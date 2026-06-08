import { api } from '@/lib/axios'
import type { DoctorProfileFormData, PasswordChangeFormData } from '@/types/doctor'

export const doctorProfileService = {
  getProfile: async (userId: string) => {
    // API backend: GET /api/doctors/{userId}
    const response = await api.get(`/api/doctors/${userId}`)
    return response.data
  },

  updateProfile: async (userId: string, data: Partial<DoctorProfileFormData>) => {
    // API backend: PUT /api/doctors/{userId}
    const response = await api.put(`/api/doctors/${userId}`, data)
    return response.data
  },

  changePassword: async (data: PasswordChangeFormData) => {
    // API backend: POST /api/auth/change-password
    const response = await api.post('/api/auth/change-password', data)
    return response.data
  }
}
