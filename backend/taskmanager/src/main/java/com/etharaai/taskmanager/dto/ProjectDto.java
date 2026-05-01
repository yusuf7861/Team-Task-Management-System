package com.etharaai.taskmanager.dto;

import java.time.LocalDateTime;

public record ProjectDto(
    Long id,
    String name,
    String description,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt
) {}
