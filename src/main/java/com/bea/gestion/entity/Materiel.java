package com.bea.gestion.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.bea.gestion.enums.EtatMateriel;
import com.bea.gestion.enums.StatutMateriel;

@Entity
@Table(name = "materiels")
public class Materiel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String reference;   // Marque / référence

    // ✅ NOUVEAU — licence logicielle ou numéro de série
    private String licence;

    @Column(name = "bureau")
    private String bureau;

    @Column(name = "service")
    private String service;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat")
    private EtatMateriel etat;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutMateriel statut;  // DISPONIBLE | EN_UTILISATION | EN_REPARATION | HORS_SERVICE

    private Integer quantite;

    private LocalDate dateLicence;

    private LocalDate dateExpiration;

    @Column(length = 1000)
    private String description;

    // ✅ Le lien avec Projet a été retiré du formulaire de création.
    //    L'attribution se fait maintenant via ReservationMateriel.
    //    On garde le champ pour compatibilité avec l'existant.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    // ── Getters & Setters ──────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    // ✅ Licence
    public String getLicence() { return licence; }
    public void setLicence(String licence) { this.licence = licence; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public EtatMateriel getEtat() { return etat; }
    public void setEtat(EtatMateriel etat) { this.etat = etat; }

    public StatutMateriel getStatut() { return statut; }
    public void setStatut(StatutMateriel statut) { this.statut = statut; }

    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }

    public LocalDate getDateLicence() { return dateLicence; }
    public void setDateLicence(LocalDate dateLicence) { this.dateLicence = dateLicence; }

    public LocalDate getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDate dateExpiration) { this.dateExpiration = dateExpiration; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }

    // Alias pour compatibilité
    public String getMarque() { return this.reference; }
    public void setMarque(String marque) { this.reference = marque; }
}