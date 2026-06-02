package com.ducnguyen.clinic_profile.service;

import com.ducnguyen.clinic_profile.dto.request.DoctorScheduleRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorScheduleResponse;

import java.util.List;

public interface DoctorScheduleService {
    List<DoctorScheduleResponse> getSchedulesByDoctor(String doctorId);
    DoctorScheduleResponse createSchedule(String doctorId, DoctorScheduleRequest request);
    DoctorScheduleResponse updateSchedule(String doctorId, Integer scheduleId, DoctorScheduleRequest request);
    void deleteSchedule(String doctorId, Integer scheduleId);
}
