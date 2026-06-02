package com.ducnguyen.clinic_profile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Specialty ID is required")
    private Integer specialtyId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String degree;

    @Min(value = 0, message = "Experience years must be positive")
    private Integer experienceYears;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be positive")
    private BigDecimal price;
}
