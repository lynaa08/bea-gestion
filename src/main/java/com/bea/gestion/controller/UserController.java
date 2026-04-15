package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateUserRequest;
import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.Role;
import com.bea.gestion.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize; 

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
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
        return ResponseEntity.ok(userService.updateUserRole(id, Role.valueOf(role.trim().replace("\"", ""))));
    }
}
