package com.ducnguyen.clinic_appointment.repository;

import com.ducnguyen.clinic_appointment.entity.SlotLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotLockRepository extends JpaRepository<SlotLock, Integer> {
    List<SlotLock> findByDoctorIdAndLockDateAndExpiresAtAfter(String doctorId, LocalDate lockDate, LocalDateTime dateTime);
    Optional<SlotLock> findByDoctorIdAndLockDateAndSlotTimeAndExpiresAtAfter(String doctorId, LocalDate lockDate, LocalTime slotTime, LocalDateTime dateTime);
    List<SlotLock> findByExpiresAtBefore(LocalDateTime dateTime);
}
