package com.bea.gestion.controller;

import com.bea.gestion.service.ExcelImportService;
import com.bea.gestion.service.ExcelImportService.ImportResult;
import com.bea.gestion.service.ExcelImportService.PreviewRow;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/import")
public class UserImportController {

    private final ExcelImportService excelImportService;

    public UserImportController(ExcelImportService excelImportService) {
        this.excelImportService = excelImportService;
    }

    // ── POST /api/users/import/preview ────────────────────────────────────────
    // Retourne un aperçu des lignes sans les créer
    @PostMapping("/preview")
    public ResponseEntity<?> previewImport(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Fichier vide"));
        }
        if (!isExcelFile(file)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Format invalide. Utilisez .xlsx ou .xls"));
        }
        try {
            List<PreviewRow> rows = excelImportService.previewExcel(file);
            return ResponseEntity.ok(rows);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lecture fichier : " + e.getMessage()));
        }
    }

    // ── POST /api/users/import/confirm ────────────────────────────────────────
    // Confirme et crée tous les utilisateurs valides
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmImport(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || !isExcelFile(file)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Fichier invalide"));
        }
        try {
            ImportResult result = excelImportService.importExcel(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur import : " + e.getMessage()));
        }
    }

    private boolean isExcelFile(MultipartFile file) {
        String name = file.getOriginalFilename();
        return name != null && (name.endsWith(".xlsx") || name.endsWith(".xls"));
    }
}
