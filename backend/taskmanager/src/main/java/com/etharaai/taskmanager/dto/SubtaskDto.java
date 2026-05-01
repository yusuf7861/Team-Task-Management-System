package com.etharaai.taskmanager.dto;

import com.etharaai.taskmanager.entity.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubtaskDto(
    Long id,
    String title,
    String description,
    TaskStatus status,
    LocalDate dueDate,
    Long taskId,
    Long assignedToId,
    String assignedToName,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt
) {}

