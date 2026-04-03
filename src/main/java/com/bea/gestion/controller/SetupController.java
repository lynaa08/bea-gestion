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
        result.append("<h2>Création des utilisateurs</h2>");
        result.append("<hr>");
        
        try {
            if (!userRepository.existsByEmail("admin@bea.dz")) {
                User admin = new User();
                admin.setNom("Admin");
                admin.setPrenom("System");
                admin.setEmail("admin@bea.dz");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setTelephone("0555123456");
                admin.setFonction("Administrateur");
                admin.setMatricule("ADM-001");
                userRepository.save(admin);
                result.append("✅ Admin created: admin@bea.dz / admin123<br>");
            } else {
                result.append("⚠️ Admin already exists<br>");
            }
            
            if (!userRepository.existsByEmail("chef@bea.dz")) {
                User chef = new User();
                chef.setNom("Benali");
                chef.setPrenom("Karim");
                chef.setEmail("chef@bea.dz");
                chef.setPassword(passwordEncoder.encode("chef123"));
                chef.setRole(Role.CHEF_PROJET);
                chef.setTelephone("0555987654");
                chef.setFonction("Chef de projet");
                chef.setMatricule("CHF-001");
                userRepository.save(chef);
                result.append("✅ Chef created: chef@bea.dz / chef123<br>");
            } else {
                result.append("⚠️ Chef already exists<br>");
            }
            
            if (!userRepository.existsByEmail("consultant@bea.dz")) {
                User consultant = new User();
                consultant.setNom("Said");
                consultant.setPrenom("Fatima");
                consultant.setEmail("consultant@bea.dz");
                consultant.setPassword(passwordEncoder.encode("consult123"));
                consultant.setRole(Role.CONSULTANT);
                consultant.setTelephone("0555123789");
                consultant.setFonction("Consultant");
                consultant.setMatricule("CON-001");
                userRepository.save(consultant);
                result.append("✅ Consultant created: consultant@bea.dz / consult123<br>");
            } else {
                result.append("⚠️ Consultant already exists<br>");
            }
            
            result.append("<hr>");
            result.append("<strong>Total users: " + userRepository.count() + "</strong><br>");
            
        } catch (Exception e) {
            result.append("❌ Error: " + e.getMessage() + "<br>");
        }
        
        result.append("</body></html>");
        return result.toString();
    }
    
    @GetMapping("/create-sample-projects")
    public String createSampleProjects() {
        StringBuilder result = new StringBuilder();
        result.append("<html><body style='font-family: monospace; padding: 20px;'>");
        result.append("<h2>Création des projets d'exemple</h2>");
        result.append("<hr>");
        
        try {
            if (projetRepository.count() > 0) {
                result.append("⚠️ Projects already exist! Total: " + projetRepository.count() + "<br>");
                result.append("</body></html>");
                return result.toString();
            }
            
            Projet p1 = new Projet();
            p1.setNom("Migration des données BEA");
            p1.setDescription("Migration des systèmes legacy vers la nouvelle plateforme");
            p1.setStatut(StatutProjet.EN_COURS);
            p1.setType(TypeProjet.INTERNE);
            p1.setDateCreation(LocalDate.now());
            p1.setDateDebut(LocalDate.of(2024, 1, 15));
            p1.setDeadline(LocalDate.of(2024, 6, 30));
            p1.setPriorite("Haute");
            projetRepository.save(p1);
            result.append("✅ Projet 1 créé<br>");
            
            Projet p2 = new Projet();
            p2.setNom("Application Mobile BEA");
            p2.setDescription("Développement de l'application mobile");
            p2.setStatut(StatutProjet.EN_COURS);
            p2.setType(TypeProjet.EXTERNE);
            p2.setDateCreation(LocalDate.now());
            p2.setDateDebut(LocalDate.of(2024, 2, 1));
            p2.setDeadline(LocalDate.of(2024, 8, 31));
            p2.setPriorite("Moyenne");
            projetRepository.save(p2);
            result.append("✅ Projet 2 créé<br>");
            
            Projet p3 = new Projet();
            p3.setNom("Audit Sécurité 2024");
            p3.setDescription("Audit complet de la sécurité");
            p3.setStatut(StatutProjet.EN_ATTENTE);
            p3.setType(TypeProjet.INTERNE);
            p3.setDateCreation(LocalDate.now());
            p3.setDateDebut(LocalDate.of(2024, 3, 1));
            p3.setDeadline(LocalDate.of(2024, 5, 30));
            p3.setPriorite("Haute");
            projetRepository.save(p3);
            result.append("✅ Projet 3 créé<br>");
            
            Projet p4 = new Projet();
            p4.setNom("Formation Personnel");
            p4.setDescription("Formation des employés");
            p4.setStatut(StatutProjet.TERMINE);
            p4.setType(TypeProjet.INTERNE);
            p4.setDateCreation(LocalDate.now().minusMonths(2));
            p4.setDateDebut(LocalDate.of(2023, 12, 1));
            p4.setDeadline(LocalDate.of(2024, 1, 31));
            p4.setPriorite("Basse");
            projetRepository.save(p4);
            result.append("✅ Projet 4 créé<br>");
            
            Projet p5 = new Projet();
            p5.setNom("Refonte Site Web");
            p5.setDescription("Refonte du site web institutionnel");
            p5.setStatut(StatutProjet.EN_ATTENTE);
            p5.setType(TypeProjet.EXTERNE);
            p5.setDateCreation(LocalDate.now());
            p5.setDateDebut(LocalDate.of(2024, 4, 1));
            p5.setDeadline(LocalDate.of(2024, 9, 30));
            p5.setPriorite("Moyenne");
            projetRepository.save(p5);
            result.append("✅ Projet 5 créé<br>");
            
            result.append("<hr>");
            result.append("<strong>✅ Total projects: " + projetRepository.count() + "</strong><br>");
            result.append("<br><a href='/api/login'>Go to Login →</a><br>");
            
        } catch (Exception e) {
            result.append("❌ Error: " + e.getMessage() + "<br>");
        }
        
        result.append("</body></html>");
        return result.toString();
    }
    
    @GetMapping("/check")
    public String check() {
        return "<html><body><h2>Database Status</h2>Users: " + userRepository.count() + "<br>Projects: " + projetRepository.count() + "</body></html>";
    }
}