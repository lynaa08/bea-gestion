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
        createUser("ADM001", "admin@bea.dz", "admin123", "Admin", "System", Role.ADMIN);
        createUser("CHEF001", "chef@bea.dz", "chef123", "Chef", "Projet", Role.CHEF_PROJET);
        createUser("CONS001", "consultant@bea.dz", "consult123", "Consultant", "BEA", Role.CONSULTANT);

        System.out.println("✅ ADM001 / admin123");
        System.out.println("✅ CHEF001 / chef123");
        System.out.println("✅ CONS001 / consult123");
    }

    private void createUser(String matricule, String email, String password, String nom, String prenom, Role role) {
        if (!userRepository.existsByMatricule(matricule)) {
            User user = new User();
            user.setMatricule(matricule);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setRole(role);
            userRepository.save(user);
        }
    }
}