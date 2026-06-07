package com.ducnguyen.clinic_payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ClinicPaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClinicPaymentApplication.class, args);
    }
}
