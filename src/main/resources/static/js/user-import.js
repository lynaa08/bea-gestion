// static/js/user-import.js
// ✅ Gestion de l'import Excel côté navigateur

let _currentFile = null;
let _previewRows = [];

// ── Changer d'onglet ─────────────────────────────────────────────────────────
function switchTab(tab) {
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
const uploadZone = document.getElementById("uploadZone");
if (uploadZone) {
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });
}

// ── Sélection du fichier ──────────────────────────────────────────────────────
async function handleFileSelect(file) {
  if (!file) return;
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    showExcelMsg("error", "❌ Format invalide. Utilisez un fichier .xlsx");
    return;
  }

  _currentFile = file;
  showExcelMsg(
    "info",
    `<span class='loading'></span> Analyse de <strong>${file.name}</strong>...`,
  );
  document.getElementById("previewSection").style.display = "none";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/users/import/preview", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      showExcelMsg("error", "❌ " + (err.error || "Erreur serveur"));
      return;
    }

    _previewRows = await res.json();
    showExcelMsg("", "");
    renderPreview(_previewRows, file.name);
  } catch (e) {
    showExcelMsg(
      "error",
      "❌ Impossible de contacter le serveur : " + e.message,
    );
  }
}

// ── Afficher le preview ───────────────────────────────────────────────────────
function renderPreview(rows, fileName) {
  const section = document.getElementById("previewSection");
  const body = document.getElementById("previewBody");
  const stats = document.getElementById("previewStats");
  const confirmBar = document.getElementById("confirmBar");
  const confirmInfo = document.getElementById("confirmInfo");

  const total = rows.length;
  const ok = rows.filter((r) => r.statut === "OK").length;
  const errors = rows.filter((r) => r.statut === "ERREUR").length;

  document.getElementById("previewTitle").textContent =
    `Aperçu — ${fileName} (${total} ligne${total > 1 ? "s" : ""})`;
  stats.textContent = `${ok} valide${ok > 1 ? "s" : ""} · ${errors} erreur${errors > 1 ? "s" : ""}`;

  const roleLabels = {
    DIRECTEUR: "Directeur",
    CHEF_DEPARTEMENT: "Chef Dept.",
    ADMIN: "Admin",
    INGENIEUR_ETUDE_PMO: "PMO",
    DEVELOPPEUR: "Développeur",
  };

  body.innerHTML = rows
    .map(
      (r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.matricule || "—"}</strong></td>
      <td>${r.nom || "—"}</td>
      <td>${r.prenom || "—"}</td>
      <td style="color:#6a8ab0">${r.email || "—"}</td>
      <td>
        ${r.role ? `<span class="badge-role">${roleLabels[r.role.toUpperCase()] || r.role}</span>` : "—"}
      </td>
      <td style="color:#8a9fbf">${r.password ? "••••••" : '<span style="color:#f39c12">BEA@2024</span>'}</td>
      <td>
        ${
          r.statut === "OK"
            ? `<span class="badge-ok">✓ OK</span>`
            : `<span class="badge-err" title="${r.erreur}">✗ Erreur</span>
               <div style="font-size:10px;color:#b00;margin-top:2px">${r.erreur || ""}</div>`
        }
      </td>
    </tr>`,
    )
    .join("");

  section.style.display = "block";

  // Barre de confirmation
  if (ok > 0) {
    confirmInfo.innerHTML = `
      <strong>${ok} utilisateur${ok > 1 ? "s" : ""}</strong> prêt${ok > 1 ? "s" : ""} à être créé${ok > 1 ? "s" : ""}
      ${errors > 0 ? `· <span style="color:#b00">${errors} ligne${errors > 1 ? "s" : ""} ignorée${errors > 1 ? "s" : ""} (erreurs)</span>` : ""}
      ${rows.some((r) => !r.password) ? `<br><small style="color:#f39c12">⚠️ Mot de passe manquant → BEA@2024 par défaut</small>` : ""}
    `;
    confirmBar.style.display = "flex";
  } else {
    confirmInfo.innerHTML = `<span style="color:#b00">Aucune ligne valide. Corrigez le fichier et réessayez.</span>`;
    confirmBar.style.display = "flex";
    document.getElementById("btnConfirm").disabled = true;
  }

  document.getElementById("importResult").innerHTML = "";
}

// ── Confirmer l'import ────────────────────────────────────────────────────────
async function confirmImport() {
  if (!_currentFile) return;

  const btn = document.getElementById("btnConfirm");
  btn.disabled = true;
  btn.innerHTML = `<span class="loading"></span> Création en cours...`;

  const formData = new FormData();
  formData.append("file", _currentFile);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/users/import/confirm", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      document.getElementById("importResult").innerHTML = `
        <div class="alert alert-error">❌ ${result.error || "Erreur import"}</div>`;
      btn.disabled = false;
      btn.innerHTML = "✓ Créer les utilisateurs";
      return;
    }

    // ✅ Succès
    let html = `
      <div class="alert alert-success">
        ✅ <strong>${result.success}</strong> utilisateur${result.success > 1 ? "s" : ""} créé${result.success > 1 ? "s" : ""} avec succès
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
        <button class="btn-submit" onclick="window.location.href='/users-list'">
          👥 Voir la liste des utilisateurs
        </button>
        <button class="btn-cancel" onclick="resetImport()">
          ↺ Importer un autre fichier
        </button>
      </div>`;

    document.getElementById("importResult").innerHTML = html;
    document.getElementById("confirmBar").style.display = "none";
  } catch (e) {
    document.getElementById("importResult").innerHTML = `
      <div class="alert alert-error">❌ Erreur réseau : ${e.message}</div>`;
    btn.disabled = false;
    btn.innerHTML = "✓ Créer les utilisateurs";
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetImport() {
  _currentFile = null;
  _previewRows = [];
  document.getElementById("excelFile").value = "";
  document.getElementById("previewSection").style.display = "none";
  document.getElementById("excelMessage").innerHTML = "";
  document.getElementById("importResult").innerHTML = "";
  document.getElementById("previewBody").innerHTML = "";
  const btn = document.getElementById("btnConfirm");
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = "✓ Créer les utilisateurs";
  }
}

// ── Télécharger le modèle Excel ───────────────────────────────────────────────
function downloadTemplate() {
  // Génère un CSV avec le bon séparateur que l'utilisateur peut ouvrir avec Excel
  const headers = [
    "matricule",
    "nom",
    "prenom",
    "email",
    "telephone",
    "role",
    "password",
  ];
  const example = [
    [
      "DEV001",
      "Dupont",
      "Jean",
      "jean.dupont@bea.dz",
      "0555123456",
      "DEVELOPPEUR",
      "MonPass123",
    ],
    [
      "PMO001",
      "Martin",
      "Sophie",
      "sophie.martin@bea.dz",
      "0555654321",
      "INGENIEUR_ETUDE_PMO",
      "MonPass456",
    ],
    [
      "CDEP001",
      "Benali",
      "Karim",
      "karim.benali@bea.dz",
      "",
      "CHEF_DEPARTEMENT",
      "",
    ],
  ];

  // Construire CSV
  const rows = [headers, ...example];
  const csv = rows.map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM pour Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_import_utilisateurs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helper message ────────────────────────────────────────────────────────────
function showExcelMsg(type, msg) {
  const el = document.getElementById("excelMessage");
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
