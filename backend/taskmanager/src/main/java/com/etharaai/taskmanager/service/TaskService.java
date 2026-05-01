package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.TaskDto;
import com.etharaai.taskmanager.entity.*;
import com.etharaai.taskmanager.mapper.TaskMapper;
import com.etharaai.taskmanager.repository.ProjectRepository;
import com.etharaai.taskmanager.repository.SubtaskRepository;
import com.etharaai.taskmanager.repository.TaskRepository;
import com.etharaai.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskDto createTask(TaskDto taskDto) {
        String email = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(taskDto.projectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Users assignee = null;
        if (taskDto.assignedToId() != null) {
            assignee = userRepository.findById(taskDto.assignedToId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Task task = Task.builder()
                .title(taskDto.title())
                .description(taskDto.description())
                .dueDate(taskDto.dueDate())
                .project(project)
                .assignedTo(assignee)
                .createdBy(currentUsers)
                .status(TaskStatus.TODO)
                .build();

        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }



    public List<TaskDto> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getMyTasks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all tasks assigned to the current user
        return taskRepository.findByAssignedToId(currentUsers.getId()).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

                if (newStatus == TaskStatus.DONE && task.getSubtasks() != null && task.getSubtasks().stream().anyMatch(subtask -> subtask.getStatus() != TaskStatus.DONE)) {
                        throw new RuntimeException("Complete all subtasks before marking the task as done");
                }

        task.setStatus(newStatus);
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDto(updatedTask);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        taskRepository.delete(task);
    }

    public TaskDto getTaskWithSubtasks(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return taskMapper.toDto(task);
    }
}
