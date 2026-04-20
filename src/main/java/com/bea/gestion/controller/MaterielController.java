package com.bea.gestion.controller;

import com.bea.gestion.dto.CreateMaterielRequest;
import com.bea.gestion.dto.MaterielDTO;
import com.bea.gestion.service.MaterielService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiels")
public class MaterielController {

    private final MaterielService materielService;

    public MaterielController(MaterielService materielService) {
        this.materielService = materielService;
    }

    @GetMapping
    public ResponseEntity<List<MaterielDTO>> getAll() {
        return ResponseEntity.ok(materielService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterielDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(materielService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MaterielDTO> create(@RequestBody CreateMaterielRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materielService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterielDTO> update(@PathVariable Long id,
                                               @RequestBody CreateMaterielRequest req) {
        return ResponseEntity.ok(materielService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materielService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
