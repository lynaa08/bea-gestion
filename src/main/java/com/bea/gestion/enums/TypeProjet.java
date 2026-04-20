package com.bea.gestion.enums;

public enum TypeProjet {
    INTERNE("Interne"),
    EXTERNE("Externe");
    
    private final String value;
    
    TypeProjet(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}