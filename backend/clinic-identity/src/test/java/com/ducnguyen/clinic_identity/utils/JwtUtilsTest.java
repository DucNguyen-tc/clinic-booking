package com.ducnguyen.clinic_identity.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;

import io.jsonwebtoken.Jwts;

public class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private User testUser;
    
    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000); // 1 hour

        testUser = User.builder()
                .id("123")
                .email("test@example.com")
                .role(Role.PATIENT)
                .build();
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        String token = jwtUtils.generateToken(testUser);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void getEmailFromToken_ShouldReturnCorrectEmail() {
        String token = jwtUtils.generateToken(testUser);
        
        String email = jwtUtils.getEmailFromToken(token);

        assertEquals("test@example.com", email);
    }

    @Test
    void validateToken_ShouldReturnTrue_ForValidToken() {
        String token = jwtUtils.generateToken(testUser);

        boolean isValid = jwtUtils.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalse_ForInvalidToken() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtUtils.validateToken(invalidToken);

        assertFalse(isValid);
    }
}
