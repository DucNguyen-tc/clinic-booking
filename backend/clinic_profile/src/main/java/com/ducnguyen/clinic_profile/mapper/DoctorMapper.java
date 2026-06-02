package com.ducnguyen.clinic_profile.mapper;

import com.ducnguyen.clinic_profile.dto.request.DoctorRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorResponse;
import com.ducnguyen.clinic_profile.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {SpecialtyMapper.class})
public interface DoctorMapper {
    @Mapping(target = "specialty", ignore = true) // Handled in Service
    Doctor toEntity(DoctorRequest request);
    
    DoctorResponse toResponse(Doctor doctor);
    
    @Mapping(target = "specialty", ignore = true) // Handled in Service
    void updateEntity(@MappingTarget Doctor doctor, DoctorRequest request);
}
