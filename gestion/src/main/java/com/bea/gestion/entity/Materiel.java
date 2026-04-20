package com.bea.gestion.entity;

import com.bea.gestion.enums.EtatMateriel;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "materiels")
public class Materiel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String reference;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EtatMateriel etat;

    private Integer quantite;

    private String categorie; // Informatique, Réseau, Bureau, etc.

    private LocalDate dateAcquisition;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private User responsable;

    // Getters & Setters
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

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public User getResponsable() { return responsable; }
    public void setResponsable(User responsable) { this.responsable = responsable; }
}
