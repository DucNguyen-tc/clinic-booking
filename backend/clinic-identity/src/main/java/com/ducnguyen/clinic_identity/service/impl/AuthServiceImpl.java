package com.ducnguyen.clinic_identity.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.AuthResponse;
import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;
import com.ducnguyen.clinic_identity.exception.CustomException;
import com.ducnguyen.clinic_identity.repository.UserRepository;
import com.ducnguyen.clinic_identity.service.AuthService;
import com.ducnguyen.clinic_identity.utils.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
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
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new CustomException(HttpStatus.FORBIDDEN.value(), "Account is disabled");
        }

        String token = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtils.validateToken(token);
    }
}
