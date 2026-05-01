package com.etharaai.taskmanager.dto;

public record DashboardStatsDto(
    long totalTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks
) {}
