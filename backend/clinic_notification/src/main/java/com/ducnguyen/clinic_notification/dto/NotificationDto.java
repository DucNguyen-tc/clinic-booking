package com.ducnguyen.clinic_notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

public class NotificationDto {

    @Data
    public static class SendNotificationRequest {
        private String recipientId;

        @NotBlank(message = "recipientEmail không được để trống")
        @Email(message = "recipientEmail phải đúng định dạng email")
        private String recipientEmail;

        @NotBlank(message = "type không được để trống")
        private String type;

        @NotBlank(message = "title không được để trống")
        private String title;

        private String content;
    }

    @Data
    public static class AppointmentConfirmRequest {
        @NotBlank(message = "recipientEmail không được để trống")
        @Email(message = "recipientEmail phải đúng định dạng email")
        private String recipientEmail;

        @NotBlank(message = "patientName không được để trống")
        private String patientName;

        @NotBlank(message = "doctorName không được để trống")
        private String doctorName;

        private String specialty;

        @NotNull(message = "appointmentDate không được để trống")
        private LocalDate appointmentDate;

        @NotNull(message = "appointmentTime không được để trống")
        private LocalTime appointmentTime;

        @NotNull(message = "appointmentId không được để trống")
        private Long appointmentId;
    }

    @Data
    public static class MedicalResultRequest {
        @NotBlank(message = "recipientEmail không được để trống")
        @Email(message = "recipientEmail phải đúng định dạng email")
        private String recipientEmail;

        @NotBlank(message = "patientName không được để trống")
        private String patientName;

        @NotBlank(message = "doctorName không được để trống")
        private String doctorName;

        @NotNull(message = "appointmentId không được để trống")
        private Long appointmentId;


    }
}
