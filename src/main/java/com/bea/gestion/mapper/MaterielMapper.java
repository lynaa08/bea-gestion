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
        dto.setMarque(m.getMarque());
        dto.setReference(m.getReference());
        dto.setBureau(m.getBureau());
        dto.setService(m.getService());
        dto.setDescription(m.getDescription());
        dto.setQuantite(m.getQuantite());
        dto.setEtat(m.getEtat());
        dto.setStatut(m.getStatut());

        // ✅ FIXED: was mapping dateLicence into dateAcquisition (wrong field)
        //    and calling setDateExpiration() which threw UnsupportedOperationException
        dto.setDateLicence(m.getDateLicence());
        dto.setDateExpiration(m.getDateExpiration());

        if (m.getProjet() != null) {
            dto.setProjetId(m.getProjet().getId());
            dto.setProjetNom(m.getProjet().getNom());
        }

        return dto;
    }
}