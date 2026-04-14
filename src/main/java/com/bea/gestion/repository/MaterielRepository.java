package com.bea.gestion.repository;

import com.bea.gestion.entity.Materiel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface MaterielRepository extends JpaRepository<Materiel, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO materiel (nom, service, bureau, type, marque, quantite, etat) " +
            "VALUES (:nom, :service, :bureau, :type, :marque, :quantite, :etat)", nativeQuery = true)
    void insererSansId(@Param("nom") String nom,
            @Param("service") String service,
            @Param("bureau") String bureau,
            @Param("type") String type,
            @Param("marque") String marque,
            @Param("quantite") Integer quantite,
            @Param("etat") String etat);
}