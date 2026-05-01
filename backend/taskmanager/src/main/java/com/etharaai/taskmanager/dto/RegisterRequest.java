package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.Role;

public record RegisterRequest(
    String name,
    String email,
    String password,
    Role role
) {}
