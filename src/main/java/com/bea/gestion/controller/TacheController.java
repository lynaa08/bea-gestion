package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateTacheRequest;
import com.bea.gestion.dto.TacheDTO;
import com.bea.gestion.dto.UpdateTachesStatutRequest;
import com.bea.gestion.service.TacheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taches")
public class TacheController {

    private final TacheService tacheService;

    public TacheController(TacheService tacheService) {
        this.tacheService = tacheService;
    }

    // ── GET /api/taches/me → tâches du développeur connecté ──────────────────
    @GetMapping("/me")
    public ResponseEntity<List<TacheDTO>> getMesTaches(Authentication auth) {
        return ResponseEntity.ok(tacheService.getMesTaches(auth.getName()));
    }

    // ── GET /api/taches/projet/{id} → tâches d'un projet ─────────────────────
    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<TacheDTO>> getTachesProjet(
            @PathVariable Long projetId) {
        return ResponseEntity.ok(tacheService.getTachesParProjet(projetId));
    }

    // ── GET /api/taches/{id} → détail d'une tâche ────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<TacheDTO> getTache(@PathVariable Long id) {
        return ResponseEntity.ok(tacheService.getTacheById(id));
    }

    // ── POST /api/taches → créer une tâche ───────────────────────────────────
    // ✅ Tous les rôles authentifiés peuvent créer une tâche
    // Le DEV crée pour lui-même, les managers peuvent assigner à un DEV
    @PostMapping
    public ResponseEntity<TacheDTO> createTache(
            @RequestBody CreateTacheRequest request,
            Authentication auth) {
        TacheDTO created = tacheService.createTache(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── PATCH /api/taches/{id}/statut → marquer une tâche faite ──────────────
    @PatchMapping("/{id}/statut")
    public ResponseEntity<TacheDTO> updateStatut(
            @PathVariable Long id,
            @RequestBody UpdateTachesStatutRequest request,
            Authentication auth) {
        return ResponseEntity.ok(
                tacheService.updateStatut(id, request, auth.getName()));
    }

    // ── PUT /api/taches/{id} → modifier une tâche ────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<TacheDTO> updateTache(
            @PathVariable Long id,
            @RequestBody CreateTacheRequest request,
            Authentication auth) {
        return ResponseEntity.ok(
                tacheService.updateTache(id, request, auth.getName()));
    }

    // ── DELETE /api/taches/{id} → supprimer une tâche ────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return ResponseEntity.noContent().build();
    }
}
