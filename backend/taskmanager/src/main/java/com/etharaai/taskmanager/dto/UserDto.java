package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.Role;
import java.time.LocalDateTime;

public record UserDto(
    Long id,
    String name,
    String email,
    Role role,
    LocalDateTime createdAt
) {}
