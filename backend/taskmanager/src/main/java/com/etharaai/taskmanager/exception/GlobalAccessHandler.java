package com.etharaai.taskmanager.exception;

import com.etharaai.taskmanager.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalAccessHandler {

    /**
     * Handles Jakarta Bean Validation errors (e.g., @FutureOrPresent, @NotBlank).
     * Extracts only the short default messages from each field error.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> capitalize(fe.getField()) + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return buildErrorResponse("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles explicit business-rule RuntimeExceptions thrown by service layer
     * (e.g., "Subtask due date cannot be after the parent task due date").
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntimeException(RuntimeException e) {
        return buildErrorResponse("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles Spring Security access-denied (403) errors.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException e) {
        return buildErrorResponse("FORBIDDEN", "You do not have permission to perform this action.", HttpStatus.FORBIDDEN);
    }

    /**
     * Catch-all fallback for unexpected server errors.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneralException(Exception e) {
        return buildErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ApiError> buildErrorResponse(String code, String message, HttpStatus status) {
        return new ResponseEntity<>(new ApiError(code, message, status), status);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
