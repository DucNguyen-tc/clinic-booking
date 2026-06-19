package com.ducnguyen.clinic_appointment.service.impl;

import com.ducnguyen.clinic_appointment.dto.request.AppointmentCreateRequest;
import com.ducnguyen.clinic_appointment.dto.response.AppointmentResponse;
import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.entity.SlotLock;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;
import com.ducnguyen.clinic_appointment.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_appointment.mapper.AppointmentMapper;
import com.ducnguyen.clinic_appointment.repository.AppointmentRepository;
import com.ducnguyen.clinic_appointment.repository.SlotLockRepository;
import com.ducnguyen.clinic_appointment.service.AppointmentService;
import com.ducnguyen.clinic_appointment.state.AppointmentState;
import com.ducnguyen.clinic_appointment.state.AppointmentStateFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SlotLockRepository slotLockRepository;
    private final AppointmentMapper appointmentMapper;

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request, String patientId) {
        // 1. Fetch SlotLock
        SlotLock slotLock = slotLockRepository.findById(request.getSlotLockId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot lock not found or expired"));

        // 2. Validate SlotLock owner and expiration
        if (!slotLock.getPatientId().equals(patientId)) {
            throw new CustomException("This slot lock does not belong to you");
        }
        if (slotLock.getExpiresAt().isBefore(LocalDateTime.now())) {
            slotLockRepository.delete(slotLock);
            throw new CustomException("Slot lock has expired");
        }

        // 3. Create Appointment using Builder Pattern
        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .patientName(request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .notes(request.getNotes())
                .doctorId(slotLock.getDoctorId())
                .specialtyId(request.getSpecialtyId())
                .appointmentDate(slotLock.getLockDate())
                .slotTime(slotLock.getSlotTime())
                .status(AppointmentStatus.PENDING_PAYMENT)
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // 4. Delete the SlotLock as it is now converted into an Appointment
        slotLockRepository.delete(slotLock);

        return appointmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse confirmAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentState state = AppointmentStateFactory.getState(appointment.getStatus());
        state.confirm(appointment);

        Appointment saved = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentState state = AppointmentStateFactory.getState(appointment.getStatus());
        state.complete(appointment);

        Appointment saved = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentState state = AppointmentStateFactory.getState(appointment.getStatus());
        state.cancel(appointment);

        Appointment saved = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(saved);
    }

    @Override
    public AppointmentResponse getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return appointmentMapper.toResponse(appointment);
    }

    /**
     * Tự động hủy các appointment PENDING_PAYMENT quá 15 phút
     * để trả lại slot cho người dùng khác. Chạy mỗi phút.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPendingPayments() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Appointment> stale = appointmentRepository
                .findByStatusAndCreatedAtBefore(AppointmentStatus.PENDING_PAYMENT, cutoff);
        for (Appointment apt : stale) {
            apt.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(apt);
        }
        if (!stale.isEmpty()) {
            log.info("Auto-cancelled {} PENDING_PAYMENT appointments older than 15 minutes", stale.size());
        }
    }

    @Override
    public List<AppointmentResponse> getAppointments(String userId, String role) {
        List<Appointment> list;
        if (role != null && role.contains("ADMIN")) {
            list = appointmentRepository.findAll();
        } else if (role != null && role.contains("DOCTOR")) {
            list = appointmentRepository.findByDoctorId(userId);
        } else {
            list = appointmentRepository.findByPatientId(userId);
        }

        return list.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }
}
