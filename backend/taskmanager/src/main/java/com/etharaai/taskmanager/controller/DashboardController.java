package com.etharaai.taskmanager.controller;

import com.etharaai.taskmanager.dto.DashboardStatsDto;
import com.etharaai.taskmanager.entity.Role;
import com.etharaai.taskmanager.entity.TaskStatus;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.repository.TaskRepository;
import com.etharaai.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalTasks;
        long completedTasks;
        long pendingTasks;
        long overdueTasks;

        if (currentUsers.getRole() == Role.ADMIN) {
            totalTasks = taskRepository.count();
            completedTasks = taskRepository.countByStatus(TaskStatus.DONE);
            pendingTasks = taskRepository.countByStatus(TaskStatus.TODO) + taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
            overdueTasks = taskRepository.countByDueDateNotNullAndDueDateBeforeAndStatusNot(LocalDate.now(), TaskStatus.DONE);
        } else {
            Long userId = currentUsers.getId();
            totalTasks = taskRepository.findByAssignedToId(userId).size();
            completedTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE);
            pendingTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TODO) + 
                           taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.IN_PROGRESS);
            overdueTasks = taskRepository.countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(userId, LocalDate.now(), TaskStatus.DONE);
        }

        DashboardStatsDto stats = new DashboardStatsDto(
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks
        );

        return ResponseEntity.ok(stats);
    }
}
