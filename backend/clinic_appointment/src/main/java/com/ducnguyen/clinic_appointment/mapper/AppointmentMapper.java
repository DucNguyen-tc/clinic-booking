package com.ducnguyen.clinic_appointment.mapper;

import com.ducnguyen.clinic_appointment.dto.response.AppointmentResponse;
import com.ducnguyen.clinic_appointment.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "status", expression = "java(appointment.getStatus().name())")
    AppointmentResponse toResponse(Appointment appointment);
}
