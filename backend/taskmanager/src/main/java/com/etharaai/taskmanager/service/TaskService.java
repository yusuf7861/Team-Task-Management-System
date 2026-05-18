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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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



    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByProjectId(Long projectId) {
        // use repository method that eagerly fetches subtasks to avoid lazy-loading issues
        return taskRepository.findWithSubtasksByProjectId(projectId).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getMyTasks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all tasks assigned to the current user (including subtasks)
        return taskRepository.findWithSubtasksByAssignedToId(currentUsers.getId()).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Users currentUsers = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
        
        Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task not found"));

        if(currentUsers.getId() != task.getAssignedTo().getId()){
                throw new RuntimeException("You are not authorized to update this task");
        }

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

    @Transactional(readOnly = true)
    public TaskDto getTaskWithSubtasks(Long taskId) {
        Task task = taskRepository.findWithSubtasksById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return taskMapper.toDto(task);
    }
}
