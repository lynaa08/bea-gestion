package com.bea.gestion.controller;

import com.bea.gestion.service.StatistiquesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final StatistiquesService statistiquesService;

    public DashboardController(StatistiquesService statistiquesService) {
        this.statistiquesService = statistiquesService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getProjetStats() {
        return ResponseEntity.ok(statistiquesService.getProjetStats());
    }

    @GetMapping("/stats/by-type")
    public ResponseEntity<Map<String, Map<String, Long>>> getStatsByType() {
        return ResponseEntity.ok(statistiquesService.getStatsByType());
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentProjets(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statistiquesService.getRecentProjets(limit));
    }
}
