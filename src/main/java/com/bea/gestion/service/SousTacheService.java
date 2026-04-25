package com.bea.gestion.service;

import com.bea.gestion.dto.SousTacheDTO;
import com.bea.gestion.entity.SousTache;
import com.bea.gestion.entity.Tache;
import com.bea.gestion.repository.SousTacheRepository;
import com.bea.gestion.repository.TacheRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SousTacheService {

    private final SousTacheRepository sousTacheRepository;
    private final TacheRepository tacheRepository;

    public SousTacheService(SousTacheRepository sousTacheRepository,
                            TacheRepository tacheRepository) {
        this.sousTacheRepository = sousTacheRepository;
        this.tacheRepository = tacheRepository;
    }

    // ── Récupérer les sous-tâches d'une tâche ─────────────────────────────
    public List<SousTacheDTO> getSousTaches(Long tacheId) {
        Tache tache = getTacheOrThrow(tacheId);
        return sousTacheRepository.findByTacheOrderByDateCreationAsc(tache)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Créer une sous-tâche ───────────────────────────────────────────────
    public SousTacheDTO createSousTache(Long tacheId, String titre) {
        if (titre == null || titre.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre requis");

        Tache tache = getTacheOrThrow(tacheId);

        SousTache st = new SousTache();
        st.setTitre(titre.trim());
        st.setFaite(false);
        st.setDateCreation(LocalDateTime.now());
        st.setTache(tache);

        return toDTO(sousTacheRepository.save(st));
    }

    // ── Toggler faite / pas faite ─────────────────────────────────────────
    public SousTacheDTO toggleSousTache(Long id) {
        SousTache st = sousTacheRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        st.setFaite(!st.isFaite());
        return toDTO(sousTacheRepository.save(st));
    }

    // ── Supprimer une sous-tâche ───────────────────────────────────────────
    public void deleteSousTache(Long id) {
        if (!sousTacheRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        sousTacheRepository.deleteById(id);
    }

    // ── Stats : faites / total ────────────────────────────────────────────
    public Map<String, Long> getStats(Long tacheId) {
        Tache tache = getTacheOrThrow(tacheId);
        long total = sousTacheRepository.countByTacheAndFaite(tache, true)
                   + sousTacheRepository.countByTacheAndFaite(tache, false);
        long faites = sousTacheRepository.countByTacheAndFaite(tache, true);
        return Map.of("total", total, "faites", faites);
    }

    private Tache getTacheOrThrow(Long tacheId) {
        return tacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tâche introuvable"));
    }

    private SousTacheDTO toDTO(SousTache st) {
        SousTacheDTO dto = new SousTacheDTO();
        dto.setId(st.getId());
        dto.setTitre(st.getTitre());
        dto.setFaite(st.isFaite());
        dto.setDateCreation(st.getDateCreation());
        dto.setTacheId(st.getTache().getId());
        return dto;
    }
}
