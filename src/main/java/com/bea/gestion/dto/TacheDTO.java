package com.bea.gestion.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TacheDTO {

    private Long id;
    private String titre;
    private String description;
    private String statut;       // A_FAIRE, EN_COURS, TERMINEE, BLOQUEE
    private String statutLabel;  // "À faire", "En cours", etc.
    private String priorite;
    private LocalDateTime dateCreation;
    private LocalDate dateEcheance;
    private String commentaire;

    // Projet
    private Long projetId;
    private String projetNom;

    // Créateur
    private Long creeParId;
    private String creeParNom;
    private String creeParPrenom;
    private String creeParMatricule;

    // Assigné
    private Long assigneId;
    private String assigneNom;
    private String assignePrenom;
    private String assigneMatricule;

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getStatutLabel() { return statutLabel; }
    public void setStatutLabel(String statutLabel) { this.statutLabel = statutLabel; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDate getDateEcheance() { return dateEcheance; }
    public void setDateEcheance(LocalDate dateEcheance) { this.dateEcheance = dateEcheance; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }

    public String getProjetNom() { return projetNom; }
    public void setProjetNom(String projetNom) { this.projetNom = projetNom; }

    public Long getCreeParId() { return creeParId; }
    public void setCreeParId(Long creeParId) { this.creeParId = creeParId; }

    public String getCreeParNom() { return creeParNom; }
    public void setCreeParNom(String creeParNom) { this.creeParNom = creeParNom; }

    public String getCreeParPrenom() { return creeParPrenom; }
    public void setCreeParPrenom(String creeParPrenom) { this.creeParPrenom = creeParPrenom; }

    public String getCreeParMatricule() { return creeParMatricule; }
    public void setCreeParMatricule(String creeParMatricule) { this.creeParMatricule = creeParMatricule; }

    public Long getAssigneId() { return assigneId; }
    public void setAssigneId(Long assigneId) { this.assigneId = assigneId; }

    public String getAssigneNom() { return assigneNom; }
    public void setAssigneNom(String assigneNom) { this.assigneNom = assigneNom; }

    public String getAssignePrenom() { return assignePrenom; }
    public void setAssignePrenom(String assignePrenom) { this.assignePrenom = assignePrenom; }

    public String getAssigneMatricule() { return assigneMatricule; }
    public void setAssigneMatricule(String assigneMatricule) { this.assigneMatricule = assigneMatricule; }
}