package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateReservationRequest;
import com.bea.gestion.dto.ReservationDTO;
import com.bea.gestion.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // POST /api/reservations → créer (toujours EN_ATTENTE)
    @PostMapping
    public ResponseEntity<ReservationDTO> creer(@RequestBody CreateReservationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.creerReservation(req));
    }

    // ✅ GET /api/reservations/all → toutes, triées par priorité (vue chef)
    @GetMapping("/all")
    public ResponseEntity<List<ReservationDTO>> getAll() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // GET /api/reservations/materiel/{id}
    @GetMapping("/materiel/{materielId}")
    public ResponseEntity<List<ReservationDTO>> getParMateriel(@PathVariable Long materielId) {
        return ResponseEntity.ok(reservationService.getReservationsParMateriel(materielId));
    }

    // GET /api/reservations/materiel/{id}/file-attente
    @GetMapping("/materiel/{materielId}/file-attente")
    public ResponseEntity<List<ReservationDTO>> getFileAttente(@PathVariable Long materielId) {
        return ResponseEntity.ok(reservationService.getFileAttente(materielId));
    }

    // GET /api/reservations/materiel/{id}/est-reserve
    @GetMapping("/materiel/{materielId}/est-reserve")
    public ResponseEntity<Map<String, Boolean>> estReserve(@PathVariable Long materielId) {
        return ResponseEntity.ok(Map.of("reserve", reservationService.estReserve(materielId)));
    }

    // ✅ PATCH /api/reservations/{id}/accepter → chef accepte → ACTIVE
    @PatchMapping("/{id}/accepter")
    public ResponseEntity<ReservationDTO> accepter(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.accepterReservation(id));
    }

    // ✅ PATCH /api/reservations/{id}/rejeter → chef rejette → ANNULEE
    @PatchMapping("/{id}/rejeter")
    public ResponseEntity<Void> rejeter(@PathVariable Long id) {
        reservationService.annulerReservation(id);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/reservations/{id}/terminer
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<Void> terminer(@PathVariable Long id) {
        reservationService.terminerReservation(id);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/reservations/{id}/annuler
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        reservationService.annulerReservation(id);
        return ResponseEntity.ok().build();
    }
}