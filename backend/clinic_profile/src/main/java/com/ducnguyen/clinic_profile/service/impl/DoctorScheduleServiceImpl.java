package com.ducnguyen.clinic_profile.service.impl;

import com.ducnguyen.clinic_profile.dto.request.DoctorScheduleRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorScheduleResponse;
import com.ducnguyen.clinic_profile.entity.Doctor;
import com.ducnguyen.clinic_profile.entity.DoctorSchedule;
import com.ducnguyen.clinic_profile.exception.CustomException;
import com.ducnguyen.clinic_profile.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_profile.mapper.DoctorScheduleMapper;
import com.ducnguyen.clinic_profile.repository.DoctorRepository;
import com.ducnguyen.clinic_profile.repository.DoctorScheduleRepository;
import com.ducnguyen.clinic_profile.service.DoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleMapper scheduleMapper;

    @Override
    public List<DoctorScheduleResponse> getSchedulesByDoctor(String doctorId) {
        return scheduleRepository.findByDoctorUserId(doctorId).stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorScheduleResponse createSchedule(String doctorId, DoctorScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorSchedule schedule = scheduleMapper.toEntity(request);
        schedule.setDoctor(doctor);
        schedule = scheduleRepository.save(schedule);
        
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public DoctorScheduleResponse updateSchedule(String doctorId, Integer scheduleId, DoctorScheduleRequest request) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        if (!schedule.getDoctor().getUserId().equals(doctorId)) {
            throw new CustomException("This schedule does not belong to doctor: " + doctorId);
        }

        scheduleMapper.updateEntity(schedule, request);
        schedule = scheduleRepository.save(schedule);
        
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public void deleteSchedule(String doctorId, Integer scheduleId) {
        DoctorSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        if (!schedule.getDoctor().getUserId().equals(doctorId)) {
            throw new CustomException("This schedule does not belong to doctor: " + doctorId);
        }

        scheduleRepository.deleteById(scheduleId);
    }
}
