package com.bea.gestion.dto;

import com.bea.gestion.enums.EtatMateriel;
import com.bea.gestion.enums.StatutMateriel;

import java.time.LocalDate;

public class CreateMaterielRequest {
    private String nom;
    private String marque;
    // ✅ "reference" alias – the form sends "reference", marque is an alias
    private String reference;
    private String description;
    private Integer quantite;
    private String bureau;
    private String service;
    private LocalDate dateAcquisition;
    private Long projetId;
    private EtatMateriel etat;
    private StatutMateriel statut;

    // ✅ FIXED: were throwing UnsupportedOperationException — now real fields
    private LocalDate dateLicence;
    private LocalDate dateExpiration;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getMarque() { return marque != null ? marque : reference; }
    public void setMarque(String marque) { this.marque = marque; }

    public String getReference() { return reference != null ? reference : marque; }
    public void setReference(String reference) { this.reference = reference; this.marque = reference; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EtatMateriel getEtat() { return etat; }
    public void setEtat(EtatMateriel etat) { this.etat = etat; }

    public StatutMateriel getStatut() { return statut; }
    public void setStatut(StatutMateriel statut) { this.statut = statut; }

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

    // ✅ FIXED: real implementations, no more UnsupportedOperationException
    public LocalDate getDateLicence() { return dateLicence; }
    public void setDateLicence(LocalDate dateLicence) { this.dateLicence = dateLicence; }

    public LocalDate getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDate dateExpiration) { this.dateExpiration = dateExpiration; }
}