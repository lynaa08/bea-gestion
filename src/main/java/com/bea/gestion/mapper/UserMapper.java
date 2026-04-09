package com.bea.gestion.mapper;

import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setMatricule(user.getMatricule());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        return dto;
    }
}
