package com.bea.gestion.dto;

public class UpdateTachesStatutRequest {

    private String statut;       // A_FAIRE | EN_COURS | TERMINEE | BLOQUEE
    private String commentaire;  // optionnel (remarque de clôture)

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
}