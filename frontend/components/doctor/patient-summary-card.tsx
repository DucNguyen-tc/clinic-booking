import { Droplets, Weight, Activity, ChevronRight } from "lucide-react"
import type { Patient, Appointment } from "@/types/appointment"
import type { MedicalHistoryEntry } from "@/types/medical-record"

// ── Vital Row ─────────────────────────────────────────────────────────────────

function VitalRow({
  label,
  value,
  isAlert,
}: {
  label: string
  value: string
  isAlert?: boolean
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-outline-variant/40 last:border-0">
      <span className="text-sm text-on-surface-variant font-medium">{label}</span>
      <span
        className={`text-sm font-semibold ${
          isAlert ? "text-error" : "text-on-surface"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ── History Timeline Item ─────────────────────────────────────────────────────

function HistoryItem({ entry }: { entry: MedicalHistoryEntry }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-secondary" />
      </div>
      <span className="text-xs text-on-surface-variant">{entry.date} - {entry.department}</span>
      <h5 className="text-sm font-semibold text-on-surface mt-0.5">{entry.diagnosis}</h5>
      <p className="text-xs text-on-surface-variant mt-1">{entry.notes}</p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PatientSummaryCardProps {
  appointment: Appointment
  history?: MedicalHistoryEntry[]
}

export function PatientSummaryCard({ appointment, history = [] }: PatientSummaryCardProps) {
  const { patient } = appointment

  return (
    <div className="space-y-4">
      {/* Patient Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-outline-variant clinical-shadow">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-xl text-on-secondary-fixed flex-shrink-0 overflow-hidden">
            {patient.initials}
          </div>
          <div>
            <h3 className="font-bold text-xl text-on-surface leading-tight">{patient.name}</h3>
            <p className="text-sm text-on-surface-variant">
              ID: #{appointment.id} • {patient.age} Tuổi
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-secondary-container text-on-secondary-container text-xs font-semibold rounded-full">
              {appointment.reason ?? "Khám tổng quát"}
            </span>
          </div>
        </div>

        {/* Vitals */}
        {(patient.bloodType || patient.weight || patient.bloodPressure) && (
          <div className="border-t border-outline-variant pt-4 space-y-1">
            {patient.bloodType && (
              <VitalRow label="Nhóm máu" value={patient.bloodType} />
            )}
            {patient.weight && (
              <VitalRow label="Cân nặng" value={`${patient.weight} kg`} />
            )}
            {patient.bloodPressure && (
              <VitalRow
                label="Huyết áp"
                value={patient.bloodPressure}
                isAlert={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Medical History Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-outline-variant clinical-shadow">
        <h4 className="font-bold text-base text-primary mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Lịch Sử Khám Cũ
        </h4>

        {history.length === 0 ? (
          <p className="text-sm text-on-surface-variant opacity-60 text-center py-4">
            Chưa có lịch sử khám bệnh
          </p>
        ) : (
          <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
            {history.map((entry, i) => (
              <HistoryItem key={i} entry={entry} />
            ))}
          </div>
        )}

        <button className="w-full mt-5 py-2 text-primary font-semibold text-sm hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center gap-1">
          Xem toàn bộ lịch sử
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
