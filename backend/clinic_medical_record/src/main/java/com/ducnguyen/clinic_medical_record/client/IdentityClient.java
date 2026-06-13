package com.ducnguyen.clinic_medical_record.client;

import com.ducnguyen.clinic_medical_record.dto.response.ApiResponse;
import com.ducnguyen.clinic_medical_record.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${services.identity-url:http://localhost:8081}")
public interface IdentityClient {

    @GetMapping("/api/auth/internal/users/{id}")
    ApiResponse<UserResponse> getUserById(@PathVariable("id") String id);
}
