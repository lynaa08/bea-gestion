package com.bea.gestion.service;

import com.bea.gestion.dto.CreateUserRequest;
import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.Role;
import com.bea.gestion.entity.User;
import com.bea.gestion.exception.ResourceNotFoundException;
import com.bea.gestion.mapper.UserMapper;
import com.bea.gestion.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       UserMapper userMapper,
                       PasswordEncoder passwordEncoder,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDTO(user);
    }

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByMatricule(request.getMatricule())) {
            throw new RuntimeException("Matricule already exists: " + request.getMatricule());
        }

        String plainPassword = request.getPassword();

        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(plainPassword));
        user.setTelephone(request.getTelephone());
        user.setMatricule(request.getMatricule());
        user.setRole(request.getRole());
        // ✅ Force password change on first login
        user.setMustChangePassword(true);

        User saved = userRepository.save(user);
        notificationService.notifyUserCreated(saved, plainPassword);
        return userMapper.toDTO(saved);
    }

    public UserDTO updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            // Admin manually reset the password → force change again
            user.setMustChangePassword(true);
        }
        user.setTelephone(request.getTelephone());
        user.setMatricule(request.getMatricule());
        user.setRole(request.getRole());
        return userMapper.toDTO(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        return userMapper.toDTO(userRepository.save(user));
    }

    public User findByMatricule(String matricule) {
        return userRepository.findByMatricule(matricule).orElse(null);
    }

    // ✅ NEW: called after the user sets their new password in the modal
    public void changePasswordFirstLogin(String matricule, String newPassword) {
        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + matricule));
        user.setPassword(passwordEncoder.encode(newPassword));
        // ✅ Clear the flag — next login goes straight to dashboard
        user.setMustChangePassword(false);
        userRepository.save(user);
    }
}