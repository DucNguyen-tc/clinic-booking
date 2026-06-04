import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { PatientSummaryCard } from "@/components/doctor/patient-summary-card"
import { MedicalRecordForm } from "@/components/doctor/medical-record-form"
import type { Appointment } from "@/types/appointment"
import type { MedicalHistoryEntry } from "@/types/medical-record"

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_APPOINTMENTS: Record<string, Appointment> = {
  "BN-00001": {
    id: "BN-00001",
    orderNumber: 1,
    patient: {
      id: "p1",
      name: "Nguyễn Văn Hùng",
      age: 68,
      gender: "male",
      initials: "NH",
      bloodType: "A+",
      weight: 72,
      bloodPressure: "145/95 mmHg",
    },
    timeRange: "08:00 - 08:15",
    sessionType: "morning",
    status: "PENDING",
    reason: "Khám định kỳ - Tim mạch",
    date: "2024-05-24",
  },
  "appt-1": {
    id: "appt-1",
    orderNumber: 1,
    patient: {
      id: "p-lh",
      name: "Lê Hoàng Nam",
      age: 28,
      gender: "male",
      initials: "LH",
      bloodType: "O+",
      weight: 65,
    },
    timeRange: "09:30 AM",
    sessionType: "morning",
    status: "PENDING",
    reason: "Khám định kỳ",
    date: "2024-05-24",
  },
}

const MOCK_HISTORY: MedicalHistoryEntry[] = [
  {
    date: "15/02/2024",
    department: "Nội khoa",
    diagnosis: "Viêm phế quản cấp",
    notes: "Bác sĩ: Trần Thu Hà. Điều trị ngoại trú 7 ngày.",
  },
  {
    date: "10/11/2023",
    department: "Tổng quát",
    diagnosis: "Kiểm tra định kỳ",
    notes: "Chỉ số mỡ máu hơi cao. Cần theo dõi chế độ ăn.",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params

  // In production, fetch from API: GET /api/v1/appointments/:id
  const appointment = MOCK_APPOINTMENTS[id] ?? MOCK_APPOINTMENTS["BN-00001"]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/doctor/today"
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <div className="h-4 w-px bg-outline-variant" />
        <nav className="text-sm text-on-surface-variant">
          <span>Lịch khám hôm nay</span>
          <span className="mx-2">/</span>
          <span className="text-on-surface font-semibold">Chi tiết lịch hẹn</span>
        </nav>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-surface-container p-8 rounded-2xl clinical-shadow">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-container/10 -skew-x-12 translate-x-20" />
        <div className="relative z-10">
          <h1 className="font-bold text-2xl text-primary mb-2">
            Chi Tiết Lịch Hẹn &amp; Tạo Bệnh Án
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Vui lòng cập nhật thông tin chẩn đoán, kết quả xét nghiệm và chỉ định đơn thuốc cho bệnh nhân sau khi thăm khám.
          </p>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-4">
          <PatientSummaryCard
            appointment={appointment}
            history={MOCK_HISTORY}
          />
        </div>

        {/* Right Column: Medical Record Form */}
        <div className="lg:col-span-8">
          <MedicalRecordForm appointmentId={appointment.id} />
        </div>
      </div>
    </div>
  )
}
