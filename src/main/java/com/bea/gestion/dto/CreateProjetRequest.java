package com.bea.gestion.dto;
 
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
 
@Data
public class CreateProjetRequest {
    private String nom;
    private String description;
    private LocalDate dateCreation;
    private LocalDate dateDebut;
    private LocalDate deadline;
    private StatutProjet statut;
    private TypeProjet type;
    private String priorite;
    private List<Long> membresIds;
}