package com.ducnguyen.clinic_profile.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Filter để lấy thông tin xác thực (UserId, Role) do API Gateway truyền xuống qua HTTP Headers.
 * Thay thế cho việc tự parse và validate JWT.
 */
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String userId = request.getHeader("X-User-Id");
        final String role = request.getHeader("X-User-Role");
        
        // Nếu Gateway đã truyền UserId xuống và chưa có xác thực nào trong SecurityContext
        if (userId != null && !userId.trim().isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                List<GrantedAuthority> authorities = (role != null && !role.trim().isEmpty())
                        ? Collections.singletonList(new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role))
                        : Collections.emptyList();

                // Tạo đối tượng Authentication với principal là userId
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, // principal: userId
                        null,   // credentials: null vì đã tin tưởng API Gateway
                        authorities
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception e) {
                logger.error("Cannot set user authentication based on headers: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
