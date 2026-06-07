package com.ducnguyen.clinic_payment.service.impl;

import com.ducnguyen.clinic_payment.service.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * ===== FACTORY METHOD PATTERN - Concrete Product =====
 * Implement chi tiết luồng thanh toán của VNPay.
 *
 * Tài liệu VNPay Sandbox: https://sandbox.vnpayment.vn/apis/
 * Luồng: Tạo URL -> Redirect bệnh nhân -> VNPay callback về returnUrl
 */
@Slf4j
@Component("VNPAY")  // Bean name = tên phương thức thanh toán -> Factory dùng để tra cứu
public class VNPayGateway implements PaymentGateway {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Override
    public String createPaymentUrl(Long appointmentId, BigDecimal amount, String orderInfo) {
        try {
            String vnpTxnRef = appointmentId + "-" + System.currentTimeMillis();
            String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

            // VNPay yêu cầu số tiền x100 (không có dấu phẩy), đơn vị VND
            long vnpAmount = amount.longValue() * 100;

            Map<String, String> params = new TreeMap<>(); // TreeMap tự sort key -> quan trọng cho chữ ký
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", tmnCode);
            params.put("vnp_Amount", String.valueOf(vnpAmount));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", vnpTxnRef);
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", returnUrl);
            params.put("vnp_IpAddr", "127.0.0.1");
            params.put("vnp_CreateDate", vnpCreateDate);

            // Tạo chuỗi query và chữ ký HMAC-SHA512
            StringBuilder queryBuilder = new StringBuilder();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                queryBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                queryBuilder.append("=");
                queryBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                queryBuilder.append("&");
            }
            String queryString = queryBuilder.substring(0, queryBuilder.length() - 1);

            String secureHash = hmacSHA512(hashSecret, queryString);
            String paymentUrl = vnpayUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;

            log.info("Đã tạo VNPay URL cho appointmentId={}", appointmentId);
            return paymentUrl;

        } catch (Exception e) {
            log.error("Lỗi tạo VNPay URL: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo link thanh toán VNPay: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        // Lấy ra tất cả params trừ chữ ký, sort, rồi tạo lại chữ ký để so sánh
        Map<String, String> verifyParams = new TreeMap<>(params);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        StringBuilder queryBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : verifyParams.entrySet()) {
            queryBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            queryBuilder.append("=");
            queryBuilder.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            queryBuilder.append("&");
        }
        String queryString = queryBuilder.substring(0, queryBuilder.length() - 1);
        String expectedHash = hmacSHA512(hashSecret, queryString);

        boolean match = expectedHash.equalsIgnoreCase(receivedHash);
        if (!match) {
            log.warn("VNPay signature mismatch!");
            log.warn("Query string used for hash: {}", queryString);
            log.warn("Expected hash: {}", expectedHash);
            log.warn("Received hash: {}", receivedHash);
        }
        return match;
    }

    @Override
    public String extractTransactionNo(Map<String, String> params) {
        return params.get("vnp_TransactionNo");
    }

    @Override
    public boolean isPaymentSuccess(Map<String, String> params) {
        // VNPay trả "00" là thành công
        return "00".equals(params.get("vnp_ResponseCode"));
    }

    // ---- Helper ----
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo HMAC-SHA512: " + e.getMessage());
        }
    }
}
