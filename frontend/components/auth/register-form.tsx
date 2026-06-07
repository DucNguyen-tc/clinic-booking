"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { registerSchema, type RegisterFormData } from "@/types/auth";

export function RegisterForm() {
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Gọi API Register (trường terms sẽ bị backend bỏ qua nếu không cần thiết)
      await authService.register(data);

      // Nếu thành công, điều hướng sang trang login (hoặc báo thành công)
      router.push("/login");
    } catch (error: any) {
      console.error("Register failed:", error);
      // TODO: Handle display error message (toast)
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="mb-10 text-left">
        <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-inverse-on-surface mb-3 tracking-tight">
          Đăng ký tài khoản
        </h1>
        <p className="font-body-lg text-lg text-outline-variant">
          Tham gia cùng MediBook ngay hôm nay
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-label-md text-sm text-inverse-on-surface/90 font-semibold tracking-wide"
          >
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
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
          <label
            htmlFor="password"
            className="font-label-md text-sm text-inverse-on-surface/90 font-semibold tracking-wide"
          >
            Mật khẩu
          </label>
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

        <div>
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center h-6">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 rounded border-outline-variant/30 bg-inverse-surface text-primary focus:ring-primary"
                {...register("terms")}
              />
            </div>
            <label
              htmlFor="terms"
              className="font-body-md text-sm md:text-base text-inverse-on-surface/90 leading-relaxed cursor-pointer select-none"
            >
              Tôi đồng ý với các{" "}
              <span className="text-primary-fixed hover:text-primary hover:underline cursor-pointer font-semibold transition-all">
                điều khoản
              </span>{" "}
              và{" "}
              <span className="text-primary-fixed hover:text-primary hover:underline cursor-pointer font-semibold transition-all">
                chính sách
              </span>
            </label>
          </div>
          {errors.terms && (
            <p className="text-error text-sm mt-1">{errors.terms.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-8">
          {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
        </Button>

        <div className="pt-8 text-center border-t border-outline-variant/10 mt-6">
          <p className="font-body-lg text-sm md:text-base text-outline-variant">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary-fixed font-bold hover:underline ml-1 transition-all"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
