package com.ducnguyen.clinic_appointment.service.impl;

import com.ducnguyen.clinic_appointment.dto.request.SlotLockRequest;
import com.ducnguyen.clinic_appointment.dto.response.SlotLockResponse;
import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.entity.SlotLock;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;
import com.ducnguyen.clinic_appointment.mapper.SlotLockMapper;
import com.ducnguyen.clinic_appointment.repository.AppointmentRepository;
import com.ducnguyen.clinic_appointment.repository.SlotLockRepository;
import com.ducnguyen.clinic_appointment.service.SlotLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotLockServiceImpl implements SlotLockService {

    private final SlotLockRepository slotLockRepository;
    private final AppointmentRepository appointmentRepository;
    private final SlotLockMapper slotLockMapper;

    private static final List<LocalTime> ALL_SLOTS = Arrays.asList(
            LocalTime.of(8, 0), LocalTime.of(8, 30),
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(13, 30), LocalTime.of(14, 0),
            LocalTime.of(14, 30), LocalTime.of(15, 0),
            LocalTime.of(15, 30), LocalTime.of(16, 0),
            LocalTime.of(16, 30)
    );

    @Override
    @Transactional
    public SlotLockResponse lockSlot(SlotLockRequest request, String patientId) {
        cleanExpiredLocks();

        if (!ALL_SLOTS.contains(request.getSlotTime())) {
            throw new CustomException("Invalid slot time");
        }

        boolean isBooked = appointmentRepository.findByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(
                request.getDoctorId(),
                request.getLockDate(),
                request.getSlotTime(),
                AppointmentStatus.CANCELLED
        ).isPresent();

        if (isBooked) {
            throw new CustomException("This slot is already booked");
        }

        boolean isLocked = slotLockRepository.findByDoctorIdAndLockDateAndSlotTimeAndExpiresAtAfter(
                request.getDoctorId(),
                request.getLockDate(),
                request.getSlotTime(),
                LocalDateTime.now()
        ).isPresent();

        if (isLocked) {
            throw new CustomException("This slot is currently locked by another patient");
        }

        SlotLock slotLock = SlotLock.builder()
                .doctorId(request.getDoctorId())
                .lockDate(request.getLockDate())
                .slotTime(request.getSlotTime())
                .patientId(patientId)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        SlotLock saved = slotLockRepository.save(slotLock);
        return slotLockMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void unlockSlot(Integer slotLockId, String patientId) {
        slotLockRepository.findById(slotLockId).ifPresent(lock -> {
            if (lock.getPatientId().equals(patientId)) {
                slotLockRepository.delete(lock);
            }
        });
    }

    @Override
    public List<LocalTime> getAvailableSlots(String doctorId, LocalDate date) {
        cleanExpiredLocks();

        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusNot(
                doctorId, date, AppointmentStatus.CANCELLED
        );
        List<LocalTime> bookedTimes = bookedAppointments.stream()
                .map(Appointment::getSlotTime)
                .collect(Collectors.toList());

        List<SlotLock> activeLocks = slotLockRepository.findByDoctorIdAndLockDateAndExpiresAtAfter(
                doctorId, date, LocalDateTime.now()
        );
        List<LocalTime> lockedTimes = activeLocks.stream()
                .map(SlotLock::getSlotTime)
                .collect(Collectors.toList());

        List<LocalTime> available = new ArrayList<>();
        for (LocalTime slot : ALL_SLOTS) {
            if (!bookedTimes.contains(slot) && !lockedTimes.contains(slot)) {
                available.add(slot);
            }
        }
        return available;
    }

    @Override
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanExpiredLocks() {
        List<SlotLock> expired = slotLockRepository.findByExpiresAtBefore(LocalDateTime.now());
        if (!expired.isEmpty()) {
            slotLockRepository.deleteAll(expired);
        }
    }
}
