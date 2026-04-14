package com.bea.gestion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "materiel")
public class Materiel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String service;

    @Column(nullable = false)
    private String bureau;

    private String type;
    private String marque;
    private Integer quantite;
    private String etat;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    // Constructeur par défaut
    public Materiel() {
    }

    // Constructeur avec tous les champs (sauf id et projet)
    public Materiel(String nom, String service, String bureau, String type,
            String marque, Integer quantite, String etat) {
        this.nom = nom;
        this.service = service;
        this.bureau = bureau;
        this.type = type;
        this.marque = marque;
        this.quantite = quantite;
        this.etat = etat;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getBureau() {
        return bureau;
    }

    public void setBureau(String bureau) {
        this.bureau = bureau;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    // Méthodes "statut" (non persistées)
    @Transient
    public String getStatut() {
        return (projet == null) ? "Disponible" : "Affecté au projet: " + projet.getNom();
    }

    @Transient
    public String getStatutSimple() {
        return (projet == null) ? "Disponible" : "Affecté";
    }
}