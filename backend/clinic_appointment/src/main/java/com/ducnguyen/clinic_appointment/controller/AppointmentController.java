package com.ducnguyen.clinic_appointment.controller;

import com.ducnguyen.clinic_appointment.dto.request.AppointmentCreateRequest;
import com.ducnguyen.clinic_appointment.dto.response.ApiResponse;
import com.ducnguyen.clinic_appointment.dto.response.AppointmentResponse;
import com.ducnguyen.clinic_appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentCreateRequest request,
            Authentication authentication) {
        String patientId = authentication.getName();
        AppointmentResponse response = appointmentService.createAppointment(request, patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Appointment created successfully")
                .data(response)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Integer id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Fetched appointment details successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(Authentication authentication) {
        String userId = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_PATIENT");

        List<AppointmentResponse> response = appointmentService.getAppointments(userId, role);
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Fetched appointments successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable Integer id) {
        AppointmentResponse response = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Appointment confirmed successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(@PathVariable Integer id) {
        AppointmentResponse response = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Appointment completed successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(@PathVariable Integer id) {
        AppointmentResponse response = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Appointment cancelled successfully")
                .data(response)
                .build());
    }
}
