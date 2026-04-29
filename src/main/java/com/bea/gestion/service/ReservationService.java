package com.bea.gestion.service;

import com.bea.gestion.dto.CreateReservationRequest;
import com.bea.gestion.dto.ReservationDTO;
import com.bea.gestion.entity.*;
import com.bea.gestion.entity.ReservationMateriel.StatutReservation;
import com.bea.gestion.enums.StatutMateriel;
import com.bea.gestion.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final MaterielRepository    materielRepo;
    private final UserRepository        userRepo;
    private final ProjetRepository      projetRepo;

    public ReservationService(ReservationRepository reservationRepo,
                              MaterielRepository materielRepo,
                              UserRepository userRepo,
                              ProjetRepository projetRepo) {
        this.reservationRepo = reservationRepo;
        this.materielRepo    = materielRepo;
        this.userRepo        = userRepo;
        this.projetRepo      = projetRepo;
    }

    // ── Créer une réservation (toujours EN_ATTENTE – le chef décide) ──────────
    @Transactional
    public ReservationDTO creerReservation(CreateReservationRequest req) {

        Materiel materiel = materielRepo.findById(req.getMaterielId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matériel introuvable"));

        User responsable = userRepo.findByMatricule(req.getResponsableMatricule())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Responsable introuvable : " + req.getResponsableMatricule()));

        Projet projet = null;
        if (req.getProjetId() != null) {
            projet = projetRepo.findById(req.getProjetId()).orElse(null);
        }

        // Score de priorité (influence l'ordre dans la liste du chef)
        int score = calculerScore(projet, req.getDateReservation());

        ReservationMateriel resa = new ReservationMateriel();
        resa.setMateriel(materiel);
        resa.setResponsable(responsable);
        resa.setProjet(projet);
        resa.setDateReservation(req.getDateReservation());
        resa.setNote(req.getNote());
        resa.setDateCreation(LocalDateTime.now());
        resa.setScoresPriorite(score);

        // ✅ Toutes les demandes commencent EN_ATTENTE — le chef de département accepte
        resa.setStatut(StatutReservation.EN_ATTENTE);

        return toDTO(reservationRepo.save(resa));
    }

    // ── Chef de département : accepter une réservation ───────────────────────
    @Transactional
    public ReservationDTO accepterReservation(Long reservationId) {
        ReservationMateriel resa = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        if (resa.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seules les réservations EN_ATTENTE peuvent être acceptées.");
        }

        Materiel materiel = resa.getMateriel();

        // Si le matériel est déjà actif pour quelqu'un → mettre l'ancienne ACTIVE en attente
        reservationRepo.findByMaterielAndStatut(materiel, StatutReservation.ACTIVE)
                .ifPresent(ancienne -> {
                    ancienne.setStatut(StatutReservation.EN_ATTENTE);
                    reservationRepo.save(ancienne);
                });

        // Activer la réservation acceptée
        resa.setStatut(StatutReservation.ACTIVE);
        materiel.setStatut(StatutMateriel.EN_UTILISATION);
        materielRepo.save(materiel);

        return toDTO(reservationRepo.save(resa));
    }

    // ── Liste de toutes les réservations (pour le chef de département) ────────
    @Transactional(readOnly = true)
    public List<ReservationDTO> getAllReservations() {
        return reservationRepo.findAll()
                .stream()
                .sorted(Comparator
                        .comparing((ReservationMateriel r) -> {
                            // EN_ATTENTE en premier, puis ACTIVE, puis reste
                            switch (r.getStatut()) {
                                case EN_ATTENTE: return 0;
                                case ACTIVE:     return 1;
                                default:         return 2;
                            }
                        })
                        .thenComparing(Comparator.comparingInt(ReservationMateriel::getScoresPriorite).reversed()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Liste des réservations d'un matériel ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationDTO> getReservationsParMateriel(Long materielId) {
        Materiel materiel = materielRepo.findById(materielId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return reservationRepo.findByMaterielOrderByScoresPrioriteDesc(materiel)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── File d'attente ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationDTO> getFileAttente(Long materielId) {
        Materiel materiel = materielRepo.findById(materielId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return reservationRepo.findByMaterielAndStatutOrderByScoresPrioriteDesc(
                materiel, StatutReservation.EN_ATTENTE)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Terminer / libérer une réservation ────────────────────────────────────
    @Transactional
    public void terminerReservation(Long reservationId) {
        ReservationMateriel resa = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        resa.setStatut(StatutReservation.TERMINEE);
        reservationRepo.save(resa);

        // Libérer le matériel → plus personne en file → DISPONIBLE
        List<ReservationMateriel> file = reservationRepo
                .findByMaterielAndStatutOrderByScoresPrioriteDesc(
                        resa.getMateriel(), StatutReservation.ACTIVE);

        if (file.isEmpty()) {
            Materiel m = resa.getMateriel();
            m.setStatut(StatutMateriel.DISPONIBLE);
            materielRepo.save(m);
        }
    }

    // ── Annuler une réservation ───────────────────────────────────────────────
    @Transactional
    public void annulerReservation(Long reservationId) {
        ReservationMateriel resa = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        boolean wasActive = resa.getStatut() == StatutReservation.ACTIVE;
        resa.setStatut(StatutReservation.ANNULEE);
        reservationRepo.save(resa);

        if (wasActive) {
            Materiel m = resa.getMateriel();
            m.setStatut(StatutMateriel.DISPONIBLE);
            materielRepo.save(m);
        }
    }

    // ── Vérifier si un matériel est actif (ACTIVE) ───────────────────────────
    @Transactional(readOnly = true)
    public boolean estReserve(Long materielId) {
        return materielRepo.findById(materielId)
                .map(m -> reservationRepo.existsByMaterielAndStatut(m, StatutReservation.ACTIVE))
                .orElse(false);
    }

    // ── Algorithme de score de priorité ──────────────────────────────────────
    //
    //  Priorité projet :  CRITIQUE +40 | HAUTE +30 | MOYENNE +20 | BASSE +10
    //  Deadline proche :  dépassée +35 | ≤7j +30 | ≤14j +20 | ≤30j +10
    //  Durée utilisation: ≤1j +5 (demande urgente)
    //  Score plafonné à 100.
    //
    private int calculerScore(Projet projet, LocalDate dateReservation) {
        int score = 0;

        if (projet != null) {
            if (projet.getPriorite() != null) {
                switch (projet.getPriorite().toUpperCase()) {
                    case "CRITIQUE": score += 40; break;
                    case "HAUTE":    score += 30; break;
                    case "MOYENNE":  score += 20; break;
                    case "BASSE":    score += 10; break;
                }
            }

            LocalDate dateFin = projet.getDeadline();
            if (dateFin != null) {
                long joursRestants = ChronoUnit.DAYS.between(LocalDate.now(), dateFin);
                if (joursRestants < 0)        score += 35; // En retard
                else if (joursRestants <= 7)  score += 30;
                else if (joursRestants <= 14) score += 20;
                else if (joursRestants <= 30) score += 10;
            }
        }

        if (dateReservation != null) {
            long joursResa = ChronoUnit.DAYS.between(LocalDate.now(), dateReservation);
            if (joursResa <= 1) score += 5;
        }

        return Math.min(score, 100);
    }

    // ── Mapper Entity → DTO ───────────────────────────────────────────────────
    private ReservationDTO toDTO(ReservationMateriel r) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(r.getId());
        dto.setStatut(r.getStatut().name());
        dto.setScoresPriorite(r.getScoresPriorite());
        dto.setNote(r.getNote());
        dto.setDateReservation(r.getDateReservation());
        dto.setDateCreation(r.getDateCreation());

        if (r.getMateriel() != null) {
            dto.setMaterielId(r.getMateriel().getId());
            dto.setMaterielNom(r.getMateriel().getNom());
            dto.setMaterielReference(r.getMateriel().getReference());
            dto.setMaterielLicence(r.getMateriel().getLicence());
        }
        if (r.getResponsable() != null) {
            dto.setResponsableId(r.getResponsable().getId());
            dto.setResponsableNom(r.getResponsable().getNom());
            dto.setResponsablePrenom(r.getResponsable().getPrenom());
            dto.setResponsableMatricule(r.getResponsable().getMatricule());
        }
        if (r.getProjet() != null) {
            dto.setProjetId(r.getProjet().getId());
            dto.setProjetNom(r.getProjet().getNom());
            try { dto.setProjetPriorite(r.getProjet().getPriorite()); } catch (Exception ignored) {}
            try { dto.setProjetDateFin(r.getProjet().getDeadline()); } catch (Exception ignored) {}
        }
        return dto;
    }
}