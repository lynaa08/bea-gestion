package com.bea.gestion.dto;

import com.bea.gestion.entity.Role;
import lombok.Data;

@Data
public class CreateUserRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;
    private String fonction;
    private String matricule;
    private Role role;
}