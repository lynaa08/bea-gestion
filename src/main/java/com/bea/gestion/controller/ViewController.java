package com.bea.gestion.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }
    
    // HTML pages - use different URLs than REST APIs
    @GetMapping("/users-list")
    public String usersList() {
        return "users";
    }
    
    @GetMapping("/projets-list")
    public String projetsList() {
        return "projet-list";
    }
    
    @GetMapping("/users/new")
    public String newUser() {
        return "user-form";
    }
    
    @GetMapping("/users/edit/{id}")
    public String editUser() {
        return "user-form";
    }
    
    @GetMapping("/projets/new")
    public String newProjet() {
        return "projet-form";
    }
    
    @GetMapping("/projets/edit/{id}")
    public String editProjet() {
        return "projet-form";
    }
    
    @GetMapping("/")
    public String home() {
        return "redirect:/login";
    }
     @GetMapping("/agenda")
    public String agenda() {
        return "agenda";
    }

}