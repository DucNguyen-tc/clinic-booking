package com.ducnguyen.clinic_payment.service.impl;

import com.ducnguyen.clinic_payment.client.NotificationClient;
import com.ducnguyen.clinic_payment.dto.PaymentDto;
import com.ducnguyen.clinic_payment.entity.Payment;
import com.ducnguyen.clinic_payment.repository.PaymentRepository;
import com.ducnguyen.clinic_payment.service.PaymentFactory;
import com.ducnguyen.clinic_payment.service.PaymentGateway;
import com.ducnguyen.clinic_payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentFactory paymentFactory;
    private final NotificationClient notificationClient;

    @Override
    @Transactional
    public PaymentDto.CreatePaymentResponse createPayment(PaymentDto.CreatePaymentRequest request) {
        PaymentGateway gateway = paymentFactory.getGateway(request.getPaymentMethod());

        String paymentUrl = gateway.createPaymentUrl(
                request.getAppointmentId(),
                request.getAmount(),
                request.getOrderInfo() != null ? request.getOrderInfo() : "Thanh toan kham benh"
        );

        Payment payment = Payment.builder()
                .appointmentId(request.getAppointmentId())
                .amount(request.getAmount())
                .paymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .status(Payment.PaymentStatus.PENDING)
                .paymentUrl(paymentUrl)
                .patientEmail(request.getPatientEmail())
                .patientName(request.getPatientName())
                .doctorName(request.getDoctorName())
                .specialty(request.getSpecialty())
                .appointmentDate(request.getAppointmentDate())
                .slotTime(request.getSlotTime())
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Đã tạo payment ID={} cho appointmentId={}", saved.getId(), saved.getAppointmentId());

        return PaymentDto.CreatePaymentResponse.builder()
                .paymentId(saved.getId())
                .appointmentId(saved.getAppointmentId())
                .paymentUrl(paymentUrl)
                .status(saved.getStatus().name())
                .build();
    }

    @Override
    @Transactional
    public void handleCallback(String method, Map<String, String> params) {
        PaymentGateway gateway = paymentFactory.getGateway(method);

        if (!gateway.verifyCallback(params)) {
            log.warn("Callback {} không hợp lệ (sai chữ ký)!", method);
            throw new SecurityException("Chữ ký callback không hợp lệ");
        }

        String transactionNo = gateway.extractTransactionNo(params);
        boolean success = gateway.isPaymentSuccess(params);

        Long appointmentId = extractAppointmentId(method, params);
        Payment payment = paymentRepository.findFirstByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment cho appointment: " + appointmentId));

        payment.setTransactionNo(transactionNo);
        payment.setStatus(success ? Payment.PaymentStatus.SUCCESS : Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);

        if (success) {
            log.info("Thanh toán thành công! appointmentId={}, txn={}", appointmentId, transactionNo);
            // Gửi email xác nhận đặt lịch nếu có thông tin bệnh nhân
            if (payment.getPatientEmail() != null && !payment.getPatientEmail().isBlank()) {
                try {
                    NotificationClient.AppointmentConfirmRequest emailReq = new NotificationClient.AppointmentConfirmRequest();
                    emailReq.setRecipientEmail(payment.getPatientEmail());
                    emailReq.setPatientName(payment.getPatientName() != null ? payment.getPatientName() : "Bệnh nhân");
                    emailReq.setDoctorName(payment.getDoctorName() != null ? payment.getDoctorName() : "Bác sĩ");
                    emailReq.setSpecialty(payment.getSpecialty() != null ? payment.getSpecialty() : "");
                    emailReq.setAppointmentDate(
                            payment.getAppointmentDate() != null ? payment.getAppointmentDate() : LocalDate.now().plusDays(1)
                    );
                    emailReq.setAppointmentTime(
                            payment.getSlotTime() != null ? payment.getSlotTime() : LocalTime.of(9, 0)
                    );
                    emailReq.setAppointmentId(appointmentId);
                    notificationClient.sendAppointmentConfirmEmail(emailReq);
                    log.info("Đã gửi email xác nhận cho {} - appointmentId={}", payment.getPatientEmail(), appointmentId);
                } catch (Exception e) {
                    log.error("Lỗi gửi email: {}", e.getMessage());
                }
            } else {
                log.warn("Không có patientEmail để gửi mail xác nhận cho appointmentId={}", appointmentId);
            }
        } else {
            log.warn("Thanh toán thất bại! appointmentId={}", appointmentId);
        }
    }

    @Override
    public PaymentDto.PaymentResponse getByAppointmentId(Long appointmentId) {
        Payment payment = paymentRepository.findFirstByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán cho lịch hẹn: " + appointmentId));
        return toResponse(payment);
    }

    private Long extractAppointmentId(String method, Map<String, String> params) {
        if ("VNPAY".equalsIgnoreCase(method)) {
            String txnRef = params.get("vnp_TxnRef");
            return Long.parseLong(txnRef.split("-")[0]);
        } else if ("MOMO".equalsIgnoreCase(method)) {
            String orderId = params.get("orderId");
            return Long.parseLong(orderId.split("-")[1]);
        }
        throw new IllegalArgumentException("Phương thức không hỗ trợ: " + method);
    }

    private PaymentDto.PaymentResponse toResponse(Payment p) {
        return PaymentDto.PaymentResponse.builder()
                .id(p.getId())
                .appointmentId(p.getAppointmentId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod().name())
                .transactionNo(p.getTransactionNo())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
