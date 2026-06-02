package com.ducnguyen.clinic_profile.controller;

import com.ducnguyen.clinic_profile.dto.request.DoctorRequest;
import com.ducnguyen.clinic_profile.dto.response.ApiResponse;
import com.ducnguyen.clinic_profile.dto.response.DoctorResponse;
import com.ducnguyen.clinic_profile.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors(@RequestParam(required = false) Integer specialtyId) {
        return ResponseEntity.ok(ApiResponse.<List<DoctorResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(doctorService.getAllDoctors(specialtyId))
                .build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.<DoctorResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(doctorService.getDoctorById(userId))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DoctorResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Created doctor profile successfully")
                .data(doctorService.createOrUpdateDoctor(request.getUserId(), request))
                .build());
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(@PathVariable String userId, @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.<DoctorResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Updated doctor profile successfully")
                .data(doctorService.createOrUpdateDoctor(userId, request))
                .build());
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable String userId) {
        doctorService.deleteDoctor(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Deleted doctor successfully")
                .build());
    }
}
