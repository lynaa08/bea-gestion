package com.bea.gestion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations_materiel")
public class ReservationMateriel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matériel réservé
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    // Responsable qui réserve
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id", nullable = false)
    private User responsable;

    // Projet lié (pour calcul de priorité)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    private LocalDate dateReservation;   // date souhaitée
    private LocalDateTime dateCreation;  // quand la demande a été faite

    // ACTIVE = matériel attribué | EN_ATTENTE = en file d'attente
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    // Score calculé automatiquement pour la priorité
    private Integer scoresPriorite = 0;

    @Column(length = 500)
    private String note;

    public enum StatutReservation {
        ACTIVE, EN_ATTENTE, TERMINEE, ANNULEE
    }

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Materiel getMateriel() { return materiel; }
    public void setMateriel(Materiel materiel) { this.materiel = materiel; }

    public User getResponsable() { return responsable; }
    public void setResponsable(User responsable) { this.responsable = responsable; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public LocalDate getDateReservation() { return dateReservation; }
    public void setDateReservation(LocalDate d) { this.dateReservation = d; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime d) { this.dateCreation = d; }

    public StatutReservation getStatut() { return statut; }
    public void setStatut(StatutReservation statut) { this.statut = statut; }

    public Integer getScoresPriorite() { return scoresPriorite; }
    public void setScoresPriorite(Integer s) { this.scoresPriorite = s; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}