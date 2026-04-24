package com.bea.gestion.entity;

import com.bea.gestion.enums.StatutTache;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "taches")
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTache statut = StatutTache.A_FAIRE;

    private String priorite; // BASSE, MOYENNE, HAUTE

    private LocalDateTime dateCreation;

    private LocalDate dateEcheance;

    // Qui a créé la tâche (PMO / Chef / Admin)
    @ManyToOne
    @JoinColumn(name = "cree_par_id")
    private User creePar;

    // Développeur assigné à la tâche
    @ManyToOne
    @JoinColumn(name = "assigne_id")
    private User assigne;

    // Projet concerné
    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    // Commentaire de clôture / remarque
    @Column(length = 1000)
    private String commentaire;

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StatutTache getStatut() { return statut; }
    public void setStatut(StatutTache statut) { this.statut = statut; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDate getDateEcheance() { return dateEcheance; }
    public void setDateEcheance(LocalDate dateEcheance) { this.dateEcheance = dateEcheance; }

    public User getCreePar() { return creePar; }
    public void setCreePar(User creePar) { this.creePar = creePar; }

    public User getAssigne() { return assigne; }
    public void setAssigne(User assigne) { this.assigne = assigne; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}