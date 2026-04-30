package com.bea.gestion.service;

import com.bea.gestion.dto.CreateMaterielRequest;
import com.bea.gestion.dto.MaterielDTO;
import com.bea.gestion.entity.Materiel;
import com.bea.gestion.entity.Projet;
import com.bea.gestion.exception.ResourceNotFoundException;
import com.bea.gestion.mapper.MaterielMapper;
import com.bea.gestion.repository.MaterielRepository;
import com.bea.gestion.repository.ProjetRepository;
import com.bea.gestion.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterielService {

    private final MaterielRepository materielRepository;
    private final MaterielMapper materielMapper;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;

    public MaterielService(MaterielRepository materielRepository,
                           MaterielMapper materielMapper,
                           ProjetRepository projetRepository,
                           UserRepository userRepository) {
        this.materielRepository = materielRepository;
        this.materielMapper = materielMapper;
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
    }

    public List<MaterielDTO> getAll() {
        return materielRepository.findAll()
            .stream().map(materielMapper::toDTO).collect(Collectors.toList());
    }

    public MaterielDTO getById(Long id) {
        return materielMapper.toDTO(materielRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Matériel non trouvé")));
    }

    public MaterielDTO create(CreateMaterielRequest req) {
        Materiel m = new Materiel();
        fillFromRequest(m, req);
        return materielMapper.toDTO(materielRepository.save(m));
    }

    public MaterielDTO update(Long id, CreateMaterielRequest req) {
        Materiel m = materielRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Matériel non trouvé"));
        fillFromRequest(m, req);
        return materielMapper.toDTO(materielRepository.save(m));
    }

    public void delete(Long id) {
        materielRepository.deleteById(id);
    }

    private void fillFromRequest(Materiel m, CreateMaterielRequest req) {
        m.setNom(req.getNom());
        // ✅ Support both "marque" and "reference" field names from the form
        m.setMarque(req.getMarque());
        m.setBureau(req.getBureau());
        m.setService(req.getService());
        m.setDescription(req.getDescription());
        m.setQuantite(req.getQuantite());
        m.setEtat(req.getEtat());

        // ✅ FIXED: statut was never set — the form's statut dropdown was ignored
        m.setStatut(req.getStatut());

        // ✅ FIXED: these no longer throw UnsupportedOperationException
        m.setDateLicence(req.getDateLicence());
        m.setDateExpiration(req.getDateExpiration());

        // Optional: link to a project if provided
        if (req.getProjetId() != null) {
            projetRepository.findById(req.getProjetId())
                .ifPresent(m::setProjet);
        } else {
            m.setProjet(null);
        }
    }
}