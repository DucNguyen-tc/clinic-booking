package com.ducnguyen.clinic_profile.mapper;

import com.ducnguyen.clinic_profile.dto.request.SpecialtyRequest;
import com.ducnguyen.clinic_profile.dto.response.SpecialtyResponse;
import com.ducnguyen.clinic_profile.entity.Specialty;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SpecialtyMapper {
    Specialty toEntity(SpecialtyRequest request);
    SpecialtyResponse toResponse(Specialty specialty);
    void updateEntity(@MappingTarget Specialty specialty, SpecialtyRequest request);
}
