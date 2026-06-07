package com.ducnguyen.clinic_payment.controller;

import com.ducnguyen.clinic_payment.dto.PaymentDto;
import com.ducnguyen.clinic_payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Thanh toán - VNPay / MoMo")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Tạo phiên thanh toán")
    public ResponseEntity<PaymentDto.CreatePaymentResponse> createPayment(
            @RequestBody PaymentDto.CreatePaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Kiểm tra trạng thái thanh toán")
    public ResponseEntity<PaymentDto.PaymentResponse> getPaymentStatus(
            @PathVariable Long appointmentId
    ) {
        return ResponseEntity.ok(paymentService.getByAppointmentId(appointmentId));
    }

    @PostMapping("/callback/vnpay")
    @Operation(summary = "Webhook nhận kết quả từ VNPay (IPN)")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("VNPay IPN callback nhận được: {}", params);
        try {
            paymentService.handleCallback("VNPAY", params);
            return ResponseEntity.ok("00");
        } catch (SecurityException e) {
            return ResponseEntity.ok("97");
        }
    }

    @GetMapping("/vnpay-return")
    @Operation(summary = "Trang kết quả sau khi thanh toán VNPay")
    public ResponseEntity<String> vnpayReturn(@RequestParam Map<String, String> params) {
        log.info("VNPay browser return nhận được: {}", params);
        try {
            paymentService.handleCallback("VNPAY", params);
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                return ResponseEntity.ok("✅ Thanh toán thành công! Mã GD: " + params.get("vnp_TransactionNo"));
            } else {
                return ResponseEntity.ok("❌ Thanh toán thất bại! Mã lỗi: " + responseCode);
            }
        } catch (Exception e) {
            log.warn("VNPay return xử lý lỗi: {}", e.getMessage());
            return ResponseEntity.ok("⚠️ Đã nhận kết quả từ VNPay");
        }
    }

    @PostMapping("/callback/momo")
    @Operation(summary = "Webhook nhận kết quả từ MoMo")
    public ResponseEntity<String> momoCallback(@RequestBody Map<String, String> params) {
        log.info("MoMo callback nhận được: {}", params);
        try {
            paymentService.handleCallback("MOMO", params);
            return ResponseEntity.ok("OK");
        } catch (SecurityException e) {
            return ResponseEntity.badRequest().body("Chữ ký không hợp lệ");
        }
    }
}
