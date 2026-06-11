"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User, Phone, Calendar, Clock, Loader2, FileText, Activity } from "lucide-react"
import { appointmentService, type PatientApiResponse } from "@/services/appointment.service"
import { medicalRecordService, type MedicalRecordResponse } from "@/services/medical-record.service"
import { cn } from "@/lib/utils"

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<PatientApiResponse | null>(null)
  const [records, setRecords] = useState<MedicalRecordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [patientInfo, medicalRecords] = await Promise.all([
        appointmentService.getPatientInfo(patientId).catch(() => null),
        medicalRecordService.getRecordsByPatientId(patientId).catch(() => []),
      ])

      setPatient(patientInfo)
      // Sort records descending by createdAt
      setRecords(medicalRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      setError("Không thể tải dữ liệu bệnh nhân")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getAge = (dob: string | null) => {
    if (!dob) return "Không rõ"
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const getGenderText = (gender: string | undefined) => {
    if (gender === "MALE") return "Nam"
    if (gender === "FEMALE") return "Nữ"
    return "Khác"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-on-surface-variant font-semibold">Đang tải hồ sơ bệnh nhân...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl border border-outline-variant clinical-shadow flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-3xl font-bold flex-shrink-0 z-10">
          {patient?.fullName ? patient.fullName.charAt(0).toUpperCase() : "?"}
        </div>
        
        <div className="flex-1 z-10">
          <h1 className="text-3xl font-bold text-on-surface mb-2">{patient?.fullName || "Bệnh nhân ẩn danh"}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-on-surface-variant mt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 opacity-70" />
              <span>{getAge(patient?.dob || null)} tuổi • {getGenderText(patient?.gender)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-70" />
              <span>{patient?.phone || "Chưa cập nhật SĐT"}</span>
            </div>
            {patient?.dob && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-70" />
                <span>Sinh ngày: {new Date(patient.dob).toLocaleDateString("vi-VN")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Lịch sử khám bệnh
        </h2>

        {records.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant text-center">
            <FileText className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
            <p className="text-lg font-semibold text-on-surface">Chưa có hồ sơ bệnh án nào</p>
            <p className="text-on-surface-variant mt-1">Bệnh nhân này chưa từng hoàn thành lượt khám nào với bạn.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent">
            {records.map((record, idx) => (
              <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface bg-primary-container text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="w-5 h-5" />
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-6 rounded-2xl border border-outline-variant clinical-shadow hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">
                      Ngày khám: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Chẩn đoán</p>
                      <p className="text-on-surface font-medium">{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Lời dặn</p>
                      <p className="text-on-surface">{record.doctorNote || "Không có lời dặn"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Đơn thuốc</p>
                      {(() => {
                        if (!record.prescription) return <p className="text-on-surface mt-1 text-xs">Không kê đơn</p>
                        try {
                          const items = JSON.parse(record.prescription)
                          if (!Array.isArray(items) || items.length === 0) return <p className="text-on-surface mt-1 text-xs">Không kê đơn</p>
                          return (
                            <ul className="mt-2 space-y-2">
                              {items.map((item: any, i: number) => (
                                <li key={i} className="bg-surface-container-low p-3 rounded-xl text-xs border border-outline-variant/50 flex flex-col gap-1">
                                  <div className="flex justify-between font-bold text-primary mb-1 text-[13px]">
                                    <span>{i + 1}. {item.medicationName || item.name}</span>
                                    <span>SL: {item.quantity}</span>
                                  </div>
                                  <div className="text-on-surface flex flex-col gap-1 opacity-90">
                                    {item.dosage && <span><strong className="font-semibold text-on-surface-variant">Liều dùng:</strong> {item.dosage}</span>}
                                    {item.instructions && <span><strong className="font-semibold text-on-surface-variant">Cách dùng:</strong> {item.instructions}</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )
                        } catch(e) {
                          return (
                            <p className="text-on-surface bg-surface-container p-3 rounded-xl mt-1 text-xs whitespace-pre-wrap">
                              {record.prescription}
                            </p>
                          )
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
