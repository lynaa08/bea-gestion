package com.bea.gestion.repository;

import com.bea.gestion.entity.Remarque;
import com.bea.gestion.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RemarqueRepository extends JpaRepository<Remarque, Long> {
    List<Remarque> findByProjetOrderByDateCreationDesc(Projet projet);
}
