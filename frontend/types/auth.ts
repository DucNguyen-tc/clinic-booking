import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
  remember: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
  terms: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với các điều khoản.",
  }),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}
