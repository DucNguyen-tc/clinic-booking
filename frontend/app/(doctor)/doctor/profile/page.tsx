"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Pencil,
  Lock,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Heart,
} from "lucide-react";
import { ProfileForm } from "@/components/doctor/profile-form";
import { NotificationSettingsCard } from "@/components/doctor/notification-settings";
import type {
  DoctorProfileFormData,
  NotificationSettings,
  PasswordChangeFormData,
} from "@/types/doctor";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PROFILE: DoctorProfileFormData = {
  fullName: "Nguyễn Anh",
  specialty: "Nội tim mạch & Can thiệp",
  degree: "Tiến sĩ Y khoa (PhD)",
  workEmail: "anh.nguyen@medibook.vn",
  phone: "090 123 4567",
  bio: "Bác sĩ Nguyễn Anh là chuyên gia hàng đầu trong lĩnh vực Nội tim mạch với hơn 15 năm kinh nghiệm công tác tại các bệnh viện lớn. Ông chuyên điều trị các bệnh lý cao huyết áp, suy tim và can thiệp mạch vành, luôn áp dụng các kỹ thuật tiên tiến nhất để đảm bảo hiệu quả điều trị tối ưu cho bệnh nhân.",
};

const MOCK_NOTIFICATIONS: NotificationSettings = {
  emailNewAppointment: true,
  browserPush: false,
  smsReminder: true,
};

// ── Password Change Schema ────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// ── Password Card Component ───────────────────────────────────────────────────

function PasswordChangeCard() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    console.log("Changing password:", data);
    await new Promise((r) => setTimeout(r, 600));
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[2rem] clinical-shadow">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-2xl text-primary">Bảo mật</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-on-surface-variant">
            Mật khẩu hiện tại
          </label>
          <input
            {...register("currentPassword")}
            type="password"
            placeholder="••••••••"
            className="w-full bg-surface border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          {errors.currentPassword && (
            <p className="text-error text-xs">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-on-surface-variant">
            Mật khẩu mới
          </label>
          <input
            {...register("newPassword")}
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            className="w-full bg-surface border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          {errors.newPassword && (
            <p className="text-error text-xs">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-on-surface-variant">
            Xác nhận mật khẩu
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            className="w-full bg-surface border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
          />
          {errors.confirmPassword && (
            <p className="text-error text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorProfilePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-0">
      {/* Hero Header */}
      <section className="bg-primary text-on-primary pt-12 pb-12 px-12 rounded-3xl relative overflow-hidden mb-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-40 h-40 rounded-3xl border-4 border-on-primary clinical-shadow bg-secondary-container flex items-center justify-center overflow-hidden">
              <span className="text-5xl font-bold text-on-secondary-container">
                NA
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-3 rounded-full clinical-shadow hover:scale-105 transition-transform">
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <h1 className="text-4xl font-bold">Bác sĩ Nguyễn Anh</h1>
            <p className="text-lg opacity-90 flex items-center gap-2 mt-1">
              <Heart className="w-5 h-5" />
              Chuyên khoa Tim mạch • 15 năm kinh nghiệm
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="-mt-12 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Left: Profile + Notifications */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <ProfileForm defaultValues={MOCK_PROFILE} />
            <NotificationSettingsCard defaultValues={MOCK_NOTIFICATIONS} />
          </div>

          {/* Right: Password + Account Status + Logout */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <PasswordChangeCard />

            {/* Account Status Card */}
            <div className="bg-tertiary-container/10 border border-tertiary-container/30 p-8 rounded-[2rem] clinical-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-xs font-bold">
                  ACTIVE
                </span>
                <ShieldCheck className="w-6 h-6 text-tertiary" />
              </div>
              <h3 className="font-semibold text-2xl text-on-surface mb-2">
                Tài khoản chính thức
              </h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Hồ sơ của bạn đã được xác thực bởi hội đồng y khoa.
              </p>
              <div className="h-2 bg-on-surface/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-tertiary rounded-full" />
              </div>
              <p className="text-xs mt-2 text-on-surface-variant/60">
                Lần cập nhật cuối: 12/10/2023
              </p>
            </div>

            {/* Logout */}
            <div className="bg-error-container/20 border border-error-container p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-error-container/40 transition-colors">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-error" />
                <span className="font-semibold text-sm text-error">
                  Đăng xuất tài khoản
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-error group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Stats */}
      <footer className="bg-surface-container-high py-12 px-12 text-center rounded-3xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <Heart className="w-8 h-8 text-primary mx-auto" />
          <p className="text-lg text-on-surface">
            Cảm ơn sự tận tâm của bạn vì sức khỏe cộng đồng.
          </p>
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">1,240+</p>
              <p className="text-xs text-on-surface-variant">
                Bệnh nhân đã khám
              </p>
            </div>
            <div className="h-10 w-px bg-outline-variant" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4.9/5</p>
              <p className="text-xs text-on-surface-variant">
                Đánh giá trung bình
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
