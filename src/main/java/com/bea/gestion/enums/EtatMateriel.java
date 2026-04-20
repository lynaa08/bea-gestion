package com.bea.gestion.enums;

public enum EtatMateriel {
    NEUF("Neuf"),
    BON_ETAT("Bon état"),
    USAGE("Usagé"),
    EN_PANNE("En panne");

    private final String value;

    EtatMateriel(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
