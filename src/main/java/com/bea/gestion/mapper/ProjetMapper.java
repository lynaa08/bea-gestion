package com.bea.gestion.mapper;
 
import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.User;
import org.springframework.stereotype.Component;
 
import java.util.List;
import java.util.stream.Collectors;
 
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
        if (projet.getMembres() != null && !projet.getMembres().isEmpty()) {
            dto.setMembresIds(projet.getMembres().stream().map(User::getId).collect(Collectors.toList()));
            dto.setMembresMatricules(projet.getMembres().stream().map(User::getMatricule).collect(Collectors.toList()));
            dto.setMembresNoms(projet.getMembres().stream()
                .map(u -> u.getPrenom() + " " + u.getNom() + " (" + u.getMatricule() + ")")
                .collect(Collectors.toList()));
        } else {
            dto.setMembresIds(List.of());
            dto.setMembresMatricules(List.of());
            dto.setMembresNoms(List.of());
        }
        return dto;
    }
}