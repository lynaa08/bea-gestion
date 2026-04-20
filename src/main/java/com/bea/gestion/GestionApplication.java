package com.bea.gestion;

 import org.springframework.boot.SpringApplication;
 import org.springframework.boot.autoconfigure.SpringBootApplication;

 @SpringBootApplication
 public class GestionApplication {
    public static void main(String[] args) {
        SpringApplication.run(GestionApplication.class, args);
        System.out.println("========================================");
        System.out.println("Application started successfully!");
        System.out.println("Login at: http://localhost:8081/login");
        System.out.println("========================================");
    }
 }