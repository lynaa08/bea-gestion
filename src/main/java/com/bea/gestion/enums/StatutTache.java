package com.bea.gestion.enums;

public enum StatutTache {
    A_FAIRE("À faire"),
    EN_COURS("En cours"),
    TERMINEE("Terminée"),
    BLOQUEE("Bloquée");

    private final String label;

    StatutTache(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}