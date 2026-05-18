package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Task;
import com.etharaai.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Basic finders (kept for compatibility)
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);

    // Eager fetch subtasks for use-cases that need them to avoid LazyInitializationException
    @EntityGraph(attributePaths = {"subtasks"})
    java.util.Optional<Task> findWithSubtasksById(Long id);

    @EntityGraph(attributePaths = {"subtasks"})
    List<Task> findWithSubtasksByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"subtasks"})
    List<Task> findWithSubtasksByAssignedToId(Long userId);
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
