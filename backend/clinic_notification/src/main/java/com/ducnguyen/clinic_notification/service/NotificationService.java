package com.ducnguyen.clinic_notification.service;

import com.ducnguyen.clinic_notification.dto.NotificationDto;

public interface NotificationService {
    void sendAppointmentConfirmation(NotificationDto.AppointmentConfirmRequest request);
    void sendMedicalResultNotification(NotificationDto.MedicalResultRequest request);
    void sendSimpleNotification(NotificationDto.SendNotificationRequest request);
}
