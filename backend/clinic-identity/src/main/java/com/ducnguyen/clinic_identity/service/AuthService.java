package com.ducnguyen.clinic_identity.service;

import com.ducnguyen.clinic_identity.dto.request.AuthRequest;
import com.ducnguyen.clinic_identity.dto.request.RegisterRequest;
import com.ducnguyen.clinic_identity.dto.response.AuthResponse;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    boolean validateToken(String token);
}
