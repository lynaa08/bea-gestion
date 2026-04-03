package com.bea.gestion.config;

import com.bea.gestion.entity.User;
import com.bea.gestion.entity.Role;
import com.bea.gestion.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n========================================");
        
        // Créer un utilisateur de test
        if (!userRepository.existsByEmail("test@bea.dz")) {
            User user = new User();
            user.setEmail("test@bea.dz");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setNom("Test");
            user.setPrenom("User");
            user.setRole(Role.ADMIN);
            userRepository.save(user);
            System.out.println("✅ Utilisateur test: test@bea.dz / test123");
        }
        
        System.out.println("✅ Utilisateur ADMIN (hardcodé): admin@bea.dz / admin123");
        System.out.println("========================================\n");
    }
}