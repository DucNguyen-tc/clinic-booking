package com.ducnguyen.clinic_profile.service;

import com.ducnguyen.clinic_profile.dto.request.DoctorRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorResponse;

import java.util.List;

public interface DoctorService {
    List<DoctorResponse> getAllDoctors(Integer specialtyId);
    DoctorResponse getDoctorById(String userId);
    DoctorResponse createOrUpdateDoctor(String userId, DoctorRequest request);
    void deleteDoctor(String userId);
}
