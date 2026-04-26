package com.bea.gestion.repository;

import com.bea.gestion.entity.SousTache;
import com.bea.gestion.entity.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SousTacheRepository extends JpaRepository<SousTache, Long> {
    List<SousTache> findByTacheOrderByDateCreationAsc(Tache tache);
    long countByTacheAndFaite(Tache tache, boolean faite);
}
