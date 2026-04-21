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

    private String marque;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EtatMateriel statut;

    private Integer quantite;

    private String bureau;
    private String service;

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

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    public User getResponsable() { return responsable; }
    public void setResponsable(User responsable) { this.responsable = responsable; }
    public String getCategorie() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getCategorie'");
    }
}
