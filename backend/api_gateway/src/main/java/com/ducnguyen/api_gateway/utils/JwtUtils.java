package com.ducnguyen.api_gateway.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import io.jsonwebtoken.io.Decoders;
import java.util.Date;

/**
 * JWT utility — dùng chung secret key với clinic-identity.
 * Gateway chỉ cần VALIDATE và PARSE token, không tạo token mới.
 */
@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    // ── Private helpers ─────────────────────────────────────────────────────

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Kiểm tra token còn hợp lệ (chữ ký đúng + chưa hết hạn).
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Lấy username (subject) từ token.
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Lấy roles từ claim "role" trong token.
     * Trả về chuỗi rỗng nếu không có claim.
     */
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object role = claims.get("role");
        return role != null ? role.toString() : "";
    }

    /**
     * Lấy user ID từ claim "id" trong token.
     */
    public String extractId(String token) {
        Claims claims = extractAllClaims(token);
        Object id = claims.get("id");
        return id != null ? id.toString() : "";
    }
}
