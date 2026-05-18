package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Task;
import com.etharaai.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ── Single task with all relations for mapper + subtask check ──────────────
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.subtasks " +
           "LEFT JOIN FETCH t.project " +
           "LEFT JOIN FETCH t.assignedTo " +
           "LEFT JOIN FETCH t.createdBy " +
           "WHERE t.id = :id")
    Optional<Task> findWithSubtasksById(@Param("id") Long id);

    // ── Tasks by project (with all associations) ───────────────────────────────
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.subtasks " +
           "LEFT JOIN FETCH t.project " +
           "LEFT JOIN FETCH t.assignedTo " +
           "LEFT JOIN FETCH t.createdBy " +
           "WHERE t.project.id = :projectId")
    List<Task> findWithSubtasksByProjectId(@Param("projectId") Long projectId);

    // ── Tasks assigned to user (with all associations) ────────────────────────
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.subtasks " +
           "LEFT JOIN FETCH t.project " +
           "LEFT JOIN FETCH t.assignedTo " +
           "LEFT JOIN FETCH t.createdBy " +
           "WHERE t.assignedTo.id = :userId")
    List<Task> findWithSubtasksByAssignedToId(@Param("userId") Long userId);

    // ── Count queries (no fetch needed) ───────────────────────────────────────
    long countByStatus(TaskStatus status);
    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);
    long countByAssignedToIdAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
    long countByDueDateNotNullAndDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
    long countByAssignedToIdAndDueDateNotNullAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
    long countByAssignedToId(Long userId);
    long countByStatusIn(Collection<TaskStatus> statuses);
    long countByAssignedToIdAndStatusIn(Long userId, Collection<TaskStatus> statuses);
}
