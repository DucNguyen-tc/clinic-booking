package com.ducnguyen.clinic_medical_record.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMedicalRecordRequest {

    @NotNull(message = "appointment_id không được để trống")
    private Long appointmentId;

    @NotBlank(message = "patient_id không được để trống")
    private String patientId;

    private String diagnosis;
    private String prescription;
    private String doctorNote;
}
