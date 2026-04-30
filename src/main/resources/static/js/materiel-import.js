// static/js/materiel-import.js

let _currentFileMat = null;
let _previewRowsMat = [];

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTabMat(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  event.currentTarget.classList.add("active");
}

// ── Drag & drop ───────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const zone = document.getElementById("uploadZoneMat");
  if (!zone) return;
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelectMat(file);
  });
});

// ── File selected ─────────────────────────────────────────────────────────────
async function handleFileSelectMat(file) {
  if (!file) return;
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    showExcelMsgMat("error", "❌ Format invalide. Utilisez un fichier .xlsx");
    return;
  }
  _currentFileMat = file;
  showExcelMsgMat(
    "info",
    `<span class='loading'></span> Analyse de <strong>${file.name}</strong>...`,
  );
  document.getElementById("previewSectionMat").style.display = "none";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/materiels/import/preview", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      showExcelMsgMat("error", "❌ " + (err.error || "Erreur serveur"));
      return;
    }
    _previewRowsMat = await res.json();
    showExcelMsgMat("", "");
    renderPreviewMat(_previewRowsMat, file.name);
  } catch (e) {
    showExcelMsgMat(
      "error",
      "❌ Impossible de contacter le serveur : " + e.message,
    );
  }
}

// ── Render preview table ──────────────────────────────────────────────────────
function renderPreviewMat(rows, fileName) {
  const section = document.getElementById("previewSectionMat");
  const body = document.getElementById("previewBodyMat");
  const stats = document.getElementById("previewStatsMat");
  const confirmBar = document.getElementById("confirmBarMat");
  const confirmInfo = document.getElementById("confirmInfoMat");

  const total = rows.length;
  const ok = rows.filter((r) => r.rowStatut === "OK").length;
  const errors = rows.filter((r) => r.rowStatut === "ERREUR").length;

  document.getElementById("previewTitleMat").textContent =
    `Aperçu — ${fileName} (${total} ligne${total > 1 ? "s" : ""})`;
  stats.textContent = `${ok} valide${ok > 1 ? "s" : ""} · ${errors} erreur${errors > 1 ? "s" : ""}`;

  const etatLabels = {
    NEUF: "Neuf",
    BON_ETAT: "Bon état",
    USAGE: "Usagé",
    EN_PANNE: "En panne",
  };
  const statutLabels = {
    DISPONIBLE: "Disponible",
    EN_UTILISATION: "En utilisation",
    EN_REPARATION: "En réparation",
    HORS_SERVICE: "Hors service",
  };

  body.innerHTML = rows
    .map(
      (r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.nom || "—"}</strong></td>
      <td style="color:#6a8ab0">${r.reference || "—"}</td>
      <td>${r.bureau || "—"}</td>
      <td>${r.service || "—"}</td>
      <td>
        ${r.etat ? `<span class="badge-role">${etatLabels[r.etat.toUpperCase()] || r.etat}</span>` : "—"}
      </td>
      <td>
        ${r.statut ? `<span class="badge-role">${statutLabels[r.statut.toUpperCase()] || r.statut}</span>` : "—"}
      </td>
      <td style="color:#8a9fbf">${r.quantite || "1"}</td>
      <td>
        ${
          r.rowStatut === "OK"
            ? `<span class="badge-ok">✓ OK</span>`
            : `<span class="badge-err" title="${r.erreur}">✗ Erreur</span>
             <div style="font-size:10px;color:#b00;margin-top:2px">${r.erreur || ""}</div>`
        }
      </td>
    </tr>`,
    )
    .join("");

  section.style.display = "block";

  if (ok > 0) {
    confirmInfo.innerHTML = `
      <strong>${ok} matériel${ok > 1 ? "s" : ""}</strong> prêt${ok > 1 ? "s" : ""} à être créé${ok > 1 ? "s" : ""}
      ${errors > 0 ? `· <span style="color:#b00">${errors} ligne${errors > 1 ? "s" : ""} ignorée${errors > 1 ? "s" : ""} (erreurs)</span>` : ""}
    `;
    document.getElementById("btnConfirmMat").disabled = false;
  } else {
    confirmInfo.innerHTML = `<span style="color:#b00">Aucune ligne valide. Corrigez le fichier et réessayez.</span>`;
    document.getElementById("btnConfirmMat").disabled = true;
  }
  confirmBar.style.display = "flex";
  document.getElementById("importResultMat").innerHTML = "";
}

// ── Confirm import ────────────────────────────────────────────────────────────
async function confirmImportMat() {
  if (!_currentFileMat) return;
  const btn = document.getElementById("btnConfirmMat");
  btn.disabled = true;
  btn.innerHTML = `<span class="loading"></span> Création en cours...`;

  const formData = new FormData();
  formData.append("file", _currentFileMat);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/materiels/import/confirm", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    const result = await res.json();

    if (!res.ok) {
      document.getElementById("importResultMat").innerHTML =
        `<div class="alert alert-error">❌ ${result.error || "Erreur import"}</div>`;
      btn.disabled = false;
      btn.innerHTML = "✓ Créer les matériels";
      return;
    }

    let html = `
      <div class="alert alert-success">
        ✅ <strong>${result.success}</strong> matériel${result.success > 1 ? "s" : ""} créé${result.success > 1 ? "s" : ""} avec succès
        ${result.skipped > 0 ? `· <strong>${result.skipped}</strong> ignoré${result.skipped > 1 ? "s" : ""}` : ""}
      </div>`;

    if (result.errors && result.errors.length > 0) {
      html += `<div class="alert alert-error" style="margin-top:8px">
        <strong>Erreurs :</strong><br>
        ${result.errors.map((e) => `• ${e}`).join("<br>")}
      </div>`;
    }

    html += `
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn-submit" onclick="window.location.href='/materiels-list'">
          📦 Voir la liste des matériels
        </button>
        <button class="btn-cancel" onclick="resetImportMat()">
          ↺ Importer un autre fichier
        </button>
      </div>`;

    document.getElementById("importResultMat").innerHTML = html;
    document.getElementById("confirmBarMat").style.display = "none";
  } catch (e) {
    document.getElementById("importResultMat").innerHTML =
      `<div class="alert alert-error">❌ Erreur réseau : ${e.message}</div>`;
    btn.disabled = false;
    btn.innerHTML = "✓ Créer les matériels";
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetImportMat() {
  _currentFileMat = null;
  _previewRowsMat = [];
  const fi = document.getElementById("excelFileMat");
  if (fi) fi.value = "";
  document.getElementById("previewSectionMat").style.display = "none";
  document.getElementById("excelMessageMat").innerHTML = "";
  document.getElementById("importResultMat").innerHTML = "";
  document.getElementById("previewBodyMat").innerHTML = "";
  const btn = document.getElementById("btnConfirmMat");
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = "✓ Créer les matériels";
  }
}

// ── Download template CSV ─────────────────────────────────────────────────────
function downloadTemplateMat() {
  const headers = [
    "nom",
    "reference",
    "bureau",
    "service",
    "etat",
    "statut",
    "quantite",
    "licence",
    "dateLicence",
    "dateExpiration",
    "description",
  ];
  const examples = [
    [
      "Ordinateur portable",
      "Dell Latitude 5520",
      "Bureau 203",
      "DSI",
      "BON_ETAT",
      "DISPONIBLE",
      "1",
      "WIN-2024-XXXXX",
      "2024-01-15",
      "2026-01-15",
      "Core i7 16Go RAM",
    ],
    [
      "Switch réseau 24 ports",
      "Cisco SG350",
      "Salle serveur",
      "Réseau",
      "NEUF",
      "DISPONIBLE",
      "2",
      "",
      "",
      "",
      "Switch manageable",
    ],
    [
      "Imprimante laser",
      "HP LaserJet Pro",
      "Bureau 105",
      "RH",
      "USAGE",
      "EN_UTILISATION",
      "1",
      "",
      "",
      "2025-06-30",
      "",
    ],
  ];
  const rows = [headers, ...examples];
  const csv = rows.map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_import_materiels.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helper message ────────────────────────────────────────────────────────────
function showExcelMsgMat(type, msg) {
  const el = document.getElementById("excelMessageMat");
  if (!type || !msg) {
    el.innerHTML = "";
    return;
  }
  const cls =
    { error: "alert-error", info: "alert-info", success: "alert-success" }[
      type
    ] || "alert-info";
  el.innerHTML = `<div class="alert ${cls}" style="margin-top:12px">${msg}</div>`;
}
