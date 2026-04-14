package com.bea.gestion.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MaterielPageController {

    @GetMapping("/materiel")
    public String materielPage() {
        return "materiel"; // correspond à templates/materiel.html
    }
}