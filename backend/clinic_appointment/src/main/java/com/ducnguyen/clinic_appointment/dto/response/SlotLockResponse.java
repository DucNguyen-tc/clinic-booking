package com.ducnguyen.clinic_appointment.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SlotLockResponse {
    private Integer id;
    private String doctorId;
    private LocalDate lockDate;
    private LocalTime slotTime;
    private String patientId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
