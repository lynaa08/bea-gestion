package com.bea.gestion.controller;

import com.bea.gestion.entity.User;
import com.bea.gestion.repository.UserRepository;
import com.bea.gestion.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur de test — utilisez ces endpoints pour vérifier que les notifications fonctionnent.
 *
 * COMMENT TESTER :
 * 1. Connectez-vous avec ADM001 / admin123
 * 2. Ouvrez l'URL : GET http://localhost:8082/api/test/notif
 * 3. Rafraîchissez n'importe quelle page → la cloche doit afficher un badge
 *
 * OU depuis le navigateur (F12 > Console) après connexion :
 *   fetch('/api/test/notif', {headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}})
 *     .then(r => r.json()).then(console.log)
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public TestController(NotificationService notificationService,
                          UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /** Crée une notification de test pour l'utilisateur connecté */
    @GetMapping("/notif")
    public ResponseEntity<Map<String, Object>> testNotif(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));

        User user = userRepository.findByMatricule(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "Utilisateur non trouvé"));

        // Crée une notification visible dans le panel
        notificationService.notifyProblemeDeclare(
            user,
            "Test de notification 🔔",
            "Système de test",
            null,
            null
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notification créée pour " + user.getPrenom() + " " + user.getNom(),
            "matricule", user.getMatricule()
        ));
    }

    /** Vérifie que l'API est disponible */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "OK", "app", "BEA Gestion Projets"));
    }
}
