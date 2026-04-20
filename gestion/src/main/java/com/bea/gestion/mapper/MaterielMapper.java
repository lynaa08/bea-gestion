package com.bea.gestion.mapper;

import com.bea.gestion.dto.MaterielDTO;
import com.bea.gestion.entity.Materiel;
import org.springframework.stereotype.Component;

@Component
public class MaterielMapper {

    public MaterielDTO toDTO(Materiel m) {
        if (m == null) return null;
        MaterielDTO dto = new MaterielDTO();
        dto.setId(m.getId());
        dto.setNom(m.getNom());
        dto.setReference(m.getReference());
        dto.setDescription(m.getDescription());
        dto.setEtat(m.getEtat());
        dto.setQuantite(m.getQuantite());
        dto.setCategorie(m.getCategorie());
        dto.setDateAcquisition(m.getDateAcquisition());
        if (m.getProjet() != null) {
            dto.setProjetId(m.getProjet().getId());
            dto.setProjetNom(m.getProjet().getNom());
        }
        if (m.getResponsable() != null) {
            dto.setResponsableId(m.getResponsable().getId());
            dto.setResponsableNom(m.getResponsable().getPrenom() + " " + m.getResponsable().getNom());
            dto.setResponsableMatricule(m.getResponsable().getMatricule());
        }
        return dto;
    }
}
