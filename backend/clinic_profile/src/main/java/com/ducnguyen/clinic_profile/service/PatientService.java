package com.ducnguyen.clinic_profile.service;

import com.ducnguyen.clinic_profile.dto.request.PatientRequest;
import com.ducnguyen.clinic_profile.dto.response.PatientResponse;

public interface PatientService {
    PatientResponse getPatientProfile(String userId);
    PatientResponse createOrUpdateProfile(String userId, PatientRequest request);
}
