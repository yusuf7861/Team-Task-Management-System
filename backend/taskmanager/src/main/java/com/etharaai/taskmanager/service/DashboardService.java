package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.DashboardStatsDto;
import com.etharaai.taskmanager.entity.Role;
import com.etharaai.taskmanager.entity.TaskStatus;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.repository.SubtaskRepository;
import com.etharaai.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;

    public DashboardStatsDto getDashboardStats(Users currentUser) {
        long totalTasks;
        long completedTasks;
        long pendingTasks;
        long overdueTasks;

        if (currentUser.getRole() == Role.ADMIN) {
            totalTasks = taskRepository.count();
            completedTasks = taskRepository.countByStatus(TaskStatus.DONE);
            pendingTasks = taskRepository.countByStatusIn(Arrays.asList(TaskStatus.TODO, TaskStatus.IN_PROGRESS));
            overdueTasks = taskRepository.countByDueDateNotNullAndDueDateBeforeAndStatusNot(LocalDate.now(), TaskStatus.DONE);
        } else {
            Long userId = currentUser.getId();
            List<TaskStatus> pendingStatuses = Arrays.asList(TaskStatus.TODO, TaskStatus.IN_PROGRESS);
            LocalDate now = LocalDate.now();

            // Total: tasks + subtasks assigned to user
            totalTasks = taskRepository.countByAssignedToId(userId) + 
                         subtaskRepository.countByAssignedToId(userId);

            // Completed: DONE tasks + subtasks
            completedTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE) + 
                             subtaskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE);

            // Pending: TODO/IN_PROGRESS tasks + subtasks
            pendingTasks = taskRepository.countByAssignedToIdAndStatusIn(userId, pendingStatuses) + 
                           subtaskRepository.countByAssignedToIdAndStatusIn(userId, pendingStatuses);

            // Overdue: Tasks/subtasks assigned to user with past due date and not DONE
            overdueTasks = taskRepository.countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(userId, now, TaskStatus.DONE) + 
                           subtaskRepository.countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(userId, now, TaskStatus.DONE);
        }

        return new DashboardStatsDto(totalTasks, completedTasks, pendingTasks, overdueTasks);
    }
}
