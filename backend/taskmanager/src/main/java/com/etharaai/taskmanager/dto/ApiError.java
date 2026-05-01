package com.etharaai.taskmanager.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
public class ApiError {
    private String code;
    private String message;
    private int status;
    private LocalDateTime timestamp;

    public ApiError(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status.value();
        this.timestamp = LocalDateTime.now();
    }
}
