package com.ducnguyen.clinic_identity.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
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
import com.ducnguyen.clinic_identity.dto.response.LoginResult;
import com.ducnguyen.clinic_identity.entity.Session;
import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;
import com.ducnguyen.clinic_identity.exception.CustomException;
import com.ducnguyen.clinic_identity.repository.SessionRepository;
import com.ducnguyen.clinic_identity.repository.UserRepository;
import com.ducnguyen.clinic_identity.utils.JwtUtils;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SessionRepository sessionRepository;

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
    void login_ShouldReturnLoginResult_WhenCredentialsAreValid() {
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(authRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);
        when(jwtUtils.generateToken(testUser)).thenReturn("mockedAccessToken");
        when(jwtUtils.generateRefreshToken(testUser)).thenReturn("mockedRefreshToken");
        when(jwtUtils.getRefreshExpirationMs()).thenReturn(2592000000L);

        LoginResult result = authService.login(authRequest);

        assertNotNull(result);
        assertEquals("mockedAccessToken", result.getAccessToken());
        assertEquals("mockedRefreshToken", result.getRefreshToken());

        verify(sessionRepository).deleteByUserId(testUser.getId());
        verify(sessionRepository).save(any(Session.class));
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

    @Test
    void logout_ShouldDeleteSession_WhenSessionExists() {
        String token = "validRefreshToken";
        when(sessionRepository.existsByRefreshToken(token)).thenReturn(true);

        authService.logout(token);

        verify(sessionRepository).deleteByRefreshToken(token);
    }

    @Test
    void logout_ShouldThrowException_WhenSessionDoesNotExist() {
        String token = "invalidRefreshToken";
        when(sessionRepository.existsByRefreshToken(token)).thenReturn(false);

        CustomException exception = assertThrows(CustomException.class, () -> authService.logout(token));

        assertEquals(HttpStatus.NOT_FOUND.value(), exception.getStatus());
    }

    @Test
    void refreshToken_ShouldReturnNewAccessToken_WhenTokenIsValid() {
        String token = "validRefreshToken";
        Session session = Session.builder()
                .userId("user123")
                .refreshToken(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        when(jwtUtils.validateToken(token)).thenReturn(true);
        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(session));
        when(jwtUtils.getEmailFromToken(token)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateToken(testUser)).thenReturn("newAccessToken");

        String newAccessToken = authService.refreshToken(token);

        assertEquals("newAccessToken", newAccessToken);
    }

    @Test
    void refreshToken_ShouldThrowException_WhenTokenIsExpiredInDb() {
        String token = "expiredRefreshToken";
        Session session = Session.builder()
                .userId("user123")
                .refreshToken(token)
                .expiresAt(LocalDateTime.now().minusHours(1))
                .build();

        when(jwtUtils.validateToken(token)).thenReturn(true);
        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(session));

        CustomException exception = assertThrows(CustomException.class, () -> authService.refreshToken(token));

        assertEquals(HttpStatus.UNAUTHORIZED.value(), exception.getStatus());
    }

    @Test
    void getMe_ShouldReturnUserResponse_WhenAuthenticated() {
        org.springframework.security.core.Authentication auth = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user123", null);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        com.ducnguyen.clinic_identity.dto.response.UserResponse response = authService.getMe();

        assertNotNull(response);
        assertEquals("user123", response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(Role.PATIENT, response.getRole());

        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    void getMe_ShouldThrowException_WhenNotAuthenticated() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        CustomException exception = assertThrows(CustomException.class, () -> authService.getMe());
        assertEquals(HttpStatus.UNAUTHORIZED.value(), exception.getStatus());
    }
}
