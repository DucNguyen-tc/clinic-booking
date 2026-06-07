import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Tạo instance cho các request thông thường
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để đính kèm cookie (refresh token)
})

// Biến cờ để kiểm tra xem có đang gọi API refresh token hay không
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor cho Request: Đính kèm Access Token vào header
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor cho Response: Xử lý lỗi 401
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu API lỗi 401 là API refresh, thì không retry để tránh loop vô hạn
      if (originalRequest.url === '/api/auth/refresh') {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API refresh token
        // Lưu ý: cookie refresh token sẽ tự động được gửi đi do withCredentials: true
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = data.data.token

        // Lưu token mới vào store
        useAuthStore.getState().setAccessToken(newAccessToken)

        // Cập nhật lại request ban đầu với token mới
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        // Có thể redirect về trang đăng nhập ở đây hoặc xử lý ở component
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
