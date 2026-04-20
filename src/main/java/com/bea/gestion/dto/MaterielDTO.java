package com.bea.gestion.dto;

import com.bea.gestion.enums.EtatMateriel;
import java.time.LocalDate;

public class MaterielDTO {
    private Long id;
    private String nom;
    private String reference;
    private String description;
    private EtatMateriel etat;
    private Integer quantite;
    private String categorie;
    private LocalDate dateAcquisition;
    private Long projetId;
    private String projetNom;
    private Long responsableId;
    private String responsableNom;
    private String responsableMatricule;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public EtatMateriel getEtat() { return etat; }
    public void setEtat(EtatMateriel etat) { this.etat = etat; }
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }
    public LocalDate getDateAcquisition() { return dateAcquisition; }
    public void setDateAcquisition(LocalDate dateAcquisition) { this.dateAcquisition = dateAcquisition; }
    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }
    public String getProjetNom() { return projetNom; }
    public void setProjetNom(String projetNom) { this.projetNom = projetNom; }
    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
    public String getResponsableNom() { return responsableNom; }
    public void setResponsableNom(String responsableNom) { this.responsableNom = responsableNom; }
    public String getResponsableMatricule() { return responsableMatricule; }
    public void setResponsableMatricule(String responsableMatricule) { this.responsableMatricule = responsableMatricule; }
}
