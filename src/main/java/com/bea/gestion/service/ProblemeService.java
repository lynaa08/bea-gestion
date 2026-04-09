package com.bea.gestion.service;

import com.bea.gestion.entity.Probleme;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.User;
import com.bea.gestion.entity.Role;
import com.bea.gestion.repository.ProblemeRepository;
import com.bea.gestion.repository.ProjetRepository;
import com.bea.gestion.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ProblemeService {

    private final ProblemeRepository problemeRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProblemeService(ProblemeRepository problemeRepository,
                           ProjetRepository projetRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.problemeRepository = problemeRepository;
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Probleme declarer(String matricule, Map<String, Object> body) {
        User dev = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + matricule));

        Probleme p = new Probleme();
        p.setTitre((String) body.get("titre"));
        p.setDescription((String) body.getOrDefault("description", ""));
        p.setPriorite((String) body.getOrDefault("priorite", "MOYENNE"));
        p.setStatut("OUVERT");
        p.setDeclarant(dev);
        p.setDateCreation(LocalDateTime.now());

        // Projet optionnel
        Object projetIdObj = body.get("projetId");
        if (projetIdObj != null && !projetIdObj.toString().isBlank()) {
            try {
                Long projetId = Long.valueOf(projetIdObj.toString());
                projetRepository.findById(projetId).ifPresent(p::setProjet);
            } catch (NumberFormatException ignored) {}
        }

        Probleme saved = problemeRepository.save(p);

        // Notifier tous les PMO (sans bloquer si erreur)
        try {
            userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.INGENIEUR_ETUDE_PMO)
                .forEach(pmo -> notificationService.notifyProblemeDeclare(
                    pmo,
                    saved.getTitre(),
                    dev.getPrenom() + " " + dev.getNom(),
                    saved.getProjet() != null ? saved.getProjet().getId() : null,
                    saved.getProjet() != null ? saved.getProjet().getNom() : null
                ));
        } catch (Exception e) {
            System.err.println("⚠️ Notification PMO échouée : " + e.getMessage());
        }

        return saved;
    }

    public List<Probleme> getAll() {
        return problemeRepository.findAllByOrderByDateCreationDesc();
    }

    public List<Probleme> getMine(String matricule) {
        User dev = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return problemeRepository.findByDeclarantOrderByDateCreationDesc(dev);
    }

    @Transactional
    public Probleme updateStatut(Long id, String statut, String commentaire) {
        Probleme p = problemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problème non trouvé : " + id));
        p.setStatut(statut);
        if (commentaire != null && !commentaire.isBlank()) {
            p.setCommentairePmo(commentaire);
        }
        if ("RESOLU".equals(statut)) {
            p.setDateResolution(LocalDateTime.now());
        }
        return problemeRepository.save(p);
    }
}
