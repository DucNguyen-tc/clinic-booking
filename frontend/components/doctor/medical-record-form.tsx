"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PrescriptionTable } from "@/components/doctor/prescription-table"
import { medicalRecordSchema, type MedicalRecordFormData } from "@/types/medical-record"
import { medicalRecordService } from "@/services/medical-record.service"

interface MedicalRecordFormProps {
  appointmentId: number
  patientId: string
  onSubmitSuccess?: (data: MedicalRecordFormData) => void
}

export function MedicalRecordForm({ appointmentId, patientId, onSubmitSuccess }: MedicalRecordFormProps) {
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
    try {
      console.log("Submitting medical record for appointment:", appointmentId, data)
      
      const payload = {
        appointmentId: appointmentId,
        patientId: patientId,
        diagnosis: data.primaryDiagnosis,
        prescription: JSON.stringify(data.prescriptions),
        doctorNote: data.doctorAdvice || "",
      }

      await medicalRecordService.createRecord(payload)
      toast.success("Đã lưu hồ sơ bệnh án thành công!")
      onSubmitSuccess?.(data)
    } catch (error) {
      console.error("Failed to submit medical record:", error)
      toast.error("Lưu hồ sơ bệnh án thất bại. Vui lòng thử lại.")
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-outline-variant clinical-shadow">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
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
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu bệnh án...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Hoàn tất khám &amp; Lưu bệnh án
              </>
            )}
          </button>
          <p className="text-center mt-3 text-xs text-on-surface-variant">
            Bệnh án sẽ được tự động đồng bộ vào hệ thống quản lý trung tâm và gửi thông báo cho bệnh nhân.
          </p>
        </div>
      </form>
    </div>
  )
}
