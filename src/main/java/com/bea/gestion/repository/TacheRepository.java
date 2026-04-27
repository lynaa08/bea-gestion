package com.bea.gestion.repository;

import com.bea.gestion.entity.Tache;
import com.bea.gestion.entity.User;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.enums.StatutTache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {

    // Toutes les tâches d'un projet
    List<Tache> findByProjetOrderByDateCreationDesc(Projet projet);

    // Tâches assignées à un développeur
    List<Tache> findByAssigneOrderByDateCreationDesc(User assigne);

    // Tâches d'un projet par statut
    List<Tache> findByProjetAndStatut(Projet projet, StatutTache statut);

    // Tâches assignées à un dev par statut
    List<Tache> findByAssigneAndStatut(User assigne, StatutTache statut);

    // Tâches créées par un user (PMO / Chef)
    List<Tache> findByCreeParOrderByDateCreationDesc(User creePar);

    // Compter les tâches d'un projet par statut
    long countByProjetAndStatut(Projet projet, StatutTache statut);
}