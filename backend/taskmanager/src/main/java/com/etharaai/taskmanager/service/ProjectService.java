package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.ProjectDto;
import com.etharaai.taskmanager.entity.Project;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.mapper.ProjectMapper;
import com.etharaai.taskmanager.repository.ProjectRepository;
import com.etharaai.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public ProjectDto createProject(ProjectDto projectDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .name(projectDto.name())
                .description(projectDto.description())
                .createdBy(currentUsers)
                .build();

        Project savedProject = projectRepository.save(project);
        return projectMapper.toDto(savedProject);
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return projectMapper.toDto(project);
    }
}
