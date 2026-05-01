package com.etharaai.taskmanager.dto;

public record AuthRequest(
    String email,
    String password
) {}
