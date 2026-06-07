package com.ducnguyen.clinic_payment.repository;

import com.ducnguyen.clinic_payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findFirstByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
    Optional<Payment> findByTransactionNo(String transactionNo);
}
