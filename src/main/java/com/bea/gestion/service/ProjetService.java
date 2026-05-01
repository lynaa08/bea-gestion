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
    private final NotificationService notificationService;
 
    public ProjetService(ProjetRepository projetRepository,
                         UserRepository userRepository,
                         ProjetMapper projetMapper,
                         NotificationService notificationService) {
        this.projetRepository    = projetRepository;
        this.userRepository      = userRepository;
        this.projetMapper        = projetMapper;
        this.notificationService = notificationService;
    }
 
    public Page<ProjetDTO> getAllProjets(String nom, StatutProjet statut, TypeProjet type,
                                         LocalDate dateDebut, Pageable pageable) {
        return projetRepository.findByFilters(nom, statut, type, dateDebut, pageable)
                               .map(projetMapper::toDTO);
    }
 
    public List<ProjetDTO> getAllProjetsList() {
        return projetRepository.findAll().stream().map(projetMapper::toDTO).collect(Collectors.toList());
    }
 
    public ProjetDTO getProjetById(Long id) {
        return projetMapper.toDTO(projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet not found")));
    }
 
    public ProjetDTO createProjet(CreateProjetRequest request) {
        Projet projet = new Projet();
        projet.setNom(request.getNom());
        projet.setDescription(request.getDescription());
        projet.setDateCreation(request.getDateCreation() != null ? request.getDateCreation() : LocalDate.now());
        projet.setDateDebut(request.getDateDebut());
        projet.setDeadline(request.getDeadline());
        projet.setStatut(request.getStatut() != null ? request.getStatut() : StatutProjet.NON_COMMENCE);
        projet.setType(request.getType());
        projet.setPriorite(request.getPriorite());
 
        // Handle membres
        if (request.getMembresIds() != null && !request.getMembresIds().isEmpty()) {
            List<User> membres = userRepository.findAllById(request.getMembresIds());
            projet.setMembres(membres);
        }
 
        Projet saved = projetRepository.save(projet);
 
        // ── Notification ──────────────────────────────────────────────────────
        notificationService.notifyProjetCreated(saved);
        // ─────────────────────────────────────────────────────────────────────
 
        return projetMapper.toDTO(saved);
    }
 
    public ProjetDTO updateProjet(Long id, CreateProjetRequest request) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet not found"));
 
        projet.setNom(request.getNom());
        projet.setDescription(request.getDescription());
        projet.setDateDebut(request.getDateDebut());
        projet.setDeadline(request.getDeadline());
        projet.setStatut(request.getStatut());
        projet.setType(request.getType());
        projet.setPriorite(request.getPriorite());
 
        // Handle membres
        if (request.getMembresIds() != null) {
            List<User> membres = userRepository.findAllById(request.getMembresIds());
            projet.setMembres(membres);
        }
 
        Projet saved = projetRepository.save(projet);
        return projetMapper.toDTO(saved);
    }
 
    public void deleteProjet(Long id) {
        projetRepository.deleteById(id);
    }
 
    public ProjetDTO updateProjetStatut(Long id, StatutProjet statut) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet not found"));
 
        StatutProjet ancienStatut = projet.getStatut();
        projet.setStatut(statut);
        Projet saved = projetRepository.save(projet);
 
        // ── Notification ──────────────────────────────────────────────────────
        notificationService.notifyStatutChanged(saved, ancienStatut);
        // ─────────────────────────────────────────────────────────────────────
 
        return projetMapper.toDTO(saved);
    }
 
    // ── Projets où l'utilisateur est membre ───────────────────────────────────
    public List<ProjetDTO> getMesProjets(String matricule) {
        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return projetRepository.findAll().stream()
                .filter(p -> p.getMembres() != null && p.getMembres().contains(user))
                .map(projetMapper::toDTO)
                .collect(Collectors.toList());
    }
}