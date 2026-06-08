"use client";

import { useEffect, useState } from "react";
import { ScheduleCalendar } from "@/components/doctor/schedule-calendar";
import type { CalendarDay, WeeklyScheduleStats, DoctorScheduleResponse, ShiftSlot } from "@/types/doctor";
import { useAuthStore } from "@/store/auth-store";
import { doctorProfileService } from "@/services/doctor.service";
import { toast } from "sonner";

export default function DoctorSchedulePage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<DoctorScheduleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      doctorProfileService.getDoctorSchedules(user.id.toString())
        .then(res => setSchedules(res || []))
        .catch(err => {
          console.error(err);
          toast.error("Không thể tải lịch làm việc: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setIsLoading(false));
    }
  }, [user?.id]);

  // Map Backend ShiftType to Frontend ShiftSlotType
  const mapShiftType = (type: string): "morning" | "afternoon" | "fullday" | "leave" => {
    switch (type) {
      case "MORNING": return "morning";
      case "AFTERNOON": return "afternoon";
      case "FULL_DAY": return "fullday";
      default: return "leave";
    }
  };

  const generateCalendarDays = (): { days: CalendarDay[], stats: WeeklyScheduleStats } => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    
    // JS getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
    const getMondayFirstIndex = (d: Date) => {
      const day = d.getDay();
      return day === 0 ? 6 : day - 1;
    };
    
    const startOffset = getMondayFirstIndex(startOfMonth);
    
    const days: CalendarDay[] = [];
    let totalShifts = 0;
    let expectedPatients = 0;

    // Previous month placeholders
    const prevMonthEnd = new Date(year, month, 0);
    const prevMonthDays = prevMonthEnd.getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false, isToday: false, shifts: [] });
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const jsDayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon...
      
      const daySchedules = schedules.filter(s => s.dayOfWeek === jsDayOfWeek && s.isActive);
      const shifts: ShiftSlot[] = daySchedules.map(s => {
        // Calculate capacity: (endTime - startTime) / slotDuration
        const startParts = s.startTime.split(":");
        const endParts = s.endTime.split(":");
        const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        const capacity = s.slotDuration > 0 ? Math.floor((endMins - startMins) / s.slotDuration) : 0;
        
        return {
          type: mapShiftType(s.shiftType),
          label: s.shiftType.replace("_", " "),
          booked: 0,
          capacity: capacity
        };
      });

      totalShifts += shifts.length;
      expectedPatients += shifts.reduce((acc, shift) => acc + shift.capacity, 0);

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: dateObj.getFullYear() === today.getFullYear() && 
                 dateObj.getMonth() === today.getMonth() && 
                 dateObj.getDate() === today.getDate(),
        shifts
      });
    }

    // Next month placeholders
    const remaining = (Math.ceil(days.length / 7) * 7) - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false, shifts: [] });
    }

    return { days, stats: { totalShifts, expectedPatients } };
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  if (isLoading) {
    return <div className="p-12 text-center text-on-surface-variant">Đang tải lịch làm việc...</div>;
  }

  const { days, stats } = generateCalendarDays();
  const monthStr = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  return (
    <div className="max-w-7xl mx-auto">
      <ScheduleCalendar 
        days={days} 
        month={monthStr} 
        stats={stats} 
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </div>
  );
}
