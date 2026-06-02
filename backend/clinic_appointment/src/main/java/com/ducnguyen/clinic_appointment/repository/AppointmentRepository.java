package com.ducnguyen.clinic_appointment.repository;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByPatientId(String patientId);
    List<Appointment> findByDoctorId(String doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(String doctorId, LocalDate appointmentDate, AppointmentStatus status);
    Optional<Appointment> findByDoctorIdAndAppointmentDateAndSlotTimeAndStatusNot(String doctorId, LocalDate appointmentDate, LocalTime slotTime, AppointmentStatus status);
}
