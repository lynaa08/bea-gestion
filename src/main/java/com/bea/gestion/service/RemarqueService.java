package com.bea.gestion.service;

import com.bea.gestion.entity.Projet;
import com.bea.gestion.entity.Remarque;
import com.bea.gestion.entity.User;
import com.bea.gestion.repository.ProjetRepository;
import com.bea.gestion.repository.RemarqueRepository;
import com.bea.gestion.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RemarqueService {

    private final RemarqueRepository remarqueRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    public RemarqueService(RemarqueRepository remarqueRepository,
                           ProjetRepository projetRepository,
                           UserRepository userRepository) {
        this.remarqueRepository = remarqueRepository;
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Remarque ajouter(String matricule, Long projetId, String contenu) {
        User chef = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + matricule));
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé : " + projetId));

        if (contenu == null || contenu.isBlank()) {
            throw new RuntimeException("Le contenu de la remarque est obligatoire");
        }

        Remarque r = new Remarque();
        r.setContenu(contenu.trim());
        r.setAuteur(chef);
        r.setProjet(projet);
        r.setDateCreation(LocalDateTime.now());
        return remarqueRepository.save(r);
    }

    public List<Remarque> getByProjet(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé : " + projetId));
        return remarqueRepository.findByProjetOrderByDateCreationDesc(projet);
    }

    @Transactional
    public void supprimer(Long id) {
        remarqueRepository.deleteById(id);
    }
}
