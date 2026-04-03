package com.bea.gestion.mapper;

import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setFonction(user.getFonction());
        dto.setMatricule(user.getMatricule());
        dto.setRole(user.getRole());
        return dto;
    }
    
    public User toEntity(UserDTO dto) {
        if (dto == null) return null;
        User user = new User();
        user.setId(dto.getId());
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setTelephone(dto.getTelephone());
        user.setFonction(dto.getFonction());
        user.setMatricule(dto.getMatricule());
        user.setRole(dto.getRole());
        return user;
    }
}