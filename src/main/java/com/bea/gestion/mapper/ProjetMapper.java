package com.bea.gestion.mapper;

import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.entity.Projet;
import org.springframework.stereotype.Component;

@Component
public class ProjetMapper {
    
    public ProjetDTO toDTO(Projet projet) {
        if (projet == null) return null;
        ProjetDTO dto = new ProjetDTO();
        dto.setId(projet.getId());
        dto.setNom(projet.getNom());
        dto.setDescription(projet.getDescription());
        dto.setDateCreation(projet.getDateCreation());
        dto.setDateDebut(projet.getDateDebut());
        dto.setDeadline(projet.getDeadline());
        dto.setStatut(projet.getStatut());
        dto.setType(projet.getType());
        dto.setPriorite(projet.getPriorite());
        if (projet.getChefProjet() != null) {
            dto.setChefProjetId(projet.getChefProjet().getId());
            dto.setChefProjetNom(projet.getChefProjet().getNom() + " " + projet.getChefProjet().getPrenom());
        }
        return dto;
    }
    
    public Projet toEntity(ProjetDTO dto) {
        if (dto == null) return null;
        Projet projet = new Projet();
        projet.setId(dto.getId());
        projet.setNom(dto.getNom());
        projet.setDescription(dto.getDescription());
        projet.setDateCreation(dto.getDateCreation());
        projet.setDateDebut(dto.getDateDebut());
        projet.setDeadline(dto.getDeadline());
        projet.setStatut(dto.getStatut());
        projet.setType(dto.getType());
        projet.setPriorite(dto.getPriorite());
        return projet;
    }
}