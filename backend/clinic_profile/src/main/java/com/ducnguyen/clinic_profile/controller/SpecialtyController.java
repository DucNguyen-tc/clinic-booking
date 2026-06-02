package com.ducnguyen.clinic_profile.controller;

import com.ducnguyen.clinic_profile.dto.request.SpecialtyRequest;
import com.ducnguyen.clinic_profile.dto.response.ApiResponse;
import com.ducnguyen.clinic_profile.dto.response.SpecialtyResponse;
import com.ducnguyen.clinic_profile.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> getAllSpecialties() {
        return ResponseEntity.ok(ApiResponse.<List<SpecialtyResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(specialtyService.getAllSpecialties())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecialtyResponse>> getSpecialtyById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.<SpecialtyResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(specialtyService.getSpecialtyById(id))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SpecialtyResponse>> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<SpecialtyResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Created specialty successfully")
                .data(specialtyService.createSpecialty(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SpecialtyResponse>> updateSpecialty(@PathVariable Integer id, @Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.ok(ApiResponse.<SpecialtyResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Updated specialty successfully")
                .data(specialtyService.updateSpecialty(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSpecialty(@PathVariable Integer id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Deleted specialty successfully")
                .build());
    }
}
