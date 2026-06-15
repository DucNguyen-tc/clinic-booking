package com.ducnguyen.clinic_medical_record.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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

import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpMethod;



@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }



    @Slf4j
    @Component
    @RequiredArgsConstructor
    public static class JwtAuthFilter extends OncePerRequestFilter {

        private final JwtUtil jwtUtil;

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            return "OPTIONS".equalsIgnoreCase(request.getMethod());
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {

            // 1. Thử xác thực qua JWT token (Authorization header)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    if (jwtUtil.isTokenValid(token)) {
                        Claims claims = jwtUtil.extractAllClaims(token);
                        String userId = claims.getSubject();
                        String role = claims.get("role", String.class);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userId,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("JWT auth thành công cho userId={}, role={}", userId, role);
                        filterChain.doFilter(request, response);
                        return;
                    }
                } catch (Exception e) {
                    log.warn("JWT không hợp lệ: {}", e.getMessage());
                }
            }

            // 2. Fallback: Xác thực qua X-User-Id / X-User-Role header từ API Gateway
            String gatewayUserId = request.getHeader("X-User-Id");
            String gatewayRole = request.getHeader("X-User-Role");

            if (gatewayUserId != null && gatewayRole != null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                gatewayUserId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + gatewayRole))
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Gateway header auth thành công cho userId={}, role={}", gatewayUserId, gatewayRole);
            }

            filterChain.doFilter(request, response);
        }
    }
}

