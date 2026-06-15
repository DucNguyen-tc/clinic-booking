package com.ducnguyen.clinic_payment.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Fix: Thay JwtFilter bằng HeaderAuthenticationFilter để nhất quán với
 * các service khác (appointment, profile, medical_record).
 * Gateway đã xác thực JWT và forward X-User-Id / X-User-Role headers.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final HeaderAuthenticationFilter headerAuthFilter;

    public SecurityConfig(HeaderAuthenticationFilter headerAuthFilter) {
        this.headerAuthFilter = headerAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // VNPay/MoMo callback không cần auth (từ cổng thanh toán, không qua Gateway)
                .requestMatchers("/api/payments/callback/**", "/api/payments/vnpay-return").permitAll()
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Filter lấy thông tin user từ headers do API Gateway forward.
     * Nhất quán với HeaderAuthenticationFilter của các service khác.
     */
    @Component
    public static class HeaderAuthenticationFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request,
                                        @NonNull HttpServletResponse response,
                                        @NonNull FilterChain filterChain) throws ServletException, IOException {

            final String userId = request.getHeader("X-User-Id");
            final String role   = request.getHeader("X-User-Role");

            if (userId != null && !userId.trim().isEmpty()
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    List<GrantedAuthority> authorities = (role != null && !role.trim().isEmpty())
                            ? Collections.singletonList(
                                new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                            : Collections.emptyList();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } catch (Exception e) {
                    logger.error("Cannot set user authentication from headers: " + e.getMessage());
                }
            }

            filterChain.doFilter(request, response);
        }
    }
}
