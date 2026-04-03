package com.bea.gestion.service;

import com.bea.gestion.dto.CreateProjetRequest;
import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.User;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.bea.gestion.exception.ResourceNotFoundException;
import com.bea.gestion.mapper.ProjetMapper;
import com.bea.gestion.repository.ProjetRepository;
import com.bea.gestion.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjetService {
    
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final ProjetMapper projetMapper;
    
    public ProjetService(ProjetRepository projetRepository, UserRepository userRepository, ProjetMapper projetMapper) {
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
        this.projetMapper = projetMapper;
    }
    
    public Page<ProjetDTO> getAllProjets(String nom, StatutProjet statut, TypeProjet type, LocalDate dateDebut, Long chefProjetId, Pageable pageable) {
        return projetRepository.findByFilters(nom, statut, type, dateDebut, chefProjetId, pageable).map(projetMapper::toDTO);
    }
    
    public List<ProjetDTO> getAllProjetsList() {
        return projetRepository.findAll().stream().map(projetMapper::toDTO).collect(Collectors.toList());
    }
    
    public ProjetDTO getProjetById(Long id) {
        return projetMapper.toDTO(projetRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Projet not found")));
    }
    
    public ProjetDTO createProjet(CreateProjetRequest request) {
        Projet projet = new Projet();
        projet.setNom(request.getNom());
        projet.setDescription(request.getDescription());
        projet.setDateCreation(request.getDateCreation() != null ? request.getDateCreation() : LocalDate.now());
        projet.setDateDebut(request.getDateDebut());
        projet.setDeadline(request.getDeadline());
        projet.setStatut(request.getStatut() != null ? request.getStatut() : StatutProjet.EN_ATTENTE);
        projet.setType(request.getType());
        projet.setPriorite(request.getPriorite());
        if (request.getChefProjetId() != null) {
            User chef = userRepository.findById(request.getChefProjetId()).orElse(null);
            projet.setChefProjet(chef);
        }
        return projetMapper.toDTO(projetRepository.save(projet));
    }
    
    public ProjetDTO updateProjet(Long id, CreateProjetRequest request) {
        Projet projet = projetRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Projet not found"));
        projet.setNom(request.getNom());
        projet.setDescription(request.getDescription());
        projet.setDateDebut(request.getDateDebut());
        projet.setDeadline(request.getDeadline());
        projet.setStatut(request.getStatut());
        projet.setType(request.getType());
        projet.setPriorite(request.getPriorite());
        if (request.getChefProjetId() != null) {
            User chef = userRepository.findById(request.getChefProjetId()).orElse(null);
            projet.setChefProjet(chef);
        }
        return projetMapper.toDTO(projetRepository.save(projet));
    }
    
    public void deleteProjet(Long id) {
        projetRepository.deleteById(id);
    }
    
    public ProjetDTO updateProjetStatut(Long id, StatutProjet statut) {
        Projet projet = projetRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Projet not found"));
        projet.setStatut(statut);
        return projetMapper.toDTO(projetRepository.save(projet));
    }
}