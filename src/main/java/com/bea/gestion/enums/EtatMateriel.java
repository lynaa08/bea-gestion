package com.bea.gestion.enums;

public class EtatMateriel {
    public static final String NEUF = "Neuf";
    public static final String BON_ETAT = "Bon état";
    public static final String USAGE = "Usage";
    public static final String EN_PANNE = "En panne";
    private final String value;

    EtatMateriel(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static String valueOf(String upperCase) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'valueOf'");
    }

}
