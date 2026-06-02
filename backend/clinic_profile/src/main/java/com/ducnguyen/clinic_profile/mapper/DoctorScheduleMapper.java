package com.ducnguyen.clinic_profile.mapper;

import com.ducnguyen.clinic_profile.dto.request.DoctorScheduleRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorScheduleResponse;
import com.ducnguyen.clinic_profile.entity.DoctorSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DoctorScheduleMapper {
    @Mapping(target = "doctor", ignore = true) // Handled in Service
    DoctorSchedule toEntity(DoctorScheduleRequest request);
    
    @Mapping(source = "doctor.userId", target = "doctorId")
    DoctorScheduleResponse toResponse(DoctorSchedule schedule);
    
    @Mapping(target = "doctor", ignore = true)
    void updateEntity(@MappingTarget DoctorSchedule schedule, DoctorScheduleRequest request);
}
