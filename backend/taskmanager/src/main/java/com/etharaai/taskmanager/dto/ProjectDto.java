package com.etharaai.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ProjectDto(
    Long id,

    @NotBlank(message = "Project name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    String name,

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    String description,

    Long createdById,

    String createdByName,

    LocalDateTime createdAt
) {}
