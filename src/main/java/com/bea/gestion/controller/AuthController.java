package com.bea.gestion.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("========================================");
        System.out.println("Tentative: " + email + " / " + password);
        
        // SEUL CE CHECK COMPTE
        if ("admin@bea.dz".equals(email) && "admin123".equals(password)) {
            System.out.println("✅ SUCCÈS!");
            response.put("success", true);
            response.put("token", "token-123");
            response.put("id", 1);
            response.put("email", "admin@bea.dz");
            response.put("nom", "Admin");
            response.put("prenom", "System");
            response.put("role", "ADMIN");
        } else {
            System.out.println("❌ ÉCHEC!");
            response.put("success", false);
            response.put("message", "Email ou mot de passe incorrect");
        }
        
        return response;
    }
}