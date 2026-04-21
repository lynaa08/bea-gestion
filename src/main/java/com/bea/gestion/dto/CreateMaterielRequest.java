package com.bea.gestion.dto;

import com.bea.gestion.enums.EtatMateriel;
import java.time.LocalDate;

public class CreateMaterielRequest {
    private String nom;
    private String marque;
    private String description;
    private EtatMateriel statut;
    private Integer quantite;
    private String bureau;
    private String service;
    private LocalDate dateAcquisition;
    private Long projetId;
    private Long responsableId;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public EtatMateriel getStatut() { return statut; }
    public void setStatut(EtatMateriel statut) { this.statut = statut; }
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public LocalDate getDateAcquisition() { return dateAcquisition; }
    public void setDateAcquisition(LocalDate dateAcquisition) { this.dateAcquisition = dateAcquisition; }
    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }
    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
}
