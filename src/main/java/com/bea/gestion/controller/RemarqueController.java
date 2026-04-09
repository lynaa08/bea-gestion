package com.bea.gestion.controller;

import com.bea.gestion.entity.Remarque;
import com.bea.gestion.service.RemarqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets/{projetId}/remarques")
public class RemarqueController {

    private final RemarqueService remarqueService;

    public RemarqueController(RemarqueService remarqueService) {
        this.remarqueService = remarqueService;
    }

    @GetMapping
    public ResponseEntity<List<Remarque>> getByProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(remarqueService.getByProjet(projetId));
    }

    @PostMapping
    public ResponseEntity<?> ajouter(@PathVariable Long projetId,
                                     @RequestBody Map<String, Object> body,
                                     Authentication auth) {
        try {
            String contenu = (String) body.get("contenu");
            Remarque r = remarqueService.ajouter(auth.getName(), projetId, contenu);
            // Retourner un objet simple pour éviter problèmes de sérialisation circulaire
            return ResponseEntity.ok(Map.of(
                "id", r.getId(),
                "contenu", r.getContenu(),
                "dateCreation", r.getDateCreation().toString(),
                "auteurNom", r.getAuteur().getPrenom() + " " + r.getAuteur().getNom(),
                "auteurMatricule", r.getAuteur().getMatricule()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long projetId, @PathVariable Long id) {
        remarqueService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
