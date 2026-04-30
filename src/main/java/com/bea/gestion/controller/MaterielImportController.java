package com.bea.gestion.controller;

import com.bea.gestion.service.ExcelMaterielImportService;
import com.bea.gestion.service.ExcelMaterielImportService.ImportResult;
import com.bea.gestion.service.ExcelMaterielImportService.PreviewRow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materiels/import")
public class MaterielImportController {

    private final ExcelMaterielImportService importService;

    public MaterielImportController(ExcelMaterielImportService importService) {
        this.importService = importService;
    }

    // POST /api/materiels/import/preview
    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return badRequest("Fichier vide");
        if (!isExcel(file))  return badRequest("Format invalide. Utilisez .xlsx");
        try {
            List<PreviewRow> rows = importService.previewExcel(file);
            return ResponseEntity.ok(rows);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur lecture : " + e.getMessage()));
        }
    }

    // POST /api/materiels/import/confirm
    @PostMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || !isExcel(file)) return badRequest("Fichier invalide");
        try {
            ImportResult result = importService.importExcel(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur import : " + e.getMessage()));
        }
    }

    private boolean isExcel(MultipartFile f) {
        String n = f.getOriginalFilename();
        return n != null && (n.endsWith(".xlsx") || n.endsWith(".xls"));
    }

    private ResponseEntity<?> badRequest(String msg) {
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }
}