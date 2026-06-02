package com.ducnguyen.clinic_appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SlotLockRequest {

    @NotBlank(message = "Doctor ID cannot be blank")
    private String doctorId;

    @NotNull(message = "Lock date cannot be null")
    private LocalDate lockDate;

    @NotNull(message = "Slot time cannot be null")
    private LocalTime slotTime;
}
