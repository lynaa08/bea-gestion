package com.bea.gestion.service;

import com.bea.gestion.entity.Notification;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.User;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    // ─── Save in-app notification (toujours) ─────────────────────────────────
    private void save(User user, String titre, String message, String type,
                      Long projetId, String projetNom) {
        if (user == null) return;
        Notification n = new Notification();
        n.setUser(user);
        n.setTitre(titre);
        n.setMessage(message);
        n.setType(type);
        n.setProjetId(projetId);
        n.setProjetNom(projetNom);
        n.setDateCreation(LocalDateTime.now());
        n.setLue(false);
        notificationRepository.save(n);
    }

    // ─── Envoyer email si email présent ──────────────────────────────────────
    private void sendEmail(User user, String subject, String html) {
        try {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendHtml(user.getEmail(), subject, html);
            }
        } catch (Exception e) {
            // Email non bloquant - on continue même si l'envoi échoue
            System.err.println("⚠️ Email non envoyé à " + user.getEmail() + " : " + e.getMessage());
        }
    }

    // ─── Notifications projet ────────────────────────────────────────────────

    public void notifyProjetCreated(Projet projet) {
        if (projet.getChefProjet() == null) return;
        User chef = projet.getChefProjet();

        save(chef,
             "Nouveau projet assigné",
             "Le projet \"" + projet.getNom() + "\" vous a été assigné.",
             "PROJET_CREE", projet.getId(), projet.getNom());

        String subject = "[BEA] Nouveau projet : " + projet.getNom();
        String html = buildHtml("Nouveau projet assigné",
            "Bonjour " + chef.getPrenom() + " " + chef.getNom() + ",",
            "Un nouveau projet vous a été assigné.",
            new String[][]{
                {"Nom", projet.getNom()},
                {"Type", str(projet.getType())},
                {"Priorité", str(projet.getPriorite())},
                {"Statut", str(projet.getStatut())},
                {"Date début", str(projet.getDateDebut())},
                {"Deadline", str(projet.getDeadline())}
            },
            "Connectez-vous à la plateforme BEA pour consulter les détails.");
        sendEmail(chef, subject, html);
    }

    public void notifyStatutChanged(Projet projet, StatutProjet ancienStatut) {
        if (projet.getChefProjet() == null) return;
        User chef = projet.getChefProjet();

        save(chef,
             "Statut modifié : " + projet.getNom(),
             "Statut passé de " + ancienStatut + " → " + projet.getStatut(),
             "PROJET_MODIFIE", projet.getId(), projet.getNom());

        String subject = "[BEA] Statut modifié : " + projet.getNom();
        String html = buildHtml("Statut de projet modifié",
            "Bonjour " + chef.getPrenom() + " " + chef.getNom() + ",",
            "Le statut du projet <strong>" + projet.getNom() + "</strong> a été mis à jour.",
            new String[][]{
                {"Ancien statut", str(ancienStatut)},
                {"Nouveau statut", str(projet.getStatut())}
            },
            "Connectez-vous à la plateforme BEA pour plus de détails.");
        sendEmail(chef, subject, html);
    }

    public void notifyUserCreated(User user, String plainPassword) {
        save(user,
             "Bienvenue sur la plateforme BEA",
             "Votre compte a été créé. Matricule : " + user.getMatricule(),
             "USER_CREE", null, null);

        String subject = "[BEA] Bienvenue sur la plateforme de gestion";
        String html = buildHtml("Votre compte a été créé",
            "Bonjour " + user.getPrenom() + " " + user.getNom() + ",",
            "Votre compte sur la plateforme BEA a été créé avec succès.",
            new String[][]{
                {"Matricule", user.getMatricule()},
                {"Mot de passe", plainPassword},
                {"Rôle", str(user.getRole())}
            },
            "Veuillez changer votre mot de passe après votre première connexion.");
        sendEmail(user, subject, html);
    }

    public void notifyProblemeDeclare(User pmo, String titreProbleme,
                                      String declarantNom, Long projetId, String projetNom) {
        save(pmo,
             "⚠️ Nouveau problème signalé",
             declarantNom + " a signalé : " + titreProbleme,
             "PROBLEME_SIGNALE", projetId, projetNom);
    }

    // ─── Requêtes ────────────────────────────────────────────────────────────

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByDateCreationDesc(user);
    }

    public long countUnread(User user) {
        return notificationRepository.countByUserAndLueFalse(user);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLue(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user);
    }

    // ─── Builder HTML email ───────────────────────────────────────────────────

    private String buildHtml(String title, String greeting, String intro,
                             String[][] fields, String footer) {
        StringBuilder rows = new StringBuilder();
        for (String[] f : fields) {
            rows.append("<tr>")
                .append("<td style='padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;'>").append(f[0]).append("</td>")
                .append("<td style='padding:6px 12px;color:#222;'>").append(f[1]).append("</td>")
                .append("</tr>");
        }
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='padding:32px 0;'><tr><td align='center'>"
            + "<table width='580' cellpadding='0' cellspacing='0' style='background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);'>"
            + "<tr><td style='background:#1a3c6e;padding:24px 32px;'><h2 style='margin:0;color:#fff;font-size:20px;'>BEA – " + title + "</h2></td></tr>"
            + "<tr><td style='padding:32px;'>"
            + "<p style='margin:0 0 16px;font-size:15px;color:#333;'>" + greeting + "</p>"
            + "<p style='margin:0 0 24px;font-size:15px;color:#333;'>" + intro + "</p>"
            + "<table cellpadding='0' cellspacing='0' style='background:#f8f9fb;border-radius:6px;padding:8px 0;width:100%;'>" + rows + "</table>"
            + "<p style='margin:24px 0 0;font-size:13px;color:#888;'>" + footer + "</p>"
            + "</td></tr>"
            + "<tr><td style='background:#f0f0f0;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;'>"
            + "© BEA – Banque Extérieure d'Algérie</td></tr>"
            + "</table></td></tr></table></body></html>";
    }

    private String str(Object o) { return o == null ? "—" : o.toString(); }
}
