package com.bea.gestion.entity;
 
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.fasterxml.jackson.annotation.JsonIgnore;
 
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
 
@Entity
@Table(name = "projets")
public class Projet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @Column(nullable = false)
    private String nom;
    
    @Column(length = 1000)
    private String description;
    
    private LocalDate dateCreation;
    private LocalDate dateDebut;
    private LocalDate deadline;
    
    @Enumerated(EnumType.STRING)
    private StatutProjet statut;
    
    @Enumerated(EnumType.STRING)
    private TypeProjet type;
    
    private String priorite;
 
    @ManyToMany
    @JoinTable(
        name = "projet_membres",
        joinColumns = @JoinColumn(name = "projet_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> membres = new ArrayList<>();
 
    @JsonIgnore
    @OneToMany(mappedBy = "projet")
    private List<Materiel> materiels;
 
    // Getters and Setters
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
 
    public List<User> getMembres() { return membres; }
    public void setMembres(List<User> membres) { this.membres = membres; }
}