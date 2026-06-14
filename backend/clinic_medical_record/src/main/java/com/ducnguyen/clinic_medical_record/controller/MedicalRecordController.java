package com.ducnguyen.clinic_medical_record.controller;

import com.ducnguyen.clinic_medical_record.dto.request.CreateMedicalRecordRequest;
import com.ducnguyen.clinic_medical_record.dto.response.ApiResponse;
import com.ducnguyen.clinic_medical_record.dto.response.MedicalRecordResponse;
import com.ducnguyen.clinic_medical_record.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
@Tag(name = "Medical Record", description = "Quản lý hồ sơ bệnh án")
@SecurityRequirement(name = "bearerAuth")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Upload file kết quả khám lên MinIO")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("appointmentId") Long appointmentId
    ) {
        String url = medicalRecordService.uploadResultFile(file, appointmentId);
        return ResponseEntity.ok(ApiResponse.ok("Upload thành công", url));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Bác sĩ tạo hồ sơ bệnh án")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createRecord(
            @Valid @RequestBody CreateMedicalRecordRequest request,
            @AuthenticationPrincipal String doctorId
    ) {
        MedicalRecordResponse response = medicalRecordService.createRecord(request, doctorId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã lưu hồ sơ bệnh án thành công", response));
    }

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Bệnh nhân xem lịch sử bệnh án")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getMyRecords(
            @AuthenticationPrincipal String patientId
    ) {
        List<MedicalRecordResponse> records = medicalRecordService.getMyRecords(patientId);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Bác sĩ xem lịch sử bệnh án của bệnh nhân theo patientId")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponse>>> getRecordsByPatientId(
            @PathVariable String patientId
    ) {
        List<MedicalRecordResponse> records = medicalRecordService.getMyRecords(patientId);
        return ResponseEntity.ok(ApiResponse.ok(records));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    @Operation(summary = "Xem chi tiết bệnh án")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(medicalRecordService.getRecordById(id)));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
    @Operation(summary = "Lấy bệnh án theo lịch hẹn")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getByAppointmentId(
            @PathVariable Long appointmentId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                medicalRecordService.getRecordByAppointmentId(appointmentId)
        ));
    }
}
