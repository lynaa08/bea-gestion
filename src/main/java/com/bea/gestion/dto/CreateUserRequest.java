package com.bea.gestion.dto;

import com.bea.gestion.entity.Role;

public class CreateUserRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;
    private String matricule;
    private Role role;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
