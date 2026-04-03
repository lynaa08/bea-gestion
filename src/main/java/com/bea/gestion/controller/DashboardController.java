package com.bea.gestion.controller;

import com.bea.gestion.service.StatistiquesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final StatistiquesService statistiquesService;
    
    public DashboardController(StatistiquesService statistiquesService) {
        this.statistiquesService = statistiquesService;
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
    public ResponseEntity<Map<String, Long>> getProjetStats() {
        return ResponseEntity.ok(statistiquesService.getProjetStats());
    }
    
    @GetMapping("/stats/by-type")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
    public ResponseEntity<Map<String, Map<String, Long>>> getStatsByType() {
        return ResponseEntity.ok(statistiquesService.getStatsByType());
    }
    
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'CONSULTANT')")
    public ResponseEntity<?> getRecentProjects(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statistiquesService.getRecentProjects(limit));
    }
}