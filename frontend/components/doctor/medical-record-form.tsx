"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, UploadCloud, CheckCircle } from "lucide-react"
import { PrescriptionTable } from "@/components/doctor/prescription-table"
import { medicalRecordSchema, type MedicalRecordFormData } from "@/types/medical-record"

interface MedicalRecordFormProps {
  appointmentId: string
  onSubmitSuccess?: (data: MedicalRecordFormData) => void
}

export function MedicalRecordForm({ appointmentId, onSubmitSuccess }: MedicalRecordFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      prescriptions: [],
    },
  })

  const onSubmit = async (data: MedicalRecordFormData) => {
    // TODO: Call API POST /api/v1/medical-records
    console.log("Submitting medical record for appointment:", appointmentId, data)
    await new Promise((r) => setTimeout(r, 800)) // Simulate async
    onSubmitSuccess?.(data)
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-outline-variant clinical-shadow">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant px-1">
              Chẩn đoán chính <span className="text-error">*</span>
            </label>
            <input
              {...register("primaryDiagnosis")}
              className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-sm bg-surface-bright outline-none transition-all"
              placeholder="Nhập chẩn đoán lâm sàng..."
            />
            {errors.primaryDiagnosis && (
              <p className="text-error text-xs mt-1">{errors.primaryDiagnosis.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant px-1">
              Mã ICD-10
            </label>
            <div className="relative">
              <input
                {...register("icd10Code")}
                className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 pr-12 text-sm bg-surface-bright outline-none transition-all"
                placeholder="Tìm mã bệnh..."
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant px-1">
              Triệu chứng lâm sàng
            </label>
            <textarea
              {...register("clinicalSymptoms")}
              rows={3}
              className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-sm bg-surface-bright outline-none transition-all resize-none"
              placeholder="Ghi chú các triệu chứng quan sát được..."
            />
          </div>
        </div>

        {/* Upload Area */}
        <div className="space-y-4">
          <h4 className="font-bold text-base text-on-surface">Kết quả xét nghiệm / Hình ảnh</h4>
          <div className="border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7 text-secondary" />
            </div>
            <p className="font-semibold text-on-surface text-sm">Nhấp để tải lên hoặc kéo thả tệp</p>
            <p className="text-xs text-on-surface-variant mt-1">Hỗ trợ JPG, PNG, PDF (Tối đa 20MB)</p>
            <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" />
          </div>
        </div>

        {/* Prescription Table */}
        <PrescriptionTable control={control} />

        {/* Doctor Advice */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant px-1">
            Lời dặn của bác sĩ
          </label>
          <textarea
            {...register("doctorAdvice")}
            rows={4}
            className="w-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-4 text-sm bg-surface-bright outline-none transition-all resize-none"
            placeholder="Nhập lời dặn về chế độ ăn uống, nghỉ ngơi hoặc hẹn tái khám..."
          />
        </div>

        {/* Submit CTA */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-primary text-on-primary rounded-full font-bold text-base shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            {isSubmitting ? "Đang lưu..." : "Hoàn tất khám & Lưu bệnh án"}
          </button>
          <p className="text-center mt-3 text-xs text-on-surface-variant">
            Bệnh án sẽ được tự động đồng bộ vào hệ thống quản lý trung tâm và gửi thông báo cho bệnh nhân.
          </p>
        </div>
      </form>
    </div>
  )
}
