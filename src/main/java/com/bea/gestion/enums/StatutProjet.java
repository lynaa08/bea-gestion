package com.bea.gestion.enums;

public enum StatutProjet {
    EN_COURS("En cours"),
    EN_ATTENTE("En attente"),
    TERMINE("Terminé");
    
    private final String value;
    
    StatutProjet(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}