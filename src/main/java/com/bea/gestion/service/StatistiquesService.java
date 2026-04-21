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
        stats.put("EN_COURS",          projetRepository.countByStatut(StatutProjet.EN_COURS));
        stats.put("NON_COMMENCE",      projetRepository.countByStatut(StatutProjet.NON_COMMENCE));
        stats.put("CLOTURE",           projetRepository.countByStatut(StatutProjet.CLOTURE));
        stats.put("PAS_DE_VISIBILITE", projetRepository.countByStatut(StatutProjet.PAS_DE_VISIBILITE));
        stats.put("TOTAL",             projetRepository.count());
        return stats;
    }

    public Map<String, Map<String, Long>> getStatsByType() {
        Map<String, Map<String, Long>> stats = new HashMap<>();
        List<ProjetDTO> all = projetService.getAllProjetsList();
        for (TypeProjet type : TypeProjet.values()) {
            List<ProjetDTO> sub = all.stream().filter(p -> p.getType() == type).collect(Collectors.toList());
            Map<String, Long> m = new HashMap<>();
            m.put("TOTAL",             (long) sub.size());
            m.put("EN_COURS",          sub.stream().filter(p -> p.getStatut() == StatutProjet.EN_COURS).count());
            m.put("CLOTURE",           sub.stream().filter(p -> p.getStatut() == StatutProjet.CLOTURE).count());
            m.put("NON_COMMENCE",      sub.stream().filter(p -> p.getStatut() == StatutProjet.NON_COMMENCE).count());
            m.put("PAS_DE_VISIBILITE", sub.stream().filter(p -> p.getStatut() == StatutProjet.PAS_DE_VISIBILITE).count());
            stats.put(type.getValue(), m);
        }
        return stats;
    }

    /** Used by DashboardController /recent */
    public List<ProjetDTO> getRecentProjets(int limit) {
        return projetRepository.findTop5ByOrderByDateCreationDesc()
            .stream().limit(limit)
            .map(p -> projetService.getProjetById(p.getId()))
            .collect(Collectors.toList());
    }
}
