package com.ducnguyen.clinic_profile.dto.response;

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
public class DoctorResponse {
    private String userId;
    private SpecialtyResponse specialty;
    private String fullName;
    private String degree;
    private Integer experienceYears;
    private BigDecimal price;
}
