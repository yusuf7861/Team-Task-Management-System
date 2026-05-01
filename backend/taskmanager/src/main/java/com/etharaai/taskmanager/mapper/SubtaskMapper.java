package com.etharaai.taskmanager.mapper;

import com.etharaai.taskmanager.dto.SubtaskDto;
import com.etharaai.taskmanager.entity.Subtask;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubtaskMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "assignedToId", source = "assignedTo.id")
    @Mapping(target = "assignedToName", source = "assignedTo.name")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    SubtaskDto toDto(Subtask subtask);

    List<SubtaskDto> toDtoList(List<Subtask> subtasks);
}

