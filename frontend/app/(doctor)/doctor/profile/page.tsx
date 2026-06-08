"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Lock, Heart } from "lucide-react";
import Image from "next/image";
import { ProfileForm } from "@/components/doctor/profile-form";
import type {
  DoctorProfileFormData,
  PasswordChangeFormData,
} from "@/types/doctor";
import { doctorProfileService } from "@/services/doctor.service";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Mock Data Removed ──────────────────────────────────────────────────────────

// ── Password Change Schema ────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
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
    try {
      await doctorProfileService.changePassword(data);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error: any) {
      toast.error(
        "Lỗi đổi mật khẩu: " + (error.response?.data?.message || error.message),
      );
    }
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
            placeholder="Tối thiểu 6 ký tự"
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
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<DoctorProfileFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      doctorProfileService
        .getProfile(user.id.toString())
        .then((res) => {
          if (res.data) {
            setProfile({
              fullName: res.data.fullName,
              specialtyId: res.data.specialty?.id || 1,
              specialtyName: res.data.specialty?.name || "",
              degree: res.data.degree,
              experienceYears: res.data.experienceYears,
              price: res.data.price,
            });
          }
        })
        .catch((err) => console.error("Failed to load profile", err))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleUpdateProfile = async (data: DoctorProfileFormData) => {
    if (!user?.id) return;
    try {
      await doctorProfileService.updateProfile(user.id.toString(), {
        userId: user.id.toString(),
        specialtyId: data.specialtyId,
        fullName: data.fullName,
        degree: data.degree,
        experienceYears: data.experienceYears,
        price: data.price,
      } as any);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      toast.error(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-on-surface-variant">
        Đang tải hồ sơ...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-0">
      {/* Hero Header */}
      <section className="bg-primary text-on-primary pt-12 pb-12 px-12 rounded-3xl relative overflow-hidden mb-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-40 h-40 rounded-3xl border-4 border-on-primary clinical-shadow bg-secondary-container flex items-center justify-center overflow-hidden">
              <Image
                src="/images/doctor-image.png"
                alt="Avatar"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-3 rounded-full clinical-shadow hover:scale-105 transition-transform">
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <h1 className="text-4xl font-bold">
              Bác sĩ {profile?.fullName || "Chưa cập nhật"}
            </h1>
            <p className="text-lg opacity-90 flex items-center gap-2 mt-1">
              <Heart className="w-5 h-5" />
              Chuyên khoa {profile?.specialtyName || "Chưa cập nhật"} •{" "}
              {profile?.experienceYears || 0} năm kinh nghiệm
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="-mt-12 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Left: Profile + Notifications */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {profile && (
              <ProfileForm
                defaultValues={profile}
                onSubmit={handleUpdateProfile}
              />
            )}
          </div>

          {/* Right: Password + Account Status + Logout */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <PasswordChangeCard />
          </div>
        </div>
      </section>
    </div>
  );
}
