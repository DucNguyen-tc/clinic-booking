package com.ducnguyen.clinic_medical_record.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "appointment-service", url = "${services.appointment-url:http://localhost:8083}")
public interface AppointmentClient {

    @PutMapping("/api/appointments/{id}/complete")
    void completeAppointment(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role
    );
}
