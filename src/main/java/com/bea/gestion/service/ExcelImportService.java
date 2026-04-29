package com.bea.gestion.service;

import com.bea.gestion.dto.CreateUserRequest;
import com.bea.gestion.dto.UserDTO;
import com.bea.gestion.entity.Role;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class ExcelImportService {

    private final UserService userService;

    public ExcelImportService(UserService userService) {
        this.userService = userService;
    }

    // ─── Résultat de l'import ────────────────────────────────────────────────
    public static class ImportResult {
        public int total;
        public int success;
        public int skipped;
        public List<String> errors = new ArrayList<>();
        public List<UserDTO> created = new ArrayList<>();
    }

    // ─── Résultat de la preview ───────────────────────────────────────────────
    public static class PreviewRow {
        public String matricule;
        public String nom;
        public String prenom;
        public String email;
        public String telephone;
        public String role;
        public String password;
        public String statut; // "OK" | "ERREUR"
        public String erreur;
    }

    // ─── Lire et valider le fichier Excel sans créer ──────────────────────────
    public List<PreviewRow> previewExcel(MultipartFile file) throws IOException {
        List<PreviewRow> rows = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            // Ligne 0 = en-tête → on commence à 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                PreviewRow pr = new PreviewRow();
                pr.matricule  = getCellString(row, 0);
                pr.nom        = getCellString(row, 1);
                pr.prenom     = getCellString(row, 2);
                pr.email      = getCellString(row, 3);
                pr.telephone  = getCellString(row, 4);
                pr.role       = getCellString(row, 5);
                pr.password   = getCellString(row, 6);

                // Validation
                List<String> errs = validateRow(pr);
                if (errs.isEmpty()) {
                    pr.statut = "OK";
                } else {
                    pr.statut = "ERREUR";
                    pr.erreur = String.join(", ", errs);
                }
                rows.add(pr);
            }
        }
        return rows;
    }

    // ─── Importer le fichier Excel et créer les users ─────────────────────────
    public ImportResult importExcel(MultipartFile file) throws IOException {
        ImportResult result = new ImportResult();

        try (InputStream is = file.getInputStream();
             Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                result.total++;
                String matricule = getCellString(row, 0);
                String nom       = getCellString(row, 1);
                String prenom    = getCellString(row, 2);
                String email     = getCellString(row, 3);
                String telephone = getCellString(row, 4);
                String roleStr   = getCellString(row, 5);
                String password  = getCellString(row, 6);

                // Construire le request
                CreateUserRequest req = new CreateUserRequest();
                req.setMatricule(matricule);
                req.setNom(nom);
                req.setPrenom(prenom);
                req.setEmail(email.isEmpty() ? null : email);
                req.setTelephone(telephone.isEmpty() ? null : telephone);
                req.setPassword(password.isEmpty() ? "BEA@2024" : password); // mot de passe par défaut

                // Convertir le rôle
                try {
                    req.setRole(Role.valueOf(roleStr.toUpperCase().replace(" ", "_")));
                } catch (IllegalArgumentException e) {
                    result.skipped++;
                    result.errors.add("Ligne " + (i + 1) + " [" + matricule + "] : rôle invalide '" + roleStr + "'");
                    continue;
                }

                // Créer l'utilisateur
                try {
                    UserDTO created = userService.createUser(req);
                    result.success++;
                    result.created.add(created);
                } catch (Exception e) {
                    result.skipped++;
                    result.errors.add("Ligne " + (i + 1) + " [" + matricule + "] : " + e.getMessage());
                }
            }
        }
        return result;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:  return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default:      return "";
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = 0; c < 7; c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private List<String> validateRow(PreviewRow pr) {
        List<String> errors = new ArrayList<>();
        if (pr.matricule.isEmpty()) errors.add("Matricule requis");
        if (pr.nom.isEmpty())       errors.add("Nom requis");
        if (pr.prenom.isEmpty())    errors.add("Prénom requis");
        if (pr.role.isEmpty())      errors.add("Rôle requis");
        else {
            try {
                Role.valueOf(pr.role.toUpperCase().replace(" ", "_"));
            } catch (IllegalArgumentException e) {
                errors.add("Rôle invalide : " + pr.role);
            }
        }
        return errors;
    }
}
