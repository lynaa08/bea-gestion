package com.bea.gestion.repository;


import com.bea.gestion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bea.gestion.entity.Role;
import java.util.List;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMatricule(String matricule);
    Optional<User> findByEmail(String email);
    boolean existsByMatricule(String matricule);

    // Nouveau : liste des users par rôle (ex: tous les DEVELOPPEUR)
    List<User> findByRole(Role role);
}