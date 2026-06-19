package com.ducnguyen.api_gateway.filter;

import com.ducnguyen.api_gateway.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * JWT Authentication Filter — chạy trên tất cả request qua Gateway.
 *
 * <p>Logic:
 * <ul>
 *   <li>Nếu path nằm trong WHITE_LIST → forward thẳng (không cần token)</li>
 *   <li>Ngược lại → kiểm tra Bearer token trong Authorization header</li>
 *   <li>Token hợp lệ → extract username/roles, forward kèm header X-User-Id & X-User-Roles</li>
 *   <li>Token không hợp lệ / thiếu → trả về 401</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtils jwtUtils;

    /**
     * Các path không yêu cầu xác thực JWT.
     */
    private static final List<String> WHITE_LIST = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",      // Fix: đổi từ /refresh-token → /refresh cho khớp AuthController
            "/api/auth/forgot-password",
            "/api/payments/callback/",  // VNPay/MoMo IPN webhook — không có JWT
            "/api/payments/vnpay-return" // VNPay browser return — không có JWT
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Bỏ qua white-list
        if (isWhiteListed(path)) {
            log.debug("White-listed path, skipping JWT validation: {}", path);
            return chain.filter(exchange);
        }

        // Lấy Authorization header
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        String token = authHeader.substring(7);

        // Validate token
        if (!jwtUtils.isTokenValid(token)) {
            log.warn("Invalid JWT token for path: {}", path);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn");
        }

        // Extract claims và forward xuống service
        String email = jwtUtils.extractUsername(token); // The subject is the email
        String userId = jwtUtils.extractId(token);
        String role = jwtUtils.extractRole(token);

        log.debug("JWT validated for user id: {}, email: {}, role: {}, path: {}", userId, email, role, path);

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(r -> r
                        .header("X-User-Id", userId)
                        .header("X-User-Email", email)
                        .header("X-User-Role", role)
                )
                .build();

        return chain.filter(mutatedExchange);
    }

    @Override
    public int getOrder() {
        return -100; // Chạy trước các filter khác
    }

    private boolean isWhiteListed(String path) {
        return WHITE_LIST.stream().anyMatch(path::startsWith);
    }
}
