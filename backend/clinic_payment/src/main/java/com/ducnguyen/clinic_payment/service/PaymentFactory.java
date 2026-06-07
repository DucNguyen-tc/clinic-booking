package com.ducnguyen.clinic_payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class PaymentFactory {

    private final Map<String, PaymentGateway> gateways;

    public PaymentGateway getGateway(String method) {
        PaymentGateway gateway = gateways.get(method.toUpperCase());
        if (gateway == null) {
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không hỗ trợ: " + method
                    + ". Các phương thức hợp lệ: VNPAY, MOMO"
            );
        }
        return gateway;
    }
}
