package com.bea.gestion.controller;

import com.bea.gestion.entity.Notification;
import com.bea.gestion.entity.User;
import com.bea.gestion.repository.UserRepository;
import com.bea.gestion.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> myNotifications(Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();

        List<Notification> notifs = notificationService.getNotificationsForUser(user);

        // Sérialiser manuellement pour éviter boucles circulaires (User→Notification→User)
        List<Map<String, Object>> result = notifs.stream().map(n -> {
            java.util.HashMap<String, Object> m = new java.util.HashMap<>();
            m.put("id", n.getId());
            m.put("titre", n.getTitre());
            m.put("message", n.getMessage());
            m.put("type", n.getType());
            m.put("lue", n.isLue());
            m.put("dateCreation", n.getDateCreation() != null ? n.getDateCreation().toString() : null);
            m.put("projetId", n.getProjetId());
            m.put("projetNom", n.getProjetNom());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/me/count")
    public ResponseEntity<Map<String, Long>> countUnread(Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        long count = notificationService.countUnread(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/lue")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/toutes-lues")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        notificationService.deleteNotification(id, user);
        return ResponseEntity.noContent().build();
    }

    private User getUser(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByMatricule(auth.getName()).orElse(null);
    }
}
