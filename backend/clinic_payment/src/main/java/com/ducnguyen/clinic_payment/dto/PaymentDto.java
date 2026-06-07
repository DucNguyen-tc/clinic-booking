package com.ducnguyen.clinic_payment.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data
    public static class CreatePaymentRequest {
        private Long appointmentId;
        private BigDecimal amount;
        private String paymentMethod;
        private String orderInfo;
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
