package com.bea.gestion.dto;

import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import java.time.LocalDate;

public class ProjetDTO {
    private Long id;
    private String nom;
    private String description;
    private LocalDate dateCreation;
    private LocalDate dateDebut;
    private LocalDate deadline;
    private StatutProjet statut;
    private TypeProjet type;
    private String priorite;
    private Long chefProjetId;
    private String chefProjetNom;
    private String chefProjetMatricule;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public StatutProjet getStatut() { return statut; }
    public void setStatut(StatutProjet statut) { this.statut = statut; }
    public TypeProjet getType() { return type; }
    public void setType(TypeProjet type) { this.type = type; }
    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }
    public Long getChefProjetId() { return chefProjetId; }
    public void setChefProjetId(Long chefProjetId) { this.chefProjetId = chefProjetId; }
    public String getChefProjetNom() { return chefProjetNom; }
    public void setChefProjetNom(String chefProjetNom) { this.chefProjetNom = chefProjetNom; }
    public String getChefProjetMatricule() { return chefProjetMatricule; }
    public void setChefProjetMatricule(String chefProjetMatricule) { this.chefProjetMatricule = chefProjetMatricule; }
}
