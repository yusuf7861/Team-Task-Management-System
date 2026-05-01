package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.Role;

public record AuthResponse(
    String token,
    Long id,
    String name,
    String email,
    Role role
) {}
