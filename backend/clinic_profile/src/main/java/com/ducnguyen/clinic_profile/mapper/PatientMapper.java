package com.ducnguyen.clinic_profile.mapper;

import com.ducnguyen.clinic_profile.dto.request.PatientRequest;
import com.ducnguyen.clinic_profile.dto.response.PatientResponse;
import com.ducnguyen.clinic_profile.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatientMapper {
    Patient toEntity(PatientRequest request);
    PatientResponse toResponse(Patient patient);
    void updateEntity(@MappingTarget Patient patient, PatientRequest request);
}
