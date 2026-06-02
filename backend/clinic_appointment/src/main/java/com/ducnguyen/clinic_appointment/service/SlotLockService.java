package com.ducnguyen.clinic_appointment.service;

import com.ducnguyen.clinic_appointment.dto.request.SlotLockRequest;
import com.ducnguyen.clinic_appointment.dto.response.SlotLockResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SlotLockService {
    SlotLockResponse lockSlot(SlotLockRequest request, String patientId);
    List<LocalTime> getAvailableSlots(String doctorId, LocalDate date);
    void cleanExpiredLocks();
}
