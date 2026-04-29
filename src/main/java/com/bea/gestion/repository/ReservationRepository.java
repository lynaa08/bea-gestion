package com.bea.gestion.repository;

import com.bea.gestion.entity.Materiel;
import com.bea.gestion.entity.ReservationMateriel;
import com.bea.gestion.entity.ReservationMateriel.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationMateriel, Long> {

    // Toutes les réservations d'un matériel
    List<ReservationMateriel> findByMaterielOrderByScoresPrioriteDesc(Materiel materiel);

    // Réservation active d'un matériel (ACTIVE = attribué)
    Optional<ReservationMateriel> findByMaterielAndStatut(Materiel materiel, StatutReservation statut);

    // File d'attente d'un matériel, triée par score décroissant
    List<ReservationMateriel> findByMaterielAndStatutOrderByScoresPrioriteDesc(
            Materiel materiel, StatutReservation statut);

    // Réservations d'un responsable
    List<ReservationMateriel> findByResponsable_MatriculeOrderByDateCreationDesc(String matricule);

    // Vérifier si un matériel est réservé
    boolean existsByMaterielAndStatut(Materiel materiel, StatutReservation statut);
}