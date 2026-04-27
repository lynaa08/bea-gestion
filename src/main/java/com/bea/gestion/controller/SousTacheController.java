package com.bea.gestion.controller;

import com.bea.gestion.dto.SousTacheDTO;
import com.bea.gestion.service.SousTacheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taches/{tacheId}/sous-taches")
public class SousTacheController {

    private final SousTacheService sousTacheService;

    public SousTacheController(SousTacheService sousTacheService) {
        this.sousTacheService = sousTacheService;
    }

    // GET /api/taches/{tacheId}/sous-taches
    @GetMapping
    public ResponseEntity<List<SousTacheDTO>> getAll(@PathVariable Long tacheId) {
        return ResponseEntity.ok(sousTacheService.getSousTaches(tacheId));
    }

    // POST /api/taches/{tacheId}/sous-taches
    @PostMapping
    public ResponseEntity<SousTacheDTO> create(
            @PathVariable Long tacheId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(sousTacheService.createSousTache(tacheId, body.get("titre")));
    }

    // PATCH /api/taches/{tacheId}/sous-taches/{id}/toggle
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<SousTacheDTO> toggle(
            @PathVariable Long tacheId,
            @PathVariable Long id) {
        return ResponseEntity.ok(sousTacheService.toggleSousTache(id));
    }

    // DELETE /api/taches/{tacheId}/sous-taches/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long tacheId,
            @PathVariable Long id) {
        sousTacheService.deleteSousTache(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/taches/{tacheId}/sous-taches/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats(@PathVariable Long tacheId) {
        return ResponseEntity.ok(sousTacheService.getStats(tacheId));
    }
}
