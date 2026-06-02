package com.ducnguyen.clinic_profile.dto.request;

import com.ducnguyen.clinic_profile.enums.ShiftType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleRequest {

    @NotNull(message = "Day of week is required")
    @Min(0) @Max(6)
    private Integer dayOfWeek;

    @NotNull(message = "Shift type is required")
    private ShiftType shiftType;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Slot duration is required")
    @Min(5)
    private Integer slotDuration;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
