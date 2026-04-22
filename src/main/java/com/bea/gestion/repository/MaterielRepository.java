package com.bea.gestion.repository;

import com.bea.gestion.entity.Materiel;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.enums.EtatMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterielRepository extends JpaRepository<Materiel, Long> {
    List<Materiel> findByProjet(Projet projet);
    List<Materiel> findByStatut(EtatMateriel statut);
    long countByStatut(EtatMateriel statut);
}
