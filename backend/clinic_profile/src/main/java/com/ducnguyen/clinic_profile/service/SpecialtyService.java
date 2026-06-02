package com.ducnguyen.clinic_profile.service;

import com.ducnguyen.clinic_profile.dto.request.SpecialtyRequest;
import com.ducnguyen.clinic_profile.dto.response.SpecialtyResponse;

import java.util.List;

public interface SpecialtyService {
    List<SpecialtyResponse> getAllSpecialties();
    SpecialtyResponse getSpecialtyById(Integer id);
    SpecialtyResponse createSpecialty(SpecialtyRequest request);
    SpecialtyResponse updateSpecialty(Integer id, SpecialtyRequest request);
    void deleteSpecialty(Integer id);
}
