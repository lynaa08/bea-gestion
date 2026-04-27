package com.bea.gestion.service;

import com.bea.gestion.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Envoyer une notification push via Expo Push API.
     * Appelé automatiquement lors de la création d'une tâche.
     */
    public void sendPushNotification(User user, String title, String body, Map<String, Object> data) {
        if (user == null || user.getPushToken() == null || user.getPushToken().isBlank()) {
            System.out.println("⚠️ Pas de push token pour " + (user != null ? user.getMatricule() : "null"));
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", user.getPushToken());
            payload.put("title", title);
            payload.put("body", body);
            payload.put("sound", "default");
            payload.put("priority", "high");
            payload.put("channelId", "bea-tasks");
            if (data != null) payload.put("data", data);

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            System.out.println("📲 Push envoyé à " + user.getMatricule()
                    + " | Status: " + response.statusCode());

        } catch (Exception e) {
            System.err.println("❌ Erreur push notification: " + e.getMessage());
        }
    }

    /**
     * Raccourci pour notifier l'assigné d'une nouvelle tâche
     */
    public void notifyTacheAssignee(User assigne, String titreTache, String projetNom) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "TACHE_ASSIGNEE");
        data.put("screen", "Tâches");

        sendPushNotification(
            assigne,
            "📋 Nouvelle tâche assignée",
            "\"" + titreTache + "\" sur le projet " + projetNom,
            data
        );
    }
}
