package com.bea.gestion.controller;

import com.bea.gestion.entity.Materiel;
import com.bea.gestion.service.MaterielService;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RestController
@RequestMapping("/materiels")
public class MaterielController {

    private final MaterielService materielService;

    public MaterielController(MaterielService materielService) {
        this.materielService = materielService;
    }

    // ✅ Créer matériel
    @PostMapping
    public Materiel create(@RequestBody Materiel materiel) {
        return materielService.create(materiel);
    }

    // ✅ Voir tous les matériels
    @GetMapping
    public List<Materiel> getAll() {
        return materielService.getAll();
    }

    // afficher la page de gestion du matériel
    @GetMapping("/materiel")
    public String materielPage() {
        return "materiel"; // → templates/materiel.html
    }
}
