package com.ducnguyen.clinic_payment.service;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGateway {
    String createPaymentUrl(Long appointmentId, BigDecimal amount, String orderInfo);
    boolean verifyCallback(Map<String, String> params);
    String extractTransactionNo(Map<String, String> params);
    boolean isPaymentSuccess(Map<String, String> params);
}
