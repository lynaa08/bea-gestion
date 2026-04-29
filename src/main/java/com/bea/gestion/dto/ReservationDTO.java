// ══════════════════════════════════════════════════
// ReservationDTO.java
// ══════════════════════════════════════════════════
package com.bea.gestion.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDTO {
    private Long id;
    private String statut;         // ACTIVE | EN_ATTENTE | TERMINEE | ANNULEE
    private Integer scoresPriorite;
    private String note;
    private LocalDate dateReservation;
    private LocalDateTime dateCreation;

    // Matériel
    private Long materielId;
    private String materielNom;
    private String materielReference;
    private String materielLicence;

    // Responsable
    private Long responsableId;
    private String responsableNom;
    private String responsablePrenom;
    private String responsableMatricule;

    // Projet lié
    private Long projetId;
    private String projetNom;
    private String projetPriorite;
    private LocalDate projetDateFin;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Integer getScoresPriorite() { return scoresPriorite; }
    public void setScoresPriorite(Integer s) { this.scoresPriorite = s; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDate getDateReservation() { return dateReservation; }
    public void setDateReservation(LocalDate d) { this.dateReservation = d; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime d) { this.dateCreation = d; }
    public Long getMaterielId() { return materielId; }
    public void setMaterielId(Long id) { this.materielId = id; }
    public String getMaterielNom() { return materielNom; }
    public void setMaterielNom(String n) { this.materielNom = n; }
    public String getMaterielReference() { return materielReference; }
    public void setMaterielReference(String r) { this.materielReference = r; }
    public String getMaterielLicence() { return materielLicence; }
    public void setMaterielLicence(String l) { this.materielLicence = l; }
    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long id) { this.responsableId = id; }
    public String getResponsableNom() { return responsableNom; }
    public void setResponsableNom(String n) { this.responsableNom = n; }
    public String getResponsablePrenom() { return responsablePrenom; }
    public void setResponsablePrenom(String p) { this.responsablePrenom = p; }
    public String getResponsableMatricule() { return responsableMatricule; }
    public void setResponsableMatricule(String m) { this.responsableMatricule = m; }
    public Long getProjetId() { return projetId; }
    public void setProjetId(Long id) { this.projetId = id; }
    public String getProjetNom() { return projetNom; }
    public void setProjetNom(String n) { this.projetNom = n; }
    public String getProjetPriorite() { return projetPriorite; }
    public void setProjetPriorite(String p) { this.projetPriorite = p; }
    public LocalDate getProjetDateFin() { return projetDateFin; }
    public void setProjetDateFin(LocalDate d) { this.projetDateFin = d; }
}