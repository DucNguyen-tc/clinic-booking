package com.ducnguyen.clinic_identity.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.ducnguyen.clinic_identity.dto.ApiResponse;

public class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleCustomException_ShouldReturnCorrectResponse() {
        CustomException exception = new CustomException(HttpStatus.CONFLICT.value(), "Email already exists");

        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleCustomException(exception);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.CONFLICT.value(), response.getBody().getStatus());
        assertEquals("Email already exists", response.getBody().getMessage());
    }

    @Test
    void handleValidationExceptions_ShouldReturnMapOfErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("objectName", "email", "Invalid email format");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ApiResponse<Map<String, String>>> response = exceptionHandler.handleValidationExceptions(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getBody().getStatus());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertEquals("Invalid email format", response.getBody().getData().get("email"));
    }

    @Test
    void handleGenericException_ShouldReturn500() {
        Exception exception = new Exception("Unexpected database error");

        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleGenericException(exception);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getBody().getStatus());
        assertTrue(response.getBody().getMessage().contains("Unexpected database error"));
    }
    
    private void assertTrue(boolean condition) {
        assertEquals(true, condition);
    }
}
