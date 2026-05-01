package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.TaskDto;
import com.etharaai.taskmanager.entity.*;
import com.etharaai.taskmanager.mapper.TaskMapper;
import com.etharaai.taskmanager.repository.ProjectRepository;
import com.etharaai.taskmanager.repository.TaskRepository;
import com.etharaai.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public TaskDto createTask(TaskDto taskDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
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

        return taskRepository.findByAssignedToId(currentUsers.getId()).stream()
                .map(taskMapper::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(newStatus);
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDto(updatedTask);
    }
}
