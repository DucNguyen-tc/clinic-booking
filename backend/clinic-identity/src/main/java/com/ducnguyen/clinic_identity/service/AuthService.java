package com.ducnguyen.clinic_identity.service;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.ChangePasswordRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.LoginResult;
import com.ducnguyen.clinic_identity.dto.response.UserResponse;

public interface AuthService {
    void register(RegisterRequest request);
    LoginResult login(AuthRequest request);
    boolean validateToken(String token);
    void logout(String refreshToken);
    String refreshToken(String refreshToken);
    UserResponse getMe();
    void changePassword(String userId, ChangePasswordRequest request);
}
