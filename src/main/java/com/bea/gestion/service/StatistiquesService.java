package com.bea.gestion.service;

import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.bea.gestion.repository.ProjetRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatistiquesService {
    
    private final ProjetRepository projetRepository;
    private final ProjetService projetService;
    
    public StatistiquesService(ProjetRepository projetRepository, ProjetService projetService) {
        this.projetRepository = projetRepository;
        this.projetService = projetService;
    }
    
    public Map<String, Long> getProjetStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("EN_COURS", projetRepository.countByStatut(StatutProjet.EN_COURS));
        stats.put("EN_ATTENTE", projetRepository.countByStatut(StatutProjet.EN_ATTENTE));
        stats.put("TERMINE", projetRepository.countByStatut(StatutProjet.TERMINE));
        stats.put("TOTAL", projetRepository.count());
        return stats;
    }
    
    public Map<String, Map<String, Long>> getStatsByType() {
        Map<String, Map<String, Long>> stats = new HashMap<>();
        
        for (TypeProjet type : TypeProjet.values()) {
            Map<String, Long> typeStats = new HashMap<>();
            
            // Get all projects of this type
            List<ProjetDTO> projets = projetService.getAllProjetsList().stream()
                .filter(p -> p.getType() == type)
                .collect(Collectors.toList());
            
            typeStats.put("TOTAL", (long) projets.size());
            typeStats.put("EN_COURS", projets.stream()
                .filter(p -> p.getStatut() == StatutProjet.EN_COURS)
                .count());
            typeStats.put("EN_ATTENTE", projets.stream()
                .filter(p -> p.getStatut() == StatutProjet.EN_ATTENTE)
                .count());
            typeStats.put("TERMINE", projets.stream()
                .filter(p -> p.getStatut() == StatutProjet.TERMINE)
                .count());
            
            stats.put(type.getValue(), typeStats);
        }
        
        return stats;
    }
    
    public List<ProjetDTO> getRecentProjects(int limit) {
        // Get projects directly from repository and convert to DTOs
        return projetRepository.findTop5ByOrderByDateCreationDesc()
            .stream()
            .limit(limit)
            .map(projet -> projetService.getProjetById(projet.getId()))
            .collect(Collectors.toList());
    }
    
    public Map<String, Map<String, Long>> getMonthlyStats(int months) {
        // Implementation for monthly statistics
        Map<String, Map<String, Long>> stats = new HashMap<>();
        // Add your monthly stats logic here if needed
        return stats;
    }
    
    public Map<String, Map<String, Long>> getStatsByChefProjet() {
        // Implementation for statistics by project manager
        Map<String, Map<String, Long>> stats = new HashMap<>();
        // Add your chef project stats logic here if needed
        return stats;
    }
    
    public List<ProjetDTO> getRecentActivity(int limit) {
        // Return recent project activities
        return projetService.getAllProjetsList().stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
}