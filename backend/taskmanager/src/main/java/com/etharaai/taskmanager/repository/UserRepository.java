package com.etharaai.taskmanager.repository;

import com.etharaai.taskmanager.entity.Role;
import com.etharaai.taskmanager.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<Users> findUserByEmailAndRole(String email, Role role);
}

