package com.bea.gestion.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sous_taches")
public class SousTache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private boolean faite = false;

    private LocalDateTime dateCreation;

    @ManyToOne
    @JoinColumn(name = "tache_id", nullable = false)
    private Tache tache;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public boolean isFaite() { return faite; }
    public void setFaite(boolean faite) { this.faite = faite; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime d) { this.dateCreation = d; }

    public Tache getTache() { return tache; }
    public void setTache(Tache tache) { this.tache = tache; }
}
