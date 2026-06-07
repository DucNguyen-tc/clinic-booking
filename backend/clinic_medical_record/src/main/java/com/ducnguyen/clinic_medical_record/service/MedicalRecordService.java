package com.ducnguyen.clinic_medical_record.service;

import com.ducnguyen.clinic_medical_record.dto.request.CreateMedicalRecordRequest;
import com.ducnguyen.clinic_medical_record.dto.response.MedicalRecordResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MedicalRecordService {
    MedicalRecordResponse createRecord(CreateMedicalRecordRequest request, String doctorId);
    String uploadResultFile(MultipartFile file, Long appointmentId);
    List<MedicalRecordResponse> getMyRecords(String patientId);
    MedicalRecordResponse getRecordById(Long id);
    MedicalRecordResponse getRecordByAppointmentId(Long appointmentId);
}
