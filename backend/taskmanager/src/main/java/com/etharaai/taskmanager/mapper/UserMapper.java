package com.etharaai.taskmanager.mapper;

import com.etharaai.taskmanager.dto.AuthResponse;
import com.etharaai.taskmanager.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "token", source = "token")
    AuthResponse toAuthResponse(Users users, String token);
}
