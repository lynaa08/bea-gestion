package com.bea.gestion.enums;

public enum EtatMateriel {
    NEUF("NEUF"),
    BON_ETAT("BON_ETAT"),
    USAGE("USAGE"),
    EN_PANNE("EN_PANNE");
    
    private final String value;
    
    EtatMateriel(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}