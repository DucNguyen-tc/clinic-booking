package com.ducnguyen.clinic_identity.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.LoginResult;
import com.ducnguyen.clinic_identity.entity.Session;
import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;
import com.ducnguyen.clinic_identity.exception.CustomException;
import com.ducnguyen.clinic_identity.repository.SessionRepository;
import com.ducnguyen.clinic_identity.repository.UserRepository;
import com.ducnguyen.clinic_identity.service.AuthService;
import com.ducnguyen.clinic_identity.utils.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(HttpStatus.CONFLICT.value(), "Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT) // Mặc định đăng ký mới là Bệnh nhân
                .isActive(true)
                .build();

        userRepository.save(user);
    }

    @Override
    @Transactional
    public LoginResult login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new CustomException(HttpStatus.FORBIDDEN.value(), "Account is disabled");
        }

        String accessToken = jwtUtils.generateToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        // Tự động ghi đè session: Xóa tất cả session cũ của user này trước khi tạo mới
        sessionRepository.deleteByUserId(user.getId());

        Session session = Session.builder()
                .userId(user.getId())
                .refreshToken(refreshToken)
                .expiresAt(LocalDateTime.now().plus(jwtUtils.getRefreshExpirationMs(), ChronoUnit.MILLIS))
                .build();

        sessionRepository.save(session);

        return LoginResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtils.validateToken(token);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (!sessionRepository.existsByRefreshToken(refreshToken)) {
            throw new CustomException(HttpStatus.NOT_FOUND.value(), "Session not found");
        }
        sessionRepository.deleteByRefreshToken(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public String refreshToken(String refreshToken) {
        // 1. Kiểm tra tính hợp lệ về mặt chữ ký/hết hạn của JWT refresh token
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Invalid refresh token");
        }

        // 2. Kiểm tra sự tồn tại trong Database
        Session session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED.value(), "Session not found"));

        // 3. Kiểm tra xem session đã hết hạn trong DB chưa
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Refresh token has expired");
        }

        // 4. Tìm kiếm user tương ứng và sinh Access Token mới
        String email = jwtUtils.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED.value(), "User not found"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new CustomException(HttpStatus.FORBIDDEN.value(), "Account is disabled");
        }

        return jwtUtils.generateToken(user);
    }
}
