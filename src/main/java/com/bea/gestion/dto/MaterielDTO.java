package com.bea.gestion.dto;

import com.bea.gestion.enums.EtatMateriel;
import com.bea.gestion.enums.StatutMateriel;

import java.time.LocalDate;

public class MaterielDTO {
    private Long id;
    private String nom;
    private String marque;
    private String description;
    private Integer quantite;
    private LocalDate dateAcquisition;
    private Long projetId;
    private String projetNom;

    private EtatMateriel etat;
private StatutMateriel statut;
    private String bureau;
    private String service;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public EtatMateriel getEtat() { return etat; }
    public void setEtat(EtatMateriel etat) { this.etat = etat; }
    public StatutMateriel getStatut() { return statut; }
    public void setStatut(StatutMateriel statut) { this.statut = statut; }
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public LocalDate getDateAcquisition() { return dateAcquisition; }
    public void setDateAcquisition(LocalDate dateAcquisition) { this.dateAcquisition = dateAcquisition; }
    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }
    public String getProjetNom() { return projetNom; }
    public void setProjetNom(String projetNom) { this.projetNom = projetNom; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }
    
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
}
