package com.bea.gestion.enums;

public enum StatutProjet {
    EN_COURS("Projet en cours"),
    CLOTURE("Projet clôturé"),
    NON_COMMENCE("Projet non commencé"),
    PAS_DE_VISIBILITE("Pas de visibilité");
    
    private final String value;
    
    StatutProjet(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}