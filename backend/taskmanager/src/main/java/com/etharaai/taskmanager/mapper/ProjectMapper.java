package com.etharaai.taskmanager.mapper;

import com.etharaai.taskmanager.dto.ProjectDto;
import com.etharaai.taskmanager.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProjectMapper {
    
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    ProjectDto toDto(Project project);
}
