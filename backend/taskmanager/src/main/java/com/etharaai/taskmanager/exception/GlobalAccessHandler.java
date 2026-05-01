package com.etharaai.taskmanager.exception;

import com.etharaai.taskmanager.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalAccessHandler {

    // define all methods above 👆👆👆👆
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneralException(Exception e) {
        return buildErrorResponse("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ApiError> buildErrorResponse(String code, String message, HttpStatus status) {
        return new ResponseEntity<>(new ApiError(code, message, status), status);
    }
}
