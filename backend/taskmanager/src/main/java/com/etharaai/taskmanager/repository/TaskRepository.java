package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Task;
import com.etharaai.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);
    long countByStatus(TaskStatus status);
    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);
    long countByAssignedToIdAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
    long countByDueDateNotNullAndDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
}
