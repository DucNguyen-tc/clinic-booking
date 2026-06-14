import { api } from '@/lib/axios'

export interface CreatePaymentRequest {
  appointmentId: number
  amount: number
  paymentMethod: string     // "VNPAY" | "MOMO"
  orderInfo?: string
}

export interface CreatePaymentResponse {
  paymentId: number
  appointmentId: number
  paymentUrl: string        // URL redirect sang VNPay/MoMo
  status: string
}

export interface PaymentStatusResponse {
  id: number
  appointmentId: number
  amount: number
  paymentMethod: string
  transactionNo: string | null
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  createdAt: string
}

export const paymentService = {
  /**
   * Tạo phiên thanh toán — trả về paymentUrl để redirect
   */
  createPayment: async (req: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/api/payments', req)
    return response.data
  },

  /**
   * Kiểm tra trạng thái thanh toán của appointment
   */
  getPaymentStatus: async (appointmentId: number): Promise<PaymentStatusResponse> => {
    const response = await api.get<PaymentStatusResponse>(`/api/payments/appointment/${appointmentId}`)
    return response.data
  },
}
