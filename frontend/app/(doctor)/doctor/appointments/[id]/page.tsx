"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { PatientSummaryCard } from "@/components/doctor/patient-summary-card";
import { MedicalRecordForm } from "@/components/doctor/medical-record-form";
import type { Appointment } from "@/types/appointment";
import type { MedicalHistoryEntry } from "@/types/medical-record";
import { appointmentService } from "@/services/appointment.service";
import { medicalRecordService } from "@/services/medical-record.service";
import { toast } from "sonner";

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [history, setHistory] = useState<MedicalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // 1. Fetch appointment detail
        const apptData = await appointmentService.getAppointmentById(id);

        // 2. Fetch patient profile
        const patientData = await appointmentService.getPatientInfo(
          apptData.patientId,
        );

        // 3. Fetch medical history
        let historyData: any[] = [];
        try {
          historyData = await medicalRecordService.getRecordsByPatientId(
            apptData.patientId,
          );
        } catch (e) {
          console.error(
            "No medical history found or error fetching history:",
            e,
          );
        }
        console.log(apptData);
        // Map API response to UI type
        const dobDate = patientData.dob ? new Date(patientData.dob) : null;
        const age = dobDate
          ? new Date().getFullYear() - dobDate.getFullYear()
          : 0;

        const names = patientData.fullName?.trim().split(" ") || [""];
        const initials =
          names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : patientData.fullName?.substring(0, 2).toUpperCase() || "BN";

        const mappedAppointment: Appointment = {
          id: apptData.id,
          orderNumber: apptData.id,
          patient: {
            id: patientData.userId,
            name: patientData.fullName,
            age: age,
            gender:
              patientData.gender?.toLowerCase() === "male"
                ? "male"
                : patientData.gender?.toLowerCase() === "female"
                  ? "female"
                  : "other",
            initials: initials,
          },
          timeRange: apptData.slotTime,
          sessionType:
            parseInt(apptData.slotTime?.split(":")?.[0] ?? "8") < 12
              ? "morning"
              : "afternoon",
          status: apptData.status,
          date: apptData.appointmentDate,
          reason: apptData.notes || "Không có ghi chú",
        };

        const mappedHistory: MedicalHistoryEntry[] = historyData.map(
          (record: any) => ({
            date: record.createdAt
              ? new Date(record.createdAt).toLocaleDateString("vi-VN")
              : "Chưa có ngày",
            department: "Phòng khám",
            diagnosis: record.diagnosis || "Chưa có chẩn đoán",
            notes: record.doctorNote || "Không có lời dặn",
          }),
        );

        setAppointment(mappedAppointment);
        setHistory(mappedHistory);
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        toast.error("Không thể tải thông tin lịch hẹn");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant font-medium">
          Đang tải thông tin bệnh nhân...
        </span>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        Không tìm thấy thông tin lịch hẹn.
      </div>
    );
  }

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
          <span className="text-on-surface font-semibold">
            Chi tiết lịch hẹn
          </span>
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
            Vui lòng cập nhật thông tin chẩn đoán, kết quả xét nghiệm và chỉ
            định đơn thuốc cho bệnh nhân sau khi thăm khám.
          </p>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-4">
          <PatientSummaryCard appointment={appointment} history={history} />
        </div>

        {/* Right Column: Medical Record Form */}
        <div className="lg:col-span-8">
          <MedicalRecordForm
            appointmentId={appointment.id}
            patientId={appointment.patient.id}
          />
        </div>
      </div>
    </div>
  );
}
