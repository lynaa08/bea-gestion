package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateProjetRequest;
import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.bea.gestion.service.ProjetService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    @GetMapping
    public ResponseEntity<Page<ProjetDTO>> getAllProjets(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) StatutProjet statut,
            @RequestParam(required = false) TypeProjet type,
            @RequestParam(required = false) LocalDate dateDebut,
            @RequestParam(required = false) Long chefProjetId,
            @PageableDefault(size = 10, sort = "dateDebut", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(projetService.getAllProjets(nom, statut, type, dateDebut, chefProjetId, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProjetDTO>> getAllProjetsList() {
        return ResponseEntity.ok(projetService.getAllProjetsList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable Long id) {
        return ResponseEntity.ok(projetService.getProjetById(id));
    }

    @PostMapping
    public ResponseEntity<ProjetDTO> createProjet(@RequestBody CreateProjetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projetService.createProjet(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetDTO> updateProjet(@PathVariable Long id,
                                                   @RequestBody CreateProjetRequest request) {
        return ResponseEntity.ok(projetService.updateProjet(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        projetService.deleteProjet(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<ProjetDTO> updateProjetStatut(@PathVariable Long id,
                                                         @RequestBody StatutProjet statut) {
        return ResponseEntity.ok(projetService.updateProjetStatut(id, statut));
    }
}
