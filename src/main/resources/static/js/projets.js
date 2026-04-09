const API_BASE = "/api";

async function handleProjectSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("projectId").value;
  const chefMatricule = (
    document.getElementById("chefMatricule")?.value || ""
  ).trim();

  // Resolve chef by matricule
  let chefProjetId = null;
  if (chefMatricule) {
    try {
      const usersRes = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders(),
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        const found = users.find((u) => u.matricule === chefMatricule);
        if (found) chefProjetId = found.id;
        else {
          showFormMsg(
            "Matricule du chef de projet introuvable : " + chefMatricule,
            "err",
          );
          return;
        }
      }
    } catch (e) {}
  }

  const body = {
    nom: document.getElementById("nom").value,
    statut: document.getElementById("statut").value,
    type: document.getElementById("type").value,
    priorite: document.getElementById("priorite").value,
    dateDebut: document.getElementById("dateDebut").value || null,
    deadline: document.getElementById("deadline").value || null,
    description: document.getElementById("description").value,
    chefProjetId,
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
    "En attente": "EN_ATTENTE",
    Terminé: "TERMINE",
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
      '<tr><td colspan="7" style="text-align:center;padding:40px;color:#b0bdd0">Aucun projet trouvé</td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((p) => {
      const statutColor =
        { EN_COURS: "#5bb8e8", EN_ATTENTE: "#f59e0b", TERMINE: "#22c55e" }[
          p.statut
        ] || "#8a9fbf";
      const statutLabel =
        { EN_COURS: "En cours", EN_ATTENTE: "En attente", TERMINE: "Terminé" }[
          p.statut
        ] ||
        p.statut ||
        "—";
      return `<tr>
      <td>${p.id}</td>
      <td style="font-weight:600;color:#1a2d5a">${p.nom || "—"}</td>
      <td>${p.dateDebut || "—"}</td>
      <td><span style="background:${statutColor}22;color:${statutColor};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${statutLabel}</span></td>
      <td>${p.type || "—"}</td>
      <td>${p.chefProjetNom || (p.chefProjet ? p.chefProjet.prenom + " " + p.chefProjet.nom : "—")}</td>
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
      '<tr><td colspan="7" style="text-align:center;padding:40px;color:#b0bdd0">Aucun projet</td></tr>';
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
    if (document.getElementById("chefMatricule") && p.chefProjet) {
      document.getElementById("chefMatricule").value =
        p.chefProjet.matricule || "";
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
  if (path.includes("projets/edit")) {
    loadProjectForEdit();
  }
});
