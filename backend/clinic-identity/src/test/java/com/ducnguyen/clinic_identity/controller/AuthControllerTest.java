package com.ducnguyen.clinic_identity.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.AuthResponse;
import com.ducnguyen.clinic_identity.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Tạm bỏ qua Security Filter vì mình test Controller layer
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
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
    void register_ShouldReturn200_WhenRequestIsValid() throws Exception {
        doNothing().when(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void register_ShouldReturn400_WhenEmailIsInvalid() throws Exception {
        registerRequest.setEmail("invalid-email");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.email").value("Invalid email format"));
    }

    @Test
    void login_ShouldReturn200AndToken_WhenCredentialsAreValid() throws Exception {
        AuthResponse authResponse = AuthResponse.builder().token("mockToken").build();
        when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("mockToken"));
    }

    @Test
    void validateToken_ShouldReturn200AndTrue_WhenTokenIsValid() throws Exception {
        when(authService.validateToken("validToken")).thenReturn(true);

        mockMvc.perform(post("/api/v1/auth/validate")
                .param("token", "validToken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data").value(true));
    }
}
