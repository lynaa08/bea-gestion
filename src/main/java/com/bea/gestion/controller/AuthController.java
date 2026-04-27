package com.bea.gestion.controller;

import com.bea.gestion.dto.LoginRequest;
import com.bea.gestion.dto.LoginResponse;
import com.bea.gestion.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(java.util.Map.of(
                    "success", false,
                    "message", "Matricule ou mot de passe incorrect"
                ));
        }
    }
}
