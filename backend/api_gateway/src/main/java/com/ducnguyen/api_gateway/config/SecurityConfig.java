package com.ducnguyen.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * WebFlux Security Configuration.
 *
 * <p>Spring Security được disable phần authentication mặc định vì
 * việc xác thực JWT đã được xử lý bởi {@code JwtAuthenticationFilter} (GlobalFilter).
 * Security config ở đây chỉ permit tất cả request đến lớp Gateway,
 * và để filter tự quyết định từ chối hay cho qua.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                // Permit tất cả — JWT validation do JwtAuthenticationFilter đảm nhận
                .authorizeExchange(exchanges -> exchanges.anyExchange().permitAll())
                .build();
    }
}
