const API_BASE = "/api";
 
// ---- Statut maps (nouveaux états) ----
const STATUT_LABEL = {
  EN_COURS: "Projet en cours",
  CLOTURE: "Projet clôturé",
  NON_COMMENCE: "Projet non commencé",
  PAS_DE_VISIBILITE: "Pas de visibilité",
  // Legacy fallback
  EN_ATTENTE: "En attente",
  TERMINE: "Terminé",
};
const STATUT_COLOR = {
  EN_COURS: "#5bb8e8",
  CLOTURE: "#22c55e",
  NON_COMMENCE: "#f59e0b",
  PAS_DE_VISIBILITE: "#8a9fbf",
  EN_ATTENTE: "#f59e0b",
  TERMINE: "#22c55e",
};
 
// ---- Multi-select state ----
let allUsers = [];
let selectedMembresIds = new Set();
 
async function loadUsersForSelects() {
  try {
    const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    allUsers = await res.json();
    renderMembresDropdown();
  } catch (e) {}
}
 
function renderMembresDropdown(filter = "") {
  const dd = document.getElementById("membresDropdown");
  if (!dd) return;
  const q = filter.toLowerCase();
  const filtered = allUsers.filter(
    (u) =>
      (u.matricule || "").toLowerCase().includes(q) ||
      ((u.prenom || "") + " " + (u.nom || "")).toLowerCase().includes(q),
  );
  if (filtered.length === 0) {
    dd.innerHTML =
      '<div style="padding:12px;color:#b0bdd0;font-size:12px;text-align:center">Aucun utilisateur trouvé</div>';
    return;
  }
  dd.innerHTML = filtered
    .map((u) => {
      const isSel = selectedMembresIds.has(u.id);
      return `<div class="multi-select-opt ${isSel ? "selected" : ""}" onclick="toggleMembre(${u.id})">
        <span class="multi-select-opt-mat">${u.matricule || ""}</span>
        <span class="multi-select-opt-name">${u.prenom || ""} ${u.nom || ""}</span>
        ${isSel ? '<span style="margin-left:auto;color:#5bb8e8;font-weight:700">✓</span>' : ""}
      </div>`;
    })
    .join("");
}
 
function toggleMembre(userId) {
  if (selectedMembresIds.has(userId)) {
    selectedMembresIds.delete(userId);
  } else {
    selectedMembresIds.add(userId);
  }
  renderMembresChips();
  renderMembresDropdown(document.getElementById("membresSearch")?.value || "");
}
 
function renderMembresChips() {
  const chipsEl = document.getElementById("membresChips");
  const searchEl = document.getElementById("membresSearch");
  if (!chipsEl) return;
  // Remove old chips (keep the search input)
  chipsEl.querySelectorAll(".multi-chip").forEach((c) => c.remove());
  selectedMembresIds.forEach((id) => {
    const u = allUsers.find((u) => u.id === id);
    if (!u) return;
    const chip = document.createElement("div");
    chip.className = "multi-chip";
    chip.innerHTML = `<span>${u.matricule}</span><span class="multi-chip-remove" onclick="toggleMembre(${id})">×</span>`;
    chipsEl.insertBefore(chip, searchEl);
  });
}
 
function filterMembresDropdown() {
  const q = document.getElementById("membresSearch")?.value || "";
  renderMembresDropdown(q);
}
 
function showMembresDropdown() {
  const dd = document.getElementById("membresDropdown");
  if (dd) dd.style.display = "block";
}
 
function hideMembresDropdown() {
  const dd = document.getElementById("membresDropdown");
  if (dd) dd.style.display = "none";
}
 
// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const wrapper = document.getElementById("membresWrapper");
  if (wrapper && !wrapper.contains(e.target)) hideMembresDropdown();
});
 
async function handleProjectSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("projectId").value;
 
  const body = {
    nom: document.getElementById("nom").value,
    statut: document.getElementById("statut").value,
    type: document.getElementById("type").value,
    priorite: document.getElementById("priorite").value,
    dateDebut: document.getElementById("dateDebut").value || null,
    deadline: document.getElementById("deadline").value || null,
    description: document.getElementById("description").value,
    membresIds: Array.from(selectedMembresIds),
  };
 
  try {
    const url = id ? `${API_BASE}/projets/${id}` : `${API_BASE}/projets`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (res.ok) {
      showFormMsg("Projet sauvegardé avec succès !", "suc");
      setTimeout(() => (window.location.href = "/projets-list"), 1000);
    } else {
      const err = await res.json().catch(() => ({}));
      showFormMsg("Erreur: " + (err.message || res.status), "err");
    }
  } catch (e) {
    showFormMsg("Erreur réseau", "err");
  }
}
 
function showFormMsg(msg, type) {
  const el =
    document.getElementById("msgArea") ||
    document.getElementById("messageArea");
  if (el) el.innerHTML = `<div class="${type}">${msg}</div>`;
}
 
// ---- Projet list page ----
let allProjets = [];
let currentFilter = "Tous";
let currentSearch = "";
 
async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projets/all`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      renderEmpty();
      return;
    }
    allProjets = await res.json();
    renderProjects();
  } catch (e) {
    renderEmpty();
  }
}
 
function filterProjects(f) {
  currentFilter = f;
  document
    .querySelectorAll(".ftab")
    .forEach((t) => t.classList.remove("active"));
  event.target.classList.add("active");
  renderProjects();
}
 
function searchProjects() {
  currentSearch =
    document.querySelector(".search-input")?.value?.toLowerCase() || "";
  renderProjects();
}
 
function renderProjects() {
  const tbody = document.querySelector(".data-table tbody");
  if (!tbody) return;
 
  const statutMap = {
    Tous: null,
    "En cours": "EN_COURS",
    Clôturé: "CLOTURE",
    "Non commencé": "NON_COMMENCE",
    "Pas de visibilité": "PAS_DE_VISIBILITE",
  };
  let list = allProjets;
 
  if (currentFilter && currentFilter !== "Tous") {
    list = list.filter((p) => p.statut === statutMap[currentFilter]);
  }
  if (currentSearch) {
    list = list.filter((p) =>
      (p.nom || "").toLowerCase().includes(currentSearch),
    );
  }
 
  if (list.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:#b0bdd0">Aucun projet trouvé</td></tr>';
    return;
  }
 
  tbody.innerHTML = list
    .map((p) => {
      const color = STATUT_COLOR[p.statut] || "#8a9fbf";
      const label = STATUT_LABEL[p.statut] || p.statut || "—";
      const membres =
        p.membresMatricules && p.membresMatricules.length > 0
          ? p.membresMatricules.join(", ")
          : "—";
      return `<tr>
      <td>${p.id}</td>
      <td style="font-weight:600;color:#1a2d5a">${p.nom || "—"}</td>
      <td>${p.dateDebut || "—"}</td>
      <td><span style="background:${color}22;color:${color};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${label}</span></td>
      <td>${p.type || "—"}</td>
      <td style="font-size:11px;color:#6a80a0;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${membres}">${membres}</td>
      <td>
        <button onclick="editProjet(${p.id})" style="background:#eef4ff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;color:#0d2b6e;font-weight:600">Modifier</button>
        <button onclick="deleteProjet(${p.id})" style="background:#fee;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;color:#c00;font-weight:600;margin-left:4px">Supprimer</button>
      </td>
    </tr>`;
    })
    .join("");
}
 
function renderEmpty() {
  const tbody = document.querySelector(".data-table tbody");
  if (tbody)
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:#b0bdd0">Aucun projet</td></tr>';
}
 
function editProjet(id) {
  window.location.href = "/projets/edit/" + id;
}
 
async function deleteProjet(id) {
  if (!confirm("Supprimer ce projet ?")) return;
  try {
    const res = await fetch(`${API_BASE}/projets/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) loadProjects();
    else alert("Erreur suppression");
  } catch (e) {
    alert("Erreur réseau");
  }
}
 
// Load project data when on edit page
async function loadProjectForEdit() {
  const parts = window.location.pathname.split("/");
  const idx = parts.indexOf("edit");
  if (idx === -1) return;
  const id = parts[idx + 1];
  if (!id) return;
 
  try {
    const res = await fetch(`${API_BASE}/projets/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return;
    const p = await res.json();
    document.getElementById("projectId").value = p.id;
    document.getElementById("nom").value = p.nom || "";
    document.getElementById("statut").value = p.statut || "";
    document.getElementById("type").value = p.type || "";
    document.getElementById("priorite").value = p.priorite || "";
    document.getElementById("dateDebut").value = p.dateDebut || "";
    document.getElementById("deadline").value = p.deadline || "";
    document.getElementById("description").value = p.description || "";
 
    // Membres multi-select
    if (p.membresIds && p.membresIds.length > 0) {
      p.membresIds.forEach((id) => selectedMembresIds.add(id));
      renderMembresChips();
      renderMembresDropdown();
    }
 
    const title = document.getElementById("pageTitle");
    if (title) title.textContent = "Modifier le projet : " + p.nom;
  } catch (e) {}
}
 
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("projets-list")) {
    loadProjects();
    const si = document.querySelector(".search-input");
    if (si)
      si.addEventListener("input", () => {
        currentSearch = si.value.toLowerCase();
        renderProjects();
      });
  }
  if (path.includes("projets/new") || path.includes("projets/edit")) {
    loadUsersForSelects().then(() => {
      if (path.includes("projets/edit")) {
        loadProjectForEdit();
      }
    });
  }
});