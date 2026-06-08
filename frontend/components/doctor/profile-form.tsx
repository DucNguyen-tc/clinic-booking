"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Award, Save } from "lucide-react"
import type { DoctorProfileFormData } from "@/types/doctor"

// ── Zod Schema ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên không được để trống"),
  specialtyId: z.number(),
  specialtyName: z.string().optional(),
  degree: z.string().min(2, "Bằng cấp không được để trống"),
  experienceYears: z.number().min(0, "Số năm kinh nghiệm không hợp lệ"),
  price: z.number().min(0, "Giá khám không hợp lệ"),
})

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProfileFormProps {
  defaultValues: DoctorProfileFormData
  onSubmit?: (data: DoctorProfileFormData) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileForm({ defaultValues, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DoctorProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const handleFormSubmit = async (data: DoctorProfileFormData) => {
    // TODO: Call API PUT /api/v1/doctors/profile
    console.log("Saving profile:", data)
    await new Promise((r) => setTimeout(r, 600))
    onSubmit?.(data)
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[2rem] clinical-shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-2xl text-primary">Thông tin cá nhân</h2>
        {isDirty && (
          <button
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        )}
        {!isDirty && (
          <button
            type="button"
            className="px-6 py-2 border border-primary text-primary rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Họ và tên</label>
            <input
              {...register("fullName")}
              className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            {errors.fullName && <p className="text-error text-xs">{errors.fullName.message}</p>}
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Chuyên khoa</label>
            <input
              {...register("specialtyName")}
              disabled
              className="w-full bg-surface-container border border-outline-variant rounded-xl p-4 text-on-surface-variant cursor-not-allowed outline-none transition-all"
            />
          </div>

          {/* Degree */}
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Bằng cấp</label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                {...register("degree")}
                className="w-full bg-surface border border-outline-variant rounded-xl p-4 pl-11 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            {errors.degree && <p className="text-error text-xs">{errors.degree.message}</p>}
          </div>

          {/* Experience Years */}
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Số năm kinh nghiệm</label>
            <input
              {...register("experienceYears", { valueAsNumber: true })}
              type="number"
              className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            {errors.experienceYears && <p className="text-error text-xs">{errors.experienceYears.message}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Giá khám (VND)</label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            {errors.price && <p className="text-error text-xs">{errors.price.message}</p>}
          </div>
        </div>
      </form>
    </div>
  )
}
