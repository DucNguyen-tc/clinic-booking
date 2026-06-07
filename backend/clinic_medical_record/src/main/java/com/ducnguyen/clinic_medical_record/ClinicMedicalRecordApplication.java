package com.ducnguyen.clinic_medical_record;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ClinicMedicalRecordApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicMedicalRecordApplication.class, args);
    }
}
