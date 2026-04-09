package com.bea.gestion.controller;

import com.bea.gestion.entity.User;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.Role;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.bea.gestion.repository.UserRepository;
import com.bea.gestion.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@RestController
@RequestMapping("/setup")
public class SetupController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjetRepository projetRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/create-users")
    public String createUsers() {
        StringBuilder result = new StringBuilder();
        result.append("<html><body style='font-family: monospace; padding: 20px;'>");
        result.append("<h2>Création des utilisateurs</h2><hr>");
        
        try {
            createUser("ADM-001", "admin@bea.dz", "admin123", "Admin", "System", Role.ADMIN, "Administrateur", result);
            createUser("CHF-001", "chef@bea.dz", "chef123", "Benali", "Karim", Role.CHEF_DEPARTEMENT, "Chef de département", result);
            createUser("CON-001", "consultant@bea.dz", "consult123", "Said", "Fatima", Role.DEVELOPPEUR, "Développeur", result);

            result.append("<hr><strong>Total users: " + userRepository.count() + "</strong><br>");
        } catch (Exception e) {
            result.append("❌ Error: " + e.getMessage() + "<br>");
        }
        
        result.append("</body></html>");
        return result.toString();
    }

    private void createUser(String matricule, String email, String password, String nom, String prenom, Role role, String fonction, StringBuilder result) {
        if (!userRepository.existsByMatricule(matricule)) {
            User user = new User();
            user.setMatricule(matricule);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setRole(role);
    
            userRepository.save(user);
            result.append("✅ Créé: " + matricule + " / " + password + "<br>");
        } else {
            result.append("⚠️ Existe déjà: " + matricule + "<br>");
        }
    }

    @GetMapping("/check")
    public String check() {
        return "<html><body><h2>Database Status</h2>Users: " + userRepository.count() + "<br>Projects: " + projetRepository.count() + "</body></html>";
    }
}