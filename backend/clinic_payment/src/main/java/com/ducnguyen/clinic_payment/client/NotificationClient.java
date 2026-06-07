package com.ducnguyen.clinic_payment.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.time.LocalTime;

@FeignClient(name = "notification-service", url = "${services.notification-url}")
public interface NotificationClient {

    @PostMapping("/api/notifications/appointment-confirmation")
    void sendAppointmentConfirmEmail(@RequestBody AppointmentConfirmRequest request);

    @Data
    class AppointmentConfirmRequest {
        private String recipientEmail;
        private String patientName;
        private String doctorName;
        private String specialty;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private Long appointmentId;
    }
}
