package com.ducnguyen.clinic_appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClinicAppointmentApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClinicAppointmentApplication.class, args);
	}

}
