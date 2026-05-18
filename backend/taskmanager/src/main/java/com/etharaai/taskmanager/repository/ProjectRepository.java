package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.createdBy")
    List<Project> findAllWithCreatedBy();

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.createdBy WHERE p.id = :id")
    Optional<Project> findByIdWithCreatedBy(@Param("id") Long id);

    List<Project> findByCreatedById(Long userId);
}
