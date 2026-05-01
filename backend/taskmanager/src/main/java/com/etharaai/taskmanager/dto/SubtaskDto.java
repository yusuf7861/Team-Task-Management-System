package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubtaskDto(
    Long id,

    @NotBlank(message = "Subtask title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    String title,

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    String description,

    TaskStatus status,

    LocalDate dueDate,

    @NotNull(message = "Task ID is required")
    Long taskId,

    Long assignedToId,

    String assignedToName,

    Long createdById,

    String createdByName,

    LocalDateTime createdAt
) {}

