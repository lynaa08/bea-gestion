package com.bea.gestion.dto;

import java.time.LocalDate;

public class CreateTacheRequest {

    private String titre;            // obligatoire
    private String description;      // optionnel
    private String priorite;         // BASSE | MOYENNE | HAUTE (optionnel)
    private LocalDate dateEcheance;  // optionnel

    private Long projetId;           // obligatoire
    private String assigneMatricule; // optionnel (matricule du DEV assigné)

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public LocalDate getDateEcheance() { return dateEcheance; }
    public void setDateEcheance(LocalDate dateEcheance) { this.dateEcheance = dateEcheance; }

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }

    public String getAssigneMatricule() { return assigneMatricule; }
    public void setAssigneMatricule(String assigneMatricule) { this.assigneMatricule = assigneMatricule; }
}