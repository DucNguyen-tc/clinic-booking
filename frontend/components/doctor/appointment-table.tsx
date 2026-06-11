"use client";

import Link from "next/link";
import { Clock, CheckCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-secondary-container text-on-secondary-container",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    className: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  CONFIRMED: <Clock className="w-3.5 h-3.5" />,
  COMPLETED: <CheckCircle className="w-3.5 h-3.5" />,
};

// ── Row Component ─────────────────────────────────────────────────────────────

function AppointmentRow({ appt, index }: { appt: Appointment; index: number }) {
  const status = STATUS_CONFIG[appt.status] ?? {
    label: appt.status,
    className: "bg-surface-variant text-on-surface-variant",
  };
  const isConfirmed = appt.status === "CONFIRMED";
  const isCompleted = appt.status === "COMPLETED";

  // Lấy ngày hôm nay theo định dạng YYYY-MM-DD
  const today = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();
  const isFuture = appt.date > today;

  return (
    <div
      className={cn(
        "grid grid-cols-12 items-center p-5 rounded-2xl border transition-all",
        isConfirmed
          ? "bg-surface-container-lowest border-2 border-primary relative overflow-hidden"
          : isCompleted
            ? "bg-surface-container-low border-outline-variant opacity-80"
            : "bg-surface-container-lowest border-outline-variant hover:border-primary group",
      )}
    >
      {isConfirmed && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
      )}

      {/* STT */}
      <div
        className={cn(
          "col-span-1 font-bold text-xl",
          isConfirmed ? "text-primary" : "text-on-surface-variant/40",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Patient */}
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
            isConfirmed
              ? "bg-primary text-on-primary"
              : "bg-secondary-fixed text-on-secondary-fixed",
          )}
        >
          {appt.patient.initials}
        </div>
        <div>
          <p className="font-bold text-on-surface text-sm">
            {appt.patient.name}
          </p>
          <p className="text-xs text-on-surface-variant">
            {appt.patient.age} tuổi •{" "}
            {appt.patient.gender === "male"
              ? "Nam"
              : appt.patient.gender === "female"
                ? "Nữ"
                : "Khác"}
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="col-span-2">
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm",
            isConfirmed ? "text-primary font-bold" : "text-on-surface",
          )}
        >
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{appt.timeRange}</span>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            status.className,
          )}
        >
          {STATUS_ICON[appt.status]}
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-3 flex justify-end gap-2">
        {appt.status === "CONFIRMED" &&
          (isFuture ? (
            <button
              disabled
              className="px-4 py-2 bg-surface-container-highest text-on-surface-variant/40 rounded-full text-xs font-semibold cursor-not-allowed border border-outline-variant/50"
            >
              Chưa tới thời gian khám
            </button>
          ) : (
            <Link
              href={`/doctor/appointments/${appt.id}`}
              className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-semibold transition-all hover:bg-primary/90 shadow-sm"
            >
              Vào khám
            </Link>
          ))}
        {appt.status === "COMPLETED" && (
          <button className="px-5 py-2 bg-surface-container-highest text-on-surface-variant hover:text-primary rounded-full text-xs font-semibold transition-all">
            Đã hoàn thành
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Table Component ───────────────────────────────────────────────────────

interface AppointmentTableProps {
  appointments: Appointment[];
}

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-semibold text-lg">Không có lịch hẹn nào</p>
        <p className="text-sm mt-1 opacity-70">
          Không có bệnh nhân nào trong ca này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="grid grid-cols-12 px-5 py-3 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
        <div className="col-span-1">STT</div>
        <div className="col-span-4">Bệnh nhân</div>
        <div className="col-span-2">Giờ hẹn</div>
        <div className="col-span-2">Trạng thái</div>
        <div className="col-span-3 text-right">Hành động</div>
      </div>

      {/* Rows */}
      {appointments.map((appt, index) => (
        <AppointmentRow key={appt.id} appt={appt} index={index} />
      ))}
    </div>
  );
}
