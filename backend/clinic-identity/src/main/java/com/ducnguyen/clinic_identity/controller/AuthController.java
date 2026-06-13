package com.ducnguyen.clinic_identity.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.ducnguyen.clinic_identity.dto.ApiResponse;
import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.AuthResponse;
import com.ducnguyen.clinic_identity.dto.response.LoginResult;
import com.ducnguyen.clinic_identity.dto.response.UserResponse;
import com.ducnguyen.clinic_identity.exception.CustomException;
import com.ducnguyen.clinic_identity.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(null, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        LoginResult loginResult = authService.login(request);

        // Tạo HttpOnly Cookie cho Refresh Token
        ResponseCookie cookie = ResponseCookie.from("refresh_token", loginResult.getRefreshToken())
                .httpOnly(true)
                .secure(true) // Chỉ truyền qua HTTPS (ở môi trường dev vẫn chạy được qua HTTPS/localhost)
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // Hạn dùng 30 ngày (bằng giây)
                .sameSite("Lax")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token(loginResult.getAccessToken())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(authResponse, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isEmpty()) {
            authService.logout(refreshToken);
        }

        // Xóa Cookie ở Client
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Xóa ngay lập tức
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "Refresh token is missing");
        }

        String newAccessToken = authService.refreshToken(refreshToken);
        
        AuthResponse authResponse = AuthResponse.builder()
                .token(newAccessToken)
                .build();

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success(isValid, "Token validation result"));
    }

    @GetMapping("/get-me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse response = authService.getMe();
        return ResponseEntity.ok(ApiResponse.success(response, "Get user info successfully"));
    }

    @GetMapping("/internal/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        UserResponse response = authService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Get user info successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody com.ducnguyen.clinic_identity.dto.request.ChangePasswordRequest request) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED.value(), "User is not authenticated");
        }
        String userId = (String) authentication.getPrincipal();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
}
