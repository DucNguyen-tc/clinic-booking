'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Pill, Stethoscope, Loader2 } from 'lucide-react'
import { medicalRecordService, type MedicalRecordResponse } from '@/services/medical-record.service'
import { toast } from 'sonner'

interface MedicalRecordModalProps {
  appointmentId: number
  onClose: () => void
}

interface PrescriptionItem {
  medicationName: string
  dosage: string
  quantity: string
  instructions: string
}

export function MedicalRecordModal({ appointmentId, onClose }: MedicalRecordModalProps) {
  const [record, setRecord] = useState<MedicalRecordResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await medicalRecordService.getRecordByAppointmentId(appointmentId)
        setRecord(data)
      } catch (err) {
        console.error(err)
        toast.error('Không tìm thấy bệnh án hoặc có lỗi xảy ra.')
        onClose()
      } finally {
        setLoading(false)
      }
    }
    fetchRecord()
  }, [appointmentId, onClose])

  const parsePrescriptions = (jsonString: string): PrescriptionItem[] => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return []
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-surface-bright rounded-3xl overflow-hidden clinical-shadow flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-white">
          <h3 className="text-xl font-black text-on-surface flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Chi tiết bệnh án
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : record ? (
            <>
              {/* Diagnosis */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Chẩn đoán lâm sàng
                </h4>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-on-surface font-medium">{record.diagnosis || 'Không có chẩn đoán'}</p>
                </div>
              </div>

              {/* Prescription */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Pill className="w-4 h-4" /> Đơn thuốc chỉ định
                </h4>
                {record.prescription ? (
                  <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-low text-on-surface-variant text-xs font-bold uppercase">
                        <tr>
                          <th className="p-3">Tên thuốc</th>
                          <th className="p-3">Liều lượng</th>
                          <th className="p-3">Số lượng</th>
                          <th className="p-3">Cách dùng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {parsePrescriptions(record.prescription).map((item, index) => (
                          <tr key={index} className="hover:bg-surface-container-lowest/50">
                            <td className="p-3 font-semibold text-on-surface">{item.medicationName}</td>
                            <td className="p-3 text-on-surface-variant">{item.dosage}</td>
                            <td className="p-3 text-on-surface-variant">{item.quantity}</td>
                            <td className="p-3 text-on-surface-variant">{item.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">Không có đơn thuốc</p>
                )}
              </div>

              {/* Doctor Note */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-widest">
                  Lời dặn của bác sĩ
                </h4>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="text-on-surface-variant text-sm whitespace-pre-wrap">
                    {record.doctorNote || 'Không có lời dặn'}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
        
        <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest text-right">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-surface-container-high hover:bg-outline-variant/20 text-on-surface font-bold rounded-full transition-colors cursor-pointer"
            >
              Đóng
            </button>
        </div>
      </motion.div>
    </div>
  )
}
