package com.bea.gestion.service;

import com.bea.gestion.dto.LoginRequest;
import com.bea.gestion.dto.LoginResponse;
import com.bea.gestion.entity.User;
import com.bea.gestion.repository.UserRepository;
import com.bea.gestion.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getMatricule(), request.getPassword())
        );

        User user = userRepository.findByMatricule(request.getMatricule())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getMatricule(), user.getRole().name());

        // ✅ Pass mustChangePassword so the frontend can intercept first login
        return new LoginResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getNom(),
            user.getPrenom(),
            user.getRole().name(),
            user.getMatricule(),
            user.isMustChangePassword()
        );
    }
}