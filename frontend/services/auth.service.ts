import { api } from '@/lib/axios'
import type { LoginFormData, RegisterFormData } from '@/types/auth'
import type { User } from '@/store/auth-store'

export const authService = {
  login: async (data: LoginFormData) => {
    // Gọi API login theo định dạng endpoint được user cung cấp
    const response = await api.post('/api/auth/login', data)
    // Response backend trả về theo format: { data: { accessToken: "..." } }
    return response.data
  },

  register: async (data: RegisterFormData) => {
    // Gọi API register
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  getMe: async (): Promise<{ data: User }> => {
    // Lấy thông tin user hiện tại (id, email, role)
    const response = await api.get('/api/auth/get-me')
    return response.data
  },

  logout: async () => {
    // Gọi API logout để xóa cookie refreshToken phía server (nếu có)
    const response = await api.post('/api/auth/logout')
    return response.data
  },
}
