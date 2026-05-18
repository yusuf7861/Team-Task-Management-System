package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Subtask;
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
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    @Query("SELECT s FROM Subtask s " +
           "LEFT JOIN FETCH s.task " +
           "LEFT JOIN FETCH s.assignedTo " +
           "LEFT JOIN FETCH s.createdBy " +
           "WHERE s.task.id = :taskId")
    List<Subtask> findByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT s FROM Subtask s " +
           "LEFT JOIN FETCH s.task " +
           "LEFT JOIN FETCH s.assignedTo " +
           "LEFT JOIN FETCH s.createdBy " +
           "WHERE s.assignedTo.id = :userId")
    List<Subtask> findByAssignedToId(@Param("userId") Long userId);

    @Query("SELECT s FROM Subtask s " +
           "LEFT JOIN FETCH s.task " +
           "LEFT JOIN FETCH s.assignedTo " +
           "LEFT JOIN FETCH s.createdBy " +
           "WHERE s.id = :id")
    Optional<Subtask> findWithRelationsById(@Param("id") Long id);

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

