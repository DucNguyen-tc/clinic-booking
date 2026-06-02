package com.ducnguyen.clinic_appointment.controller;

import com.ducnguyen.clinic_appointment.dto.request.SlotLockRequest;
import com.ducnguyen.clinic_appointment.dto.response.ApiResponse;
import com.ducnguyen.clinic_appointment.dto.response.SlotLockResponse;
import com.ducnguyen.clinic_appointment.service.SlotLockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotLockController {

    private final SlotLockService slotLockService;

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<SlotLockResponse>> lockSlot(
            @Valid @RequestBody SlotLockRequest request,
            Authentication authentication) {
        String patientId = authentication.getName();
        SlotLockResponse response = slotLockService.lockSlot(request, patientId);
        return ResponseEntity.ok(ApiResponse.<SlotLockResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Slot locked successfully")
                .data(response)
                .build());
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<LocalTime>>> getAvailableSlots(
            @RequestParam String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<LocalTime> response = slotLockService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.<List<LocalTime>>builder()
                .status(HttpStatus.OK.value())
                .message("Fetched available slots successfully")
                .data(response)
                .build());
    }
}
