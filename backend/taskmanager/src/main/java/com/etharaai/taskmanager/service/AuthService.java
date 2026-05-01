package com.etharaai.taskmanager.service;

import com.etharaai.taskmanager.dto.AuthRequest;
import com.etharaai.taskmanager.dto.AuthResponse;
import com.etharaai.taskmanager.dto.RegisterRequest;
import com.etharaai.taskmanager.entity.Users;
import com.etharaai.taskmanager.mapper.UserMapper;
import com.etharaai.taskmanager.repository.UserRepository;
import com.etharaai.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        var user = Users.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();
        
        userRepository.save(user);

        var jwtToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return userMapper.toAuthResponse(user, jwtToken);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        Users user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return userMapper.toAuthResponse(user, jwtToken);
    }
}
