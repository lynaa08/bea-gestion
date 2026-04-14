package com.bea.gestion.service;

import com.bea.gestion.entity.Materiel;
import com.bea.gestion.repository.MaterielRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterielService {

    private final MaterielRepository materielRepository;

    public MaterielService(MaterielRepository materielRepository) {
        this.materielRepository = materielRepository;
    }

    public Materiel create(Materiel materiel) {
        return materielRepository.save(materiel);
    }

    public List<Materiel> getAll() {
        return materielRepository.findAll();
    }
}
