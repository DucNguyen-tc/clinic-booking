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
public class AppointmentResponse {
    private Integer id;
    private String patientId;
    private String doctorId;
    private Integer specialtyId;
    private LocalDate appointmentDate;
    private LocalTime slotTime;
    private String status;
    private LocalDateTime createdAt;
}
