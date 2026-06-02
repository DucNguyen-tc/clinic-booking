package com.ducnguyen.clinic_profile.controller;

import com.ducnguyen.clinic_profile.dto.request.DoctorScheduleRequest;
import com.ducnguyen.clinic_profile.dto.response.ApiResponse;
import com.ducnguyen.clinic_profile.dto.response.DoctorScheduleResponse;
import com.ducnguyen.clinic_profile.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/{doctorId}/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedules(@PathVariable String doctorId) {
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Success")
                .data(scheduleService.getSchedulesByDoctor(doctorId))
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #doctorId == authentication.principal")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(
            @PathVariable String doctorId,
            @Valid @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DoctorScheduleResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Created schedule successfully")
                .data(scheduleService.createSchedule(doctorId, request))
                .build());
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN') or #doctorId == authentication.principal")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable String doctorId,
            @PathVariable Integer scheduleId,
            @Valid @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Updated schedule successfully")
                .data(scheduleService.updateSchedule(doctorId, scheduleId, request))
                .build());
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN') or #doctorId == authentication.principal")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable String doctorId,
            @PathVariable Integer scheduleId) {
        scheduleService.deleteSchedule(doctorId, scheduleId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Deleted schedule successfully")
                .build());
    }
}
