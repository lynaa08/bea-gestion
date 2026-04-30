package com.bea.gestion.service;

import com.bea.gestion.dto.CreateMaterielRequest;
import com.bea.gestion.dto.MaterielDTO;
import com.bea.gestion.enums.EtatMateriel;
import com.bea.gestion.enums.StatutMateriel;
import com.bea.gestion.service.MaterielService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelMaterielImportService {

    private final MaterielService materielService;

    // Excel columns order:
    // 0=nom | 1=reference | 2=bureau | 3=service | 4=etat | 5=statut
    // 6=quantite | 7=licence | 8=dateLicence | 9=dateExpiration | 10=description
    private static final String[] HEADERS = {
        "nom", "reference", "bureau", "service", "etat", "statut",
        "quantite", "licence", "dateLicence", "dateExpiration", "description"
    };

    public ExcelMaterielImportService(MaterielService materielService) {
        this.materielService = materielService;
    }

    // ── Preview (validate without saving) ────────────────────────────────────
    public static class PreviewRow {
        public String nom;
        public String reference;
        public String bureau;
        public String service;
        public String etat;
        public String statut;
        public String quantite;
        public String licence;
        public String dateLicence;
        public String dateExpiration;
        public String description;
        public String rowStatut; // "OK" | "ERREUR"
        public String erreur;
    }

    public static class ImportResult {
        public int total;
        public int success;
        public int skipped;
        public List<String> errors = new ArrayList<>();
        public List<MaterielDTO> created = new ArrayList<>();
    }

    public List<PreviewRow> previewExcel(MultipartFile file) throws IOException {
        List<PreviewRow> rows = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                PreviewRow pr = new PreviewRow();
                pr.nom           = getCellString(row, 0);
                pr.reference     = getCellString(row, 1);
                pr.bureau        = getCellString(row, 2);
                pr.service       = getCellString(row, 3);
                pr.etat          = getCellString(row, 4);
                pr.statut        = getCellString(row, 5);
                pr.quantite      = getCellString(row, 6);
                pr.licence       = getCellString(row, 7);
                pr.dateLicence   = getCellString(row, 8);
                pr.dateExpiration= getCellString(row, 9);
                pr.description   = getCellString(row, 10);

                List<String> errs = validateRow(pr);
                pr.rowStatut = errs.isEmpty() ? "OK" : "ERREUR";
                pr.erreur    = String.join(", ", errs);
                rows.add(pr);
            }
        }
        return rows;
    }

    public ImportResult importExcel(MultipartFile file) throws IOException {
        ImportResult result = new ImportResult();
        try (InputStream is = file.getInputStream();
             Workbook wb = new XSSFWorkbook(is)) {

            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;
                result.total++;

                String nom           = getCellString(row, 0);
                String reference     = getCellString(row, 1);
                String bureau        = getCellString(row, 2);
                String service       = getCellString(row, 3);
                String etatStr       = getCellString(row, 4);
                String statutStr     = getCellString(row, 5);
                String quantiteStr   = getCellString(row, 6);
                String licence       = getCellString(row, 7);
                String dateLicStr    = getCellString(row, 8);
                String dateExpStr    = getCellString(row, 9);
                String description   = getCellString(row, 10);

                // Build request
                CreateMaterielRequest req = new CreateMaterielRequest();
                req.setNom(nom);
                req.setReference(reference.isEmpty() ? null : reference);
                req.setBureau(bureau.isEmpty() ? null : bureau);
                req.setService(service.isEmpty() ? null : service);
                req.setDescription(description.isEmpty() ? null : description);

                try {
                    req.setQuantite(quantiteStr.isEmpty() ? 1 : Integer.parseInt(quantiteStr));
                } catch (NumberFormatException e) {
                    req.setQuantite(1);
                }

                // Parse enums
                try {
                    req.setEtat(EtatMateriel.valueOf(etatStr.toUpperCase().replace(" ", "_")));
                } catch (IllegalArgumentException e) {
                    result.skipped++;
                    result.errors.add("Ligne " + (i + 1) + " [" + nom + "] : état invalide '" + etatStr + "'");
                    continue;
                }
                try {
                    req.setStatut(StatutMateriel.valueOf(statutStr.toUpperCase().replace(" ", "_")));
                } catch (IllegalArgumentException e) {
                    result.skipped++;
                    result.errors.add("Ligne " + (i + 1) + " [" + nom + "] : statut invalide '" + statutStr + "'");
                    continue;
                }

                // Parse dates (yyyy-MM-dd or dd/MM/yyyy)
                req.setDateLicence(parseDate(dateLicStr));
                req.setDateExpiration(parseDate(dateExpStr));

                try {
                    MaterielDTO created = materielService.create(req);
                    result.success++;
                    result.created.add(created);
                } catch (Exception e) {
                    result.skipped++;
                    result.errors.add("Ligne " + (i + 1) + " [" + nom + "] : " + e.getMessage());
                }
            }
        }
        return result;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private LocalDate parseDate(String s) {
        if (s == null || s.isEmpty()) return null;
        try {
            if (s.contains("/")) return LocalDate.parse(s, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            return LocalDate.parse(s);
        } catch (Exception e) {
            return null;
        }
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:  return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                long v = (long) cell.getNumericCellValue();
                return String.valueOf(v);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default:      return "";
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = 0; c < 11; c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private List<String> validateRow(PreviewRow pr) {
        List<String> errors = new ArrayList<>();
        if (pr.nom.isEmpty()) errors.add("Nom requis");
        if (pr.etat.isEmpty()) {
            errors.add("État requis");
        } else {
            try { EtatMateriel.valueOf(pr.etat.toUpperCase().replace(" ", "_")); }
            catch (IllegalArgumentException e) { errors.add("État invalide : " + pr.etat); }
        }
        if (pr.statut.isEmpty()) {
            errors.add("Statut requis");
        } else {
            try { StatutMateriel.valueOf(pr.statut.toUpperCase().replace(" ", "_")); }
            catch (IllegalArgumentException e) { errors.add("Statut invalide : " + pr.statut); }
        }
        return errors;
    }
}