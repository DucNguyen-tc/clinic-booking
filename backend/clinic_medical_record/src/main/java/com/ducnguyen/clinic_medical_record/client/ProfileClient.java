package com.ducnguyen.clinic_medical_record.client;

import com.ducnguyen.clinic_medical_record.dto.response.ApiResponse;
import com.ducnguyen.clinic_medical_record.dto.response.PatientResponse;
import com.ducnguyen.clinic_medical_record.dto.response.DoctorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "profile-service", url = "${services.profile-url:http://localhost:8082}")
public interface ProfileClient {

    @GetMapping("/api/patients/{userId}")
    ApiResponse<PatientResponse> getPatientProfile(
            @PathVariable("userId") String userId,
            @RequestHeader("X-User-Id") String headerUserId,
            @RequestHeader("X-User-Role") String headerRole
    );

    @GetMapping("/api/doctors/{userId}")
    ApiResponse<DoctorResponse> getDoctorProfile(
            @PathVariable("userId") String userId,
            @RequestHeader("X-User-Id") String headerUserId,
            @RequestHeader("X-User-Role") String headerRole
    );
}
