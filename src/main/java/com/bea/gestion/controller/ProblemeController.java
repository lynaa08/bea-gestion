package com.bea.gestion.controller;

import com.bea.gestion.entity.Probleme;
import com.bea.gestion.service.ProblemeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/problemes")
public class ProblemeController {

    private final ProblemeService problemeService;

    public ProblemeController(ProblemeService problemeService) {
        this.problemeService = problemeService;
    }

    /** DEVELOPPEUR déclare un problème */
    @PostMapping
    public ResponseEntity<?> declarer(@RequestBody Map<String, Object> body,
                                      Authentication auth) {
        try {
            Probleme saved = problemeService.declarer(auth.getName(), body);
            return ResponseEntity.ok(toMap(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PMO/Admin voit tous les problèmes */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(
            problemeService.getAll().stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /** DEVELOPPEUR voit les siens */
    @GetMapping("/mine")
    public ResponseEntity<List<Map<String, Object>>> getMine(Authentication auth) {
        return ResponseEntity.ok(
            problemeService.getMine(auth.getName()).stream().map(this::toMap).collect(Collectors.toList())
        );
    }

    /** PMO met à jour le statut */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        try {
            Probleme p = problemeService.updateStatut(id, body.get("statut"), body.get("commentaire"));
            return ResponseEntity.ok(toMap(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Sérialisation manuelle pour éviter les boucles circulaires */
    private Map<String, Object> toMap(Probleme p) {
        java.util.HashMap<String, Object> m = new java.util.HashMap<>();
        m.put("id", p.getId());
        m.put("titre", p.getTitre());
        m.put("description", p.getDescription());
        m.put("priorite", p.getPriorite());
        m.put("statut", p.getStatut());
        m.put("commentairePmo", p.getCommentairePmo());
        m.put("dateCreation", p.getDateCreation() != null ? p.getDateCreation().toString() : null);
        m.put("dateResolution", p.getDateResolution() != null ? p.getDateResolution().toString() : null);

        if (p.getDeclarant() != null) {
            m.put("declarant", Map.of(
                "id", p.getDeclarant().getId(),
                "nom", p.getDeclarant().getNom(),
                "prenom", p.getDeclarant().getPrenom(),
                "matricule", p.getDeclarant().getMatricule()
            ));
        }
        if (p.getProjet() != null) {
            m.put("projet", Map.of(
                "id", p.getProjet().getId(),
                "nom", p.getProjet().getNom()
            ));
        }
        return m;
    }
}
