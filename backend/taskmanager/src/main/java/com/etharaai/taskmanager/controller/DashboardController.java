package com.etharaai.taskmanager.controller;

import com.etharaai.taskmanager.dto.DashboardStatsDto;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.repository.UserRepository;
import com.etharaai.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUsers = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardStatsDto stats = dashboardService.getDashboardStats(currentUsers);
        return ResponseEntity.ok(stats);
    }
}
