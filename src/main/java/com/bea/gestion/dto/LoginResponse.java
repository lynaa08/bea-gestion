package com.bea.gestion.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String role;
    private String matricule;
    // ✅ NEW: frontend reads this to decide whether to show change-password modal
    private boolean mustChangePassword;

    public LoginResponse(String token, Long id, String email,
                         String nom, String prenom, String role,
                         String matricule, boolean mustChangePassword) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.prenom = prenom;
        this.role = role;
        this.matricule = matricule;
        this.mustChangePassword = mustChangePassword;
    }

    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getRole() { return role; }
    public String getMatricule() { return matricule; }
    public boolean isMustChangePassword() { return mustChangePassword; }
}