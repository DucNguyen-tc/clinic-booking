package com.ducnguyen.clinic_profile.dto.response;

import com.ducnguyen.clinic_profile.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
    private String userId;
    private String fullName;
    private LocalDate dob;
    private Gender gender;
    private String phone;
}
