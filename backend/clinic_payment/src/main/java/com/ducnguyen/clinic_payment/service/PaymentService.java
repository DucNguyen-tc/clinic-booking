package com.ducnguyen.clinic_payment.service;

import com.ducnguyen.clinic_payment.dto.PaymentDto;
import java.util.Map;

public interface PaymentService {
    PaymentDto.CreatePaymentResponse createPayment(PaymentDto.CreatePaymentRequest request);
    void handleCallback(String method, Map<String, String> params);
    PaymentDto.PaymentResponse getByAppointmentId(Long appointmentId);
}
