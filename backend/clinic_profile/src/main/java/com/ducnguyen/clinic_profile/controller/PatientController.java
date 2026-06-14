package com.ducnguyen.clinic_profile.controller;

import com.ducnguyen.clinic_profile.dto.request.PatientRequest;
import com.ducnguyen.clinic_profile.dto.response.ApiResponse;
import com.ducnguyen.clinic_profile.dto.response.PatientResponse;
import com.ducnguyen.clinic_profile.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or #userId == authentication.principal")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientProfile(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.<PatientResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(patientService.getPatientProfile(userId))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> createProfile(@Valid @RequestBody PatientRequest request) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PatientResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Created/Updated profile successfully")
                .data(patientService.createOrUpdateProfile(userId, request))
                .build());
    }

    @PutMapping
    public ResponseEntity<ApiResponse<PatientResponse>> updateProfile(@Valid @RequestBody PatientRequest request) {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(ApiResponse.<PatientResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Updated profile successfully")
                .data(patientService.createOrUpdateProfile(userId, request))
                .build());
    }
}
