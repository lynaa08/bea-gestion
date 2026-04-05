package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateProjetRequest;
import com.bea.gestion.dto.ProjetDTO;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import com.bea.gestion.service.ProjetService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/projets")

public class ProjetController {
    
    private final ProjetService projetService;
    
    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
    public ResponseEntity<List<ProjetDTO>> getAllProjetsList() {
        return ResponseEntity.ok(projetService.getAllProjetsList());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable Long id) {
        return ResponseEntity.ok(projetService.getProjetById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET')")
    public ResponseEntity<ProjetDTO> createProjet(@Valid @RequestBody CreateProjetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projetService.createProjet(request));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET')")
    public ResponseEntity<ProjetDTO> updateProjet(@PathVariable Long id, @Valid @RequestBody CreateProjetRequest request) {
        return ResponseEntity.ok(projetService.updateProjet(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        projetService.deleteProjet(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET')")
    public ResponseEntity<ProjetDTO> updateProjetStatut(@PathVariable Long id, @RequestBody StatutProjet statut) {
        return ResponseEntity.ok(projetService.updateProjetStatut(id, statut));
    }
}