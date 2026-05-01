package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.TaskStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskDto(
    Long id,

    @NotBlank(message = "Task title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    String title,

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    String description,

    TaskStatus status,

    LocalDate dueDate,

    @NotNull(message = "Project ID is required")
    Long projectId,

    String projectName,

    Long assignedToId,

    String assignedToName,

    Long createdById,

    String createdByName,

    LocalDateTime createdAt,

    @Valid
    List<SubtaskDto> subtasks
) {}
