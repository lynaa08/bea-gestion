package com.bea.gestion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problemes")
public class Probleme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    private String priorite; // CRITIQUE, HAUTE, MOYENNE, BASSE

    private String statut = "OUVERT"; // OUVERT, EN_COURS, RESOLU, FERME

    @ManyToOne
    @JoinColumn(name = "declarant_id")
    private User declarant; // the DEVELOPPEUR who reported the problem

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    private LocalDateTime dateCreation;
    private LocalDateTime dateResolution;

    @Column(length = 1000)
    private String commentairePmo; // PMO can add a comment/resolution

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public User getDeclarant() { return declarant; }
    public void setDeclarant(User declarant) { this.declarant = declarant; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateResolution() { return dateResolution; }
    public void setDateResolution(LocalDateTime dateResolution) { this.dateResolution = dateResolution; }

    public String getCommentairePmo() { return commentairePmo; }
    public void setCommentairePmo(String commentairePmo) { this.commentairePmo = commentairePmo; }
}
