package com.ducnguyen.clinic_identity.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.AuthResponse;
import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;
import com.ducnguyen.clinic_identity.exception.CustomException;
import com.ducnguyen.clinic_identity.repository.UserRepository;
import com.ducnguyen.clinic_identity.utils.JwtUtils;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user123")
                .email("test@example.com")
                .passwordHash("hashedpassword")
                .role(Role.PATIENT)
                .isActive(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        authRequest = AuthRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    void register_ShouldSaveUser_WhenEmailIsNotTaken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("hashedpassword");

        authService.register(registerRequest);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailIsTaken() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () -> authService.register(registerRequest));

        assertEquals(HttpStatus.CONFLICT.value(), exception.getStatus());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(authRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtils.generateToken(testUser)).thenReturn("mockedToken");

        AuthResponse response = authService.login(authRequest);

        assertNotNull(response);
        assertEquals("mockedToken", response.getToken());
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () -> authService.login(authRequest));

        assertEquals(HttpStatus.UNAUTHORIZED.value(), exception.getStatus());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsIncorrect() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(authRequest.getPassword(), testUser.getPasswordHash())).thenReturn(false);

        CustomException exception = assertThrows(CustomException.class, () -> authService.login(authRequest));

        assertEquals(HttpStatus.UNAUTHORIZED.value(), exception.getStatus());
    }

    @Test
    void login_ShouldThrowException_WhenAccountIsDisabled() {
        testUser.setIsActive(false);
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(authRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () -> authService.login(authRequest));

        assertEquals(HttpStatus.FORBIDDEN.value(), exception.getStatus());
    }

    @Test
    void validateToken_ShouldReturnTrue_WhenTokenIsValid() {
        String token = "validToken";
        when(jwtUtils.validateToken(token)).thenReturn(true);

        boolean isValid = authService.validateToken(token);

        assertTrue(isValid);
    }
}
