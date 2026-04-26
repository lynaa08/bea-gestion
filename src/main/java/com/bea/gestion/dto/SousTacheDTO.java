package com.bea.gestion.dto;

import java.time.LocalDateTime;

public class SousTacheDTO {
    private Long id;
    private String titre;
    private boolean faite;
    private LocalDateTime dateCreation;
    private Long tacheId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public boolean isFaite() { return faite; }
    public void setFaite(boolean faite) { this.faite = faite; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime d) { this.dateCreation = d; }

    public Long getTacheId() { return tacheId; }
    public void setTacheId(Long tacheId) { this.tacheId = tacheId; }
}
