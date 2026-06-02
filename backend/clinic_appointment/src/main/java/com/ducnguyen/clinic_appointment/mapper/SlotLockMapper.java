package com.ducnguyen.clinic_appointment.mapper;

import com.ducnguyen.clinic_appointment.dto.response.SlotLockResponse;
import com.ducnguyen.clinic_appointment.entity.SlotLock;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SlotLockMapper {
    SlotLockResponse toResponse(SlotLock slotLock);
}
