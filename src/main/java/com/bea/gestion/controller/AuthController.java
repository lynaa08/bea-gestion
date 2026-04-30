package com.bea.gestion.controller;

import com.bea.gestion.dto.LoginRequest;
import com.bea.gestion.dto.LoginResponse;
import com.bea.gestion.service.AuthService;
import com.bea.gestion.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(Map.of(
                    "success", false,
                    "message", "Matricule ou mot de passe incorrect"
                ));
        }
    }

    // ✅ NEW: called from the change-password modal on first login
    // Requires a valid JWT (user is already authenticated)
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        try {
            String newPassword = body.get("newPassword");
            String matricule   = body.get("matricule");

            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit contenir au moins 6 caractères."));
            }

            userService.changePasswordFirstLogin(matricule, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès."));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Erreur lors du changement de mot de passe."));
        }
    }
}