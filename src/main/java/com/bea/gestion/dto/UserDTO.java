package com.bea.gestion.dto;

import com.bea.gestion.entity.Role;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String fonction;
    private String matricule;
    private Role role;
}