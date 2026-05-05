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

    // ── Créer une réservation ─────────────────────────────────────────────────
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

        // Calcul du niveau de priorité basé sur les 3 critères
        String niveau = calculerNiveauPriorite(projet, req.getDateReservation());

        ReservationMateriel resa = new ReservationMateriel();
        resa.setMateriel(materiel);
        resa.setResponsable(responsable);
        resa.setProjet(projet);
        resa.setDateReservation(req.getDateReservation());
        resa.setNote(req.getNote());
        resa.setDateCreation(LocalDateTime.now());
        resa.setNiveauPriorite(niveau);
        resa.setStatut(StatutReservation.EN_ATTENTE);

        return toDTO(reservationRepo.save(resa));
    }

    // ── Accepter une réservation ──────────────────────────────────────────────
    @Transactional
    public ReservationDTO accepterReservation(Long reservationId) {
        ReservationMateriel resa = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        if (resa.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seules les réservations EN_ATTENTE peuvent être acceptées.");
        }

        Materiel materiel = resa.getMateriel();

        reservationRepo.findByMaterielAndStatut(materiel, StatutReservation.ACTIVE)
                .ifPresent(ancienne -> {
                    ancienne.setStatut(StatutReservation.EN_ATTENTE);
                    reservationRepo.save(ancienne);
                });

        resa.setStatut(StatutReservation.ACTIVE);
        materiel.setStatut(StatutMateriel.EN_UTILISATION);
        materielRepo.save(materiel);

        return toDTO(reservationRepo.save(resa));
    }

    // ── Liste de toutes les réservations triées par priorité ─────────────────
    // Ordre : EN_ATTENTE en premier → ACTIVE → TERMINEE/ANNULEE
    // Dans chaque groupe EN_ATTENTE : CRITIQUE → HAUTE → MOYENNE → BASSE
    // Tiebreak : deadline projet la plus proche → date de retour souhaitée la plus proche
    @Transactional(readOnly = true)
    public List<ReservationDTO> getAllReservations() {
        return reservationRepo.findAll()
                .stream()
                .sorted(
                    // 1. Statut : EN_ATTENTE d'abord
                    Comparator.comparingInt((ReservationMateriel r) -> {
                        switch (r.getStatut()) {
                            case EN_ATTENTE: return 0;
                            case ACTIVE:     return 1;
                            default:         return 2;
                        }
                    })
                    // 2. Niveau de priorité : CRITIQUE → HAUTE → MOYENNE → BASSE
                    .thenComparingInt(r -> niveauToInt(r.getNiveauPriorite()))
                    // 3. Deadline du projet la plus proche
                    .thenComparing(r -> {
                        if (r.getProjet() != null && r.getProjet().getDeadline() != null)
                            return r.getProjet().getDeadline();
                        return LocalDate.of(9999, 12, 31);
                    })
                    // 4. Date de retour souhaitée la plus proche
                    .thenComparing(r -> r.getDateReservation() != null
                            ? r.getDateReservation()
                            : LocalDate.of(9999, 12, 31))
                )
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Réservations d'un matériel ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationDTO> getReservationsParMateriel(Long materielId) {
        Materiel materiel = materielRepo.findById(materielId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return reservationRepo.findAll()
                .stream()
                .filter(r -> r.getMateriel() != null && r.getMateriel().getId().equals(materielId))
                .sorted(Comparator.comparingInt(r -> niveauToInt(r.getNiveauPriorite())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── File d'attente d'un matériel ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationDTO> getFileAttente(Long materielId) {
        Materiel materiel = materielRepo.findById(materielId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return reservationRepo.findAll()
                .stream()
                .filter(r -> r.getMateriel() != null
                        && r.getMateriel().getId().equals(materielId)
                        && r.getStatut() == StatutReservation.EN_ATTENTE)
                .sorted(
                    Comparator.comparingInt((ReservationMateriel r) -> niveauToInt(r.getNiveauPriorite()))
                    .thenComparing(r -> r.getProjet() != null && r.getProjet().getDeadline() != null
                            ? r.getProjet().getDeadline()
                            : LocalDate.of(9999, 12, 31))
                    .thenComparing(r -> r.getDateReservation() != null
                            ? r.getDateReservation()
                            : LocalDate.of(9999, 12, 31))
                )
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Terminer / libérer une réservation ────────────────────────────────────
    @Transactional
    public void terminerReservation(Long reservationId) {
        ReservationMateriel resa = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        resa.setStatut(StatutReservation.TERMINEE);
        reservationRepo.save(resa);

        // Chercher la prochaine EN_ATTENTE la plus prioritaire pour ce matériel
        List<ReservationMateriel> fileAttente = reservationRepo.findAll()
                .stream()
                .filter(r -> r.getMateriel() != null
                        && r.getMateriel().getId().equals(resa.getMateriel().getId())
                        && r.getStatut() == StatutReservation.EN_ATTENTE)
                .sorted(
                    Comparator.comparingInt((ReservationMateriel r) -> niveauToInt(r.getNiveauPriorite()))
                    .thenComparing(r -> r.getProjet() != null && r.getProjet().getDeadline() != null
                            ? r.getProjet().getDeadline()
                            : LocalDate.of(9999, 12, 31))
                    .thenComparing(r -> r.getDateReservation() != null
                            ? r.getDateReservation()
                            : LocalDate.of(9999, 12, 31))
                )
                .collect(Collectors.toList());

        if (fileAttente.isEmpty()) {
            // Personne en attente → matériel redevient DISPONIBLE
            Materiel m = resa.getMateriel();
            m.setStatut(StatutMateriel.DISPONIBLE);
            materielRepo.save(m);
        } else {
            // Promouvoir la réservation la plus prioritaire → ACTIVE
            ReservationMateriel prochaine = fileAttente.get(0);
            prochaine.setStatut(StatutReservation.ACTIVE);
            reservationRepo.save(prochaine);
            // Le matériel reste EN_UTILISATION
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

    // ── Vérifier si un matériel est actif ─────────────────────────────────────
    @Transactional(readOnly = true)
    public boolean estReserve(Long materielId) {
        return materielRepo.findById(materielId)
                .map(m -> reservationRepo.existsByMaterielAndStatut(m, StatutReservation.ACTIVE))
                .orElse(false);
    }

    // ── Convertit le niveau de priorité en entier pour le tri ────────────────
    // CRITIQUE = 0 (le plus prioritaire), BASSE = 3 (le moins prioritaire)
    private int niveauToInt(String niveau) {
        if (niveau == null) return 3;
        switch (niveau.toUpperCase()) {
            case "CRITIQUE": return 0;
            case "HAUTE":    return 1;
            case "MOYENNE":  return 2;
            default:         return 3; // BASSE
        }
    }

    // ── Algorithme de calcul du niveau de priorité ───────────────────────────
    //
    //  Critère 1 — Priorité du projet       : CRITIQUE=4 | HAUTE=3 | MOYENNE=2 | BASSE=1
    //  Critère 2 — Urgence deadline projet  : Retard=4 | ≤7j=3 | ≤14j=2 | ≤30j=1
    //  Critère 3 — Urgence date de retour   : Retard/0j=4 | ≤3j=3 | ≤7j=2 | ≤14j=1
    //
    //  Score total max = 12
    //  CRITIQUE : total ≥ 9
    //  HAUTE    : total ≥ 6
    //  MOYENNE  : total ≥ 3
    //  BASSE    : total < 3
    //
    private String calculerNiveauPriorite(Projet projet, LocalDate dateRetour) {
        int total = 0;

        // Critère 1 : priorité du projet
        if (projet != null && projet.getPriorite() != null) {
            switch (projet.getPriorite().toUpperCase()) {
                case "CRITIQUE": total += 4; break;
                case "HAUTE":    total += 3; break;
                case "MOYENNE":  total += 2; break;
                case "BASSE":    total += 1; break;
            }
        }

        // Critère 2 : urgence deadline du projet
        if (projet != null && projet.getDeadline() != null) {
            long jours = ChronoUnit.DAYS.between(LocalDate.now(), projet.getDeadline());
            if (jours < 0)        total += 4; // deadline dépassée
            else if (jours <= 7)  total += 3;
            else if (jours <= 14) total += 2;
            else if (jours <= 30) total += 1;
        }

        // Critère 3 : urgence date de retour souhaitée
        if (dateRetour != null) {
            long jours = ChronoUnit.DAYS.between(LocalDate.now(), dateRetour);
            if (jours <= 0)       total += 4; // date passée ou aujourd'hui
            else if (jours <= 3)  total += 3;
            else if (jours <= 7)  total += 2;
            else if (jours <= 14) total += 1;
        }

        // Conversion en niveau
        if (total >= 9)      return "CRITIQUE";
        else if (total >= 6) return "HAUTE";
        else if (total >= 3) return "MOYENNE";
        else                 return "BASSE";
    }

    // ── Mapper Entity → DTO ───────────────────────────────────────────────────
    private ReservationDTO toDTO(ReservationMateriel r) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(r.getId());
        dto.setStatut(r.getStatut().name());
        dto.setNiveauPriorite(r.getNiveauPriorite());
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