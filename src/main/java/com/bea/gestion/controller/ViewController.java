package com.bea.gestion.controller;
 
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
 
@Controller
public class ViewController {
 
    @GetMapping("/")
    public String home() { return "redirect:/login"; }
 
    @GetMapping("/login")
    public String login() { return "login"; }
 
    @GetMapping("/dashboard")
    public String dashboard() { return "dashboard"; }
 
    @GetMapping("/users-list")
    public String usersList() { return "users"; }
 
    @GetMapping("/projets-list")
    public String projetsList() { return "projet-list"; }
 
    @GetMapping("/users/new")
    public String newUser() { return "user-form"; }
 
    @GetMapping("/users/edit/{id}")
    public String editUser() { return "user-form"; }
 
    @GetMapping("/projets/new")
    public String newProjet() { return "projet-form"; }
 
    @GetMapping("/projets/edit/{id}")
    public String editProjet() { return "projet-form"; }
 
    @GetMapping("/agenda")
    public String agenda() { return "agenda"; }
 
    @GetMapping("/problemes")
    public String problemes() { return "problemes"; }
 
    @GetMapping("/remarques")
    public String remarques() { return "remarques"; }
 
    @GetMapping("/materiels-list")
    public String materielsList() { return "materiel-list"; }
 
    @GetMapping("/materiels/new")
    public String newMateriel() { return "materiel-form"; }
 
    @GetMapping("/materiels/edit/{id}")
    public String editMateriel() { return "materiel-form"; }
 
    @GetMapping("/reservations-list")
    public String reservationsList() { return "reservations-list"; }
 
    @GetMapping("/taches")
    public String tachesList() { return "tache-list"; }
 
    @GetMapping("/taches/{id}")
    public String tacheDetail(@PathVariable Long id) { return "tache-detail"; }
 
    // ✅ Page Mes Tâches — uniquement pour les DEVELOPPEURS
    // Affiche les tâches assignées à l'utilisateur connecté
    // groupées par projet, consultation + validation uniquement
    @GetMapping("/mes-taches")
    public String mesTaches() { return "mes-taches"; }
}