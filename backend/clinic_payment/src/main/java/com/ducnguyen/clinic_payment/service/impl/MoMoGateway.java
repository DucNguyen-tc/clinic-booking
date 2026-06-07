package com.ducnguyen.clinic_payment.service.impl;

import com.ducnguyen.clinic_payment.service.PaymentGateway;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * ===== FACTORY METHOD PATTERN - Concrete Product =====
 * Implement chi tiết luồng thanh toán của MoMo.
 *
 * Tài liệu MoMo Sandbox: https://developers.momo.vn/
 */
@Slf4j
@Component("MOMO")  // Bean name = "MOMO" -> Factory tra cứu theo key này
public class MoMoGateway implements PaymentGateway {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public String createPaymentUrl(Long appointmentId, BigDecimal amount, String orderInfo) {
        try {
            String requestId = UUID.randomUUID().toString();
            String orderId = "APPT-" + appointmentId + "-" + System.currentTimeMillis();

            // Tạo chữ ký HMAC-SHA256 theo yêu cầu MoMo
            String rawSignature = "accessKey=" + accessKey
                    + "&amount=" + amount.longValue()
                    + "&extraData="
                    + "&ipnUrl=" + ipnUrl
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + partnerCode
                    + "&redirectUrl=" + redirectUrl
                    + "&requestId=" + requestId
                    + "&requestType=payWithMethod";

            String signature = hmacSHA256(secretKey, rawSignature);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("accessKey", accessKey);
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount.longValue());
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", redirectUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("extraData", "");
            requestBody.put("requestType", "payWithMethod");
            requestBody.put("signature", signature);
            requestBody.put("lang", "vi");

            String requestJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Map<?, ?> responseBody = objectMapper.readValue(response.body(), Map.class);

            String payUrl = (String) responseBody.get("payUrl");
            if (payUrl == null) {
                throw new RuntimeException("MoMo không trả về payUrl: " + responseBody.get("message"));
            }

            log.info("Đã tạo MoMo URL cho appointmentId={}", appointmentId);
            return payUrl;

        } catch (Exception e) {
            log.error("Lỗi tạo MoMo URL: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo link thanh toán MoMo: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        // Verify chữ ký từ MoMo IPN callback
        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + params.get("amount")
                + "&extraData=" + params.getOrDefault("extraData", "")
                + "&message=" + params.get("message")
                + "&orderId=" + params.get("orderId")
                + "&orderInfo=" + params.get("orderInfo")
                + "&orderType=" + params.get("orderType")
                + "&partnerCode=" + params.get("partnerCode")
                + "&payType=" + params.get("payType")
                + "&requestId=" + params.get("requestId")
                + "&responseTime=" + params.get("responseTime")
                + "&resultCode=" + params.get("resultCode")
                + "&transId=" + params.get("transId");

        String expectedSignature = hmacSHA256(secretKey, rawSignature);
        return expectedSignature.equals(params.get("signature"));
    }

    @Override
    public String extractTransactionNo(Map<String, String> params) {
        return params.get("transId");
    }

    @Override
    public boolean isPaymentSuccess(Map<String, String> params) {
        // MoMo: resultCode = 0 là thành công
        return "0".equals(params.get("resultCode"));
    }

    // ---- Helper ----
    private String hmacSHA256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo HMAC-SHA256");
        }
    }
}
