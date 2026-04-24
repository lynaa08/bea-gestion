package com.bea.gestion.service;

import com.bea.gestion.dto.CreateTacheRequest;
import com.bea.gestion.dto.TacheDTO;
import com.bea.gestion.dto.UpdateTachesStatutRequest;
import com.bea.gestion.entity.Notification;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.Tache;
import com.bea.gestion.entity.User;
import com.bea.gestion.enums.StatutTache;
import com.bea.gestion.repository.NotificationRepository;
import com.bea.gestion.repository.ProjetRepository;
import com.bea.gestion.repository.TacheRepository;
import com.bea.gestion.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TacheService {

    private final TacheRepository tacheRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public TacheService(TacheRepository tacheRepository,
                        ProjetRepository projetRepository,
                        UserRepository userRepository,
                        NotificationRepository notificationRepository) {
        this.tacheRepository = tacheRepository;
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    // ─── Créer une tâche ──────────────────────────────────────────────────────
    public TacheDTO createTache(CreateTacheRequest request, String creeParMatricule) {

        if (request.getTitre() == null || request.getTitre().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre est obligatoire");

        if (request.getProjetId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le projet est obligatoire");

        Projet projet = projetRepository.findById(request.getProjetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet introuvable"));

        User creePar = userRepository.findByMatricule(creeParMatricule)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // Assigné (optionnel)
        User assigne = null;
        if (request.getAssigneMatricule() != null && !request.getAssigneMatricule().isBlank()) {
            assigne = userRepository.findByMatricule(request.getAssigneMatricule())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Développeur introuvable : " + request.getAssigneMatricule()));
        }

        Tache tache = new Tache();
        tache.setTitre(request.getTitre().trim());
        tache.setDescription(request.getDescription());
        tache.setPriorite(request.getPriorite() != null ? request.getPriorite() : "MOYENNE");
        tache.setDateEcheance(request.getDateEcheance());
        tache.setStatut(StatutTache.A_FAIRE);
        tache.setDateCreation(LocalDateTime.now());
        tache.setProjet(projet);
        tache.setCreePar(creePar);
        tache.setAssigne(assigne);

        Tache saved = tacheRepository.save(tache);

        // ✅ Créer une notification dans la BD pour le développeur assigné
        if (assigne != null) {
            creerNotificationTache(assigne, saved, projet, creePar);
        }

        return toDTO(saved);
    }

    // ─── Notification interne quand tâche créée ───────────────────────────────
    private void creerNotificationTache(User assigne, Tache tache, Projet projet, User creePar) {
        Notification n = new Notification();
        n.setUser(assigne);
        n.setTitre("📋 Nouvelle tâche assignée");
        n.setMessage("\"" + tache.getTitre() + "\" vous a été assignée"
                + (projet != null ? " sur le projet \"" + projet.getNom() + "\"" : "")
                + (creePar != null ? " par " + creePar.getPrenom() + " " + creePar.getNom() : "")
                + ". Appuyez pour voir.");
        n.setType("TACHE_ASSIGNEE");
        n.setProjetId(projet != null ? projet.getId() : null);
        n.setProjetNom(projet != null ? projet.getNom() : null);
        n.setDateCreation(LocalDateTime.now());
        n.setLue(false);
        notificationRepository.save(n);
    }

    // ─── Tâches d'un projet ───────────────────────────────────────────────────
    public List<TacheDTO> getTachesParProjet(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet introuvable"));
        return tacheRepository.findByProjetOrderByDateCreationDesc(projet)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Mes tâches (développeur connecté) ───────────────────────────────────
    public List<TacheDTO> getMesTaches(String matricule) {
        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return tacheRepository.findByAssigneOrderByDateCreationDesc(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Détail d'une tâche ───────────────────────────────────────────────────
    public TacheDTO getTacheById(Long id) {
        return toDTO(tacheRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable")));
    }

    // ─── Mettre à jour le statut (DEV marque sa tâche faite) ─────────────────
    public TacheDTO updateStatut(Long id, UpdateTachesStatutRequest request, String matricule) {

        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));

        StatutTache nouveauStatut;
        try {
            nouveauStatut = StatutTache.valueOf(request.getStatut().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide : " + request.getStatut());
        }

        tache.setStatut(nouveauStatut);
        if (request.getCommentaire() != null && !request.getCommentaire().isBlank()) {
            tache.setCommentaire(request.getCommentaire().trim());
        }

        Tache saved = tacheRepository.save(tache);

        // ✅ Notifier le créateur que la tâche est terminée
        if (nouveauStatut == StatutTache.TERMINEE && tache.getCreePar() != null) {
            User dev = userRepository.findByMatricule(matricule).orElse(null);
            Notification n = new Notification();
            n.setUser(tache.getCreePar());
            n.setTitre("✅ Tâche terminée");
            n.setMessage("\"" + tache.getTitre() + "\" a été marquée comme terminée"
                    + (dev != null ? " par " + dev.getPrenom() + " " + dev.getNom() : "") + ".");
            n.setType("TACHE_TERMINEE");
            n.setProjetId(tache.getProjet() != null ? tache.getProjet().getId() : null);
            n.setProjetNom(tache.getProjet() != null ? tache.getProjet().getNom() : null);
            n.setDateCreation(LocalDateTime.now());
            n.setLue(false);
            notificationRepository.save(n);
        }

        return toDTO(saved);
    }

    // ─── Modifier une tâche ───────────────────────────────────────────────────
    public TacheDTO updateTache(Long id, CreateTacheRequest request, String matricule) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));

        if (request.getTitre() != null && !request.getTitre().isBlank())
            tache.setTitre(request.getTitre().trim());
        if (request.getDescription() != null)
            tache.setDescription(request.getDescription());
        if (request.getPriorite() != null)
            tache.setPriorite(request.getPriorite());
        if (request.getDateEcheance() != null)
            tache.setDateEcheance(request.getDateEcheance());
        if (request.getAssigneMatricule() != null) {
            if (request.getAssigneMatricule().isBlank()) {
                tache.setAssigne(null);
            } else {
                User nouvelAssigne = userRepository.findByMatricule(request.getAssigneMatricule())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                tache.setAssigne(nouvelAssigne);
            }
        }
        return toDTO(tacheRepository.save(tache));
    }

    // ─── Supprimer ────────────────────────────────────────────────────────────
    public void deleteTache(Long id) {
        if (!tacheRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable");
        tacheRepository.deleteById(id);
    }

    // ─── Mapper Entity → DTO ─────────────────────────────────────────────────
    public TacheDTO toDTO(Tache t) {
        TacheDTO dto = new TacheDTO();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setStatut(t.getStatut().name());
        dto.setStatutLabel(t.getStatut().getLabel());
        dto.setPriorite(t.getPriorite());
        dto.setDateCreation(t.getDateCreation());
        dto.setDateEcheance(t.getDateEcheance());
        dto.setCommentaire(t.getCommentaire());
        if (t.getProjet() != null) {
            dto.setProjetId(t.getProjet().getId());
            dto.setProjetNom(t.getProjet().getNom());
        }
        if (t.getCreePar() != null) {
            dto.setCreeParId(t.getCreePar().getId());
            dto.setCreeParNom(t.getCreePar().getNom());
            dto.setCreeParPrenom(t.getCreePar().getPrenom());
            dto.setCreeParMatricule(t.getCreePar().getMatricule());
        }
        if (t.getAssigne() != null) {
            dto.setAssigneId(t.getAssigne().getId());
            dto.setAssigneNom(t.getAssigne().getNom());
            dto.setAssignePrenom(t.getAssigne().getPrenom());
            dto.setAssigneMatricule(t.getAssigne().getMatricule());
        }
        return dto;
    }
}