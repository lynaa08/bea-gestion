package com.bea.gestion.repository;

import com.bea.gestion.entity.Materiel;
import com.bea.gestion.entity.ReservationMateriel;
import com.bea.gestion.entity.ReservationMateriel.StatutReservation;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationMateriel, Long> {

    // Toutes les réservations d'un matériel (triées par priorité)
    List<ReservationMateriel> findByMaterielOrderByNiveauPrioriteAsc(Materiel materiel);

    // Réservation unique d'un matériel par statut (ex: trouver la réservation ACTIVE)
    Optional<ReservationMateriel> findByMaterielAndStatut(Materiel materiel, StatutReservation statut);

    // Plusieurs réservations d'un matériel par statut (ex: file EN_ATTENTE)
    List<ReservationMateriel> findAllByMaterielAndStatut(Materiel materiel, StatutReservation statut);

    // Réservations d'un matériel par statut avec tri dynamique
    List<ReservationMateriel> findAllByMaterielAndStatut(Materiel materiel, StatutReservation statut, Sort sort);

    // Réservations d'un responsable (triées par date de création)
    List<ReservationMateriel> findByResponsable_MatriculeOrderByDateCreationDesc(String matricule);

    // Vérifier si un matériel est actuellement réservé
    boolean existsByMaterielAndStatut(Materiel materiel, StatutReservation statut);
}