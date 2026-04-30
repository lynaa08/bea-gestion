package com.bea.gestion.dto;

import java.time.LocalDate;

public class CreateReservationRequest {
    private Long materielId;         // obligatoire
    private String responsableMatricule; // obligatoire
    private Long projetId;           // optionnel (pour calcul priorité)
    private LocalDate dateReservation;
    private String note;

    public Long getMaterielId() { return materielId; }
    public void setMaterielId(Long materielId) { this.materielId = materielId; }
    public String getResponsableMatricule() { return responsableMatricule; }
    public void setResponsableMatricule(String m) { this.responsableMatricule = m; }
    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }
    public LocalDate getDateReservation() { return dateReservation; }
    public void setDateReservation(LocalDate d) { this.dateReservation = d; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}