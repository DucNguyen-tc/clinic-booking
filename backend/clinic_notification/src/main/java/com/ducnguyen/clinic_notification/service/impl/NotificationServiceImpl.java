package com.ducnguyen.clinic_notification.service.impl;

import com.ducnguyen.clinic_notification.dto.NotificationDto;
import com.ducnguyen.clinic_notification.entity.NotificationLog;
import com.ducnguyen.clinic_notification.repository.NotificationLogRepository;
import com.ducnguyen.clinic_notification.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final NotificationLogRepository logRepository;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Async
    @Override
    public void sendAppointmentConfirmation(NotificationDto.AppointmentConfirmRequest request) {
        Context ctx = new Context();
        ctx.setVariable("patientName", request.getPatientName());
        ctx.setVariable("doctorName", request.getDoctorName());
        ctx.setVariable("specialty", request.getSpecialty());
        ctx.setVariable("appointmentDate", request.getAppointmentDate());
        ctx.setVariable("appointmentTime", request.getAppointmentTime());
        ctx.setVariable("appointmentId", request.getAppointmentId());

        String htmlContent = templateEngine.process("appointment-confirmation", ctx);
        String subject = "✅ Xác nhận đặt lịch khám #" + request.getAppointmentId();
        sendHtmlEmail(request.getRecipientEmail(), subject, htmlContent, null);
    }

    @Async
    @Override
    public void sendMedicalResultNotification(NotificationDto.MedicalResultRequest request) {
        Context ctx = new Context();
        ctx.setVariable("patientName", request.getPatientName());
        ctx.setVariable("doctorName", request.getDoctorName());
        ctx.setVariable("appointmentId", request.getAppointmentId());

        String htmlContent = templateEngine.process("medical-result", ctx);
        String subject = "🩺 Kết quả khám của bạn đã sẵn sàng";
        sendHtmlEmail(request.getRecipientEmail(), subject, htmlContent, null);
    }

    @Async
    @Override
    public void sendSimpleNotification(NotificationDto.SendNotificationRequest request) {
        sendHtmlEmail(request.getRecipientEmail(), request.getTitle(), request.getContent(),
                request.getRecipientId());
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent, String recipientId) {
        NotificationLog logEntry = null;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email đã gửi thành công tới: {}", to);

            logEntry = NotificationLog.builder()
                    .recipientId(recipientId)
                    .recipientEmail(to)
                    .type(NotificationLog.NotificationType.EMAIL)
                    .title(subject)
                    .content(htmlContent)
                    .status(NotificationLog.NotificationStatus.SENT)
                    .build();

        } catch (Exception e) {
            log.error("Lỗi gửi email tới {}: {}", to, e.getMessage());

            logEntry = NotificationLog.builder()
                    .recipientId(recipientId)
                    .recipientEmail(to)
                    .type(NotificationLog.NotificationType.EMAIL)
                    .title(subject)
                    .status(NotificationLog.NotificationStatus.FAILED)
                    .errorMessage(e.getMessage())
                    .build();
        } finally {
            if (logEntry != null) {
                logRepository.save(logEntry);
            }
        }
    }
}
