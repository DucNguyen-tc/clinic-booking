package com.ducnguyen.clinic_medical_record.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MedicalRecordResponse {
    private Long id;
    private Long appointmentId;
    private String patientId;
    private String doctorId;
    private String diagnosis;
    private String prescription;
    private String doctorNote;
    private LocalDateTime createdAt;
}
