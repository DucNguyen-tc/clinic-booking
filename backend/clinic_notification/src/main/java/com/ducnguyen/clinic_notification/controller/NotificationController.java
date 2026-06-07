package com.ducnguyen.clinic_notification.controller;

import com.ducnguyen.clinic_notification.dto.NotificationDto;
import com.ducnguyen.clinic_notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Gửi Email thông báo")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Gửi thông báo đơn giản (internal)")
    public ResponseEntity<String> send(@Valid @RequestBody NotificationDto.SendNotificationRequest request) {
        notificationService.sendSimpleNotification(request);
        return ResponseEntity.ok("Đã xếp hàng gửi thông báo");
    }

    @PostMapping("/appointment-confirmation")
    @Operation(summary = "Gửi email xác nhận đặt lịch")
    public ResponseEntity<String> sendAppointmentConfirmation(
            @Valid @RequestBody NotificationDto.AppointmentConfirmRequest request
    ) {
        notificationService.sendAppointmentConfirmation(request);
        return ResponseEntity.ok("Đã xếp hàng gửi email xác nhận");
    }

    @PostMapping("/medical-result")
    @Operation(summary = "Gửi email thông báo có kết quả khám")
    public ResponseEntity<String> sendMedicalResult(
            @Valid @RequestBody NotificationDto.MedicalResultRequest request
    ) {
        notificationService.sendMedicalResultNotification(request);
        return ResponseEntity.ok("Đã xếp hàng gửi email kết quả khám");
    }
}
