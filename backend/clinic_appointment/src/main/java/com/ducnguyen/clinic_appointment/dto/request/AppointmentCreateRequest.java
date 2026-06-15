package com.ducnguyen.clinic_appointment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AppointmentCreateRequest {

    @NotNull(message = "Slot Lock ID cannot be null")
    private Integer slotLockId;

    @NotNull(message = "Specialty ID cannot be null")
    private Integer specialtyId;

    private String patientName;
    private String patientPhone;
    private String notes;
}
