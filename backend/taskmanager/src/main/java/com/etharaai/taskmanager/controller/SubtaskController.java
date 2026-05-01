package com.etharaai.taskmanager.controller;

import com.etharaai.taskmanager.dto.SubtaskDto;
import com.etharaai.taskmanager.entity.TaskStatus;
import com.etharaai.taskmanager.service.SubtaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subtasks")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;

    @PostMapping("/task/{taskId}")
    public ResponseEntity<SubtaskDto> createSubtask(@PathVariable Long taskId, @RequestBody SubtaskDto subtaskDto) {
        return ResponseEntity.ok(subtaskService.createSubtask(taskId, subtaskDto));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<SubtaskDto>> getSubtasksByTaskId(@PathVariable Long taskId) {
        return ResponseEntity.ok(subtaskService.getSubtasksByTaskId(taskId));
    }

    @GetMapping("/{subtaskId}")
    public ResponseEntity<SubtaskDto> getSubtaskById(@PathVariable Long subtaskId) {
        return ResponseEntity.ok(subtaskService.getSubtaskById(subtaskId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubtaskDto>> getSubtasksByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(subtaskService.getSubtasksByUserId(userId));
    }

    @GetMapping("/my-subtasks")
    public ResponseEntity<List<SubtaskDto>> getMySubtasks() {
        return ResponseEntity.ok(subtaskService.getMySubtasks());
    }

    @PatchMapping("/{subtaskId}/status")
    public ResponseEntity<SubtaskDto> updateSubtaskStatus(@PathVariable Long subtaskId, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(subtaskService.updateSubtaskStatus(subtaskId, status));
    }

    @DeleteMapping("/{subtaskId}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable Long subtaskId) {
        subtaskService.deleteSubtask(subtaskId);
        return ResponseEntity.noContent().build();
    }
}

