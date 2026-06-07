package com.ducnguyen.clinic_notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClinicNotificationApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClinicNotificationApplication.class, args);
    }
}
