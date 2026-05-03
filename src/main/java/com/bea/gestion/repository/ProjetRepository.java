package com.bea.gestion.repository;
 
import com.bea.gestion.entity.Projet;
import com.bea.gestion.enums.StatutProjet;
import com.bea.gestion.enums.TypeProjet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
 
@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {
 
    @Query("SELECT p FROM Projet p WHERE " +
           "(:nom IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%'))) AND " +
           "(:statut IS NULL OR p.statut = :statut) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:dateDebut IS NULL OR p.dateDebut >= :dateDebut)")
    Page<Projet> findByFilters(@Param("nom") String nom,
                               @Param("statut") StatutProjet statut,
                               @Param("type") TypeProjet type,
                               @Param("dateDebut") LocalDate dateDebut,
                               Pageable pageable);
 
    long countByStatut(StatutProjet statut);
 
    List<Projet> findTop5ByOrderByDateCreationDesc();
}