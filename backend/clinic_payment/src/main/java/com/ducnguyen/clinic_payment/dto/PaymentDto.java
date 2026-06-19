package com.ducnguyen.clinic_payment.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class PaymentDto {

    @Data
    public static class CreatePaymentRequest {
        private Long appointmentId;
        private BigDecimal amount;
        private String paymentMethod;
        private String orderInfo;
        private String patientEmail;
        private String patientName;
        private String doctorName;
        private String specialty;
        private LocalDate appointmentDate;
        private LocalTime slotTime;
    }

    @Data
    @Builder
    public static class CreatePaymentResponse {
        private Long paymentId;
        private Long appointmentId;
        private String paymentUrl;
        private String status;
    }

    @Data
    @Builder
    public static class PaymentResponse {
        private Long id;
        private Long appointmentId;
        private BigDecimal amount;
        private String paymentMethod;
        private String transactionNo;
        private String status;
        private LocalDateTime createdAt;
    }
}
