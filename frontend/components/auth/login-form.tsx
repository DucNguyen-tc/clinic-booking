"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/store/auth-store"
import { authService } from "@/services/auth.service"
import { api } from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { loginSchema, type LoginFormData } from "@/types/auth"

export function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Gọi API Login lấy accessToken
      const loginRes = await authService.login(data)
      const accessToken = loginRes.data.token

      // 2. Set tạm token cho instance api để gọi getMe
      // Mặc dù axios interceptor sẽ tự lấy, nhưng vì setState chưa update ngay lập tức
      // nên ta cấu hình axios mặc định
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      // 3. Gọi API getMe
      const userRes = await authService.getMe()
      const user = userRes.data

      // 4. Lưu vào Zustand Store
      setAuth(accessToken, user)

      // 5. Điều hướng theo role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (user.role === 'DOCTOR') {
        router.push('/doctor/today')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      // TODO: Handle display error message (toast)
    }
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="mb-10 text-left">
        <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-inverse-on-surface mb-3 tracking-tight">Đăng nhập</h1>
        <p className="font-body-lg text-lg text-outline-variant">Chào mừng bạn quay trở lại</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="font-label-md text-sm text-inverse-on-surface/90 font-semibold tracking-wide">
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className={errors.email ? "border-error focus:ring-error" : ""}
              {...register("email")}
            />
            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant/60 h-5 w-5" />
          </div>
          {errors.email && (
            <p className="text-error text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="font-label-md text-sm text-inverse-on-surface/90 font-semibold tracking-wide">
              Mật khẩu
            </label>
            <Link href="#" className="font-label-md text-xs md:text-sm text-primary-fixed hover:text-primary transition-colors font-semibold">
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            className={errors.password ? "border-error focus:ring-error" : ""}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-error text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            id="remember"
            type="checkbox"
            className="w-5 h-5 rounded border-outline-variant/30 bg-inverse-surface text-primary focus:ring-primary"
            {...register("remember")}
          />
          <label htmlFor="remember" className="font-label-md text-sm text-inverse-on-surface/90 cursor-pointer font-semibold">
            Duy trì đăng nhập
          </label>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-8">
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </Button>

        <div className="pt-8 text-center border-t border-outline-variant/10 mt-6">
          <p className="font-body-lg text-sm md:text-base text-outline-variant">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary-fixed font-bold hover:underline ml-1 transition-all">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
