package com.bea.gestion.config;

import com.bea.gestion.entity.Role;
import com.bea.gestion.entity.User;
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
    public void run(String... args) {
        createUser("ADM001",  "admin@bea.dz",     "admin123", "System",      "Admin",       Role.ADMIN);
        createUser("DIR001",  "directeur@bea.dz", "dir123",   "BEA",         "Directeur",   Role.DIRECTEUR);
        createUser("CDEP001", "chefdep@bea.dz",   "cdep123",  "Département", "Chef",        Role.CHEF_DEPARTEMENT);
        createUser("PMO001",  "pmo@bea.dz",       "pmo123",   "Étude",       "Ingénieur",   Role.INGENIEUR_ETUDE_PMO);
        createUser("DEV001",  "dev@bea.dz",       "dev123",   "BEA",         "Développeur", Role.DEVELOPPEUR);

        System.out.println("✅ Comptes initialisés:");
        System.out.println("   ADM001  / admin123  (Admin)");
        System.out.println("   DIR001  / dir123    (Directeur)");
        System.out.println("   CDEP001 / cdep123   (Chef Département)");
        System.out.println("   PMO001  / pmo123    (PMO)");
        System.out.println("   DEV001  / dev123    (Développeur)");
    }

    private void createUser(String matricule, String email, String password,
                            String nom, String prenom, Role role) {
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
