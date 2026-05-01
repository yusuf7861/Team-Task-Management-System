package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.SubtaskDto;
import com.etharaai.taskmanager.entity.*;
import com.etharaai.taskmanager.mapper.SubtaskMapper;
import com.etharaai.taskmanager.repository.SubtaskRepository;
import com.etharaai.taskmanager.repository.TaskRepository;
import com.etharaai.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SubtaskMapper subtaskMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public SubtaskDto createSubtask(Long taskId, SubtaskDto subtaskDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Users assignee = null;
        if (subtaskDto.assignedToId() != null) {
            assignee = userRepository.findById(subtaskDto.assignedToId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Subtask subtask = Subtask.builder()
                .title(subtaskDto.title())
                .description(subtaskDto.description())
                .dueDate(subtaskDto.dueDate())
                .task(task)
                .assignedTo(assignee)
                .createdBy(currentUsers)
                .status(TaskStatus.TODO)
                .build();

        Subtask savedSubtask = subtaskRepository.save(subtask);
        return subtaskMapper.toDto(savedSubtask);
    }

    public List<SubtaskDto> getSubtasksByTaskId(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return subtaskRepository.findByTaskId(taskId).stream()
                .map(subtaskMapper::toDto)
                .collect(Collectors.toList());
    }

    public SubtaskDto updateSubtaskStatus(Long subtaskId, TaskStatus newStatus) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!subtask.getAssignedTo().getEmail().equals(email) && !subtask.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update subtask status");
        }

        subtask.setStatus(newStatus);
        Subtask updatedSubtask = subtaskRepository.save(subtask);
        return subtaskMapper.toDto(updatedSubtask);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSubtask(Long subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));
        subtaskRepository.delete(subtask);
    }

    public SubtaskDto getSubtaskById(Long subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));
        return subtaskMapper.toDto(subtask);
    }
}

