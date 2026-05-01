package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Subtask;
import com.etharaai.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTaskId(Long taskId);
    List<Subtask> findByAssignedToId(Long userId);
    long countByStatus(TaskStatus status);
    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);
    long countByAssignedToIdAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
    long countByDueDateNotNullAndDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
    long countByAssignedToId(Long userId);
    long countByStatusIn(java.util.Collection<com.etharaai.taskmanager.entity.TaskStatus> statuses);
    long countByAssignedToIdAndStatusIn(Long userId, java.util.Collection<com.etharaai.taskmanager.entity.TaskStatus> statuses);
}

