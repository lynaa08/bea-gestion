package com.bea.gestion.enums;

public enum StatutMateriel {
    DISPONIBLE("Disponible"),
    EN_UTILISATION("En utilisation"),
    EN_REPARATION("En réparation"),
    HORS_SERVICE("Hors service");
    
    private final String value;
    
    StatutMateriel(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}