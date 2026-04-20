package com.bea.gestion.repository;

import com.bea.gestion.entity.Probleme;
import com.bea.gestion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProblemeRepository extends JpaRepository<Probleme, Long> {
    List<Probleme> findByDeclarantOrderByDateCreationDesc(User declarant);
    List<Probleme> findAllByOrderByDateCreationDesc();
}
