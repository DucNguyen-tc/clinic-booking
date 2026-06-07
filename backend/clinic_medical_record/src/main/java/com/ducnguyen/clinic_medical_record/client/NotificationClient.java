package com.ducnguyen.clinic_medical_record.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", url = "${services.notification-url}")
public interface NotificationClient {

    @PostMapping("/api/notifications/medical-result")
    void sendMedicalResultEmail(@RequestBody MedicalResultRequest request);

    @Data
    class MedicalResultRequest {
        private String recipientEmail;
        private String patientName;
        private String doctorName;
        private Long appointmentId;
        private String resultUrl;
    }
}
