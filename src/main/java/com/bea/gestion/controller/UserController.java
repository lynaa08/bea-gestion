package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateUserRequest;
import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.Role;
import com.bea.gestion.entity.User;
import com.bea.gestion.repository.UserRepository;
import com.bea.gestion.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ── ✅ NOUVEAU : liste des users par rôle (ex: /api/users/role/DEVELOPPEUR) ──
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        Role r = Role.valueOf(role.toUpperCase());
        List<UserDTO> result = userRepository.findByRole(r)
                .stream()
                .map(u -> {
                    UserDTO dto = new UserDTO();
                    dto.setId(u.getId());
                    dto.setNom(u.getNom());
                    dto.setPrenom(u.getPrenom());
                    dto.setMatricule(u.getMatricule());
                    dto.setEmail(u.getEmail());
                    dto.setRole(u.getRole().name());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ── ✅ NOUVEAU : sauvegarder le push token Expo du téléphone ──
    @PatchMapping("/push-token")
    public ResponseEntity<Void> savePushToken(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        userRepository.findByMatricule(auth.getName()).ifPresent(u -> {
            u.setPushToken(body.get("pushToken"));
            userRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_DEPARTEMENT')")
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                               @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<UserDTO> updateRole(@PathVariable Long id, @RequestBody String role) {
        return ResponseEntity.ok(userService.updateUserRole(id,
                Role.valueOf(role.trim().replace("\"", ""))));
    }
}
