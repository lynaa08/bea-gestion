const API_U = "/api";

async function handleUserSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("userId").value;
  const matricule = document.getElementById("matricule").value.trim();

  if (!matricule) {
    showMsg("Le matricule est obligatoire", "error");
    return;
  }

  const body = {
    matricule,
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    email: document.getElementById("email").value,
    telephone: document.getElementById("telephone").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value,
  };

  try {
    const url = id ? `${API_U}/users/${id}` : `${API_U}/users`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      showMsg("Utilisateur sauvegardé avec succès !", "success");
      setTimeout(() => (window.location.href = "/users-list"), 1000);
    } else {
      showMsg(data.message || "Erreur: " + res.status, "error");
    }
  } catch (e) {
    showMsg("Erreur réseau", "error");
  }
}

function showMsg(msg, type) {
  const el = document.getElementById("messageArea");
  if (el) el.innerHTML = `<div class="${type}-message">${msg}</div>`;
}

// ---- Users list ----
let allUsersCache = [];

async function loadUsers() {
  try {
    const res = await fetch(`${API_U}/users`, { headers: getAuthHeaders() });
    if (!res.ok) {
      renderUsersEmpty();
      return;
    }
    allUsersCache = await res.json();
    renderUsers(allUsersCache);
  } catch (e) {
    renderUsersEmpty();
  }
}

function filterUsers() {
  const q = (document.getElementById("searchInput")?.value || "")
    .toLowerCase()
    .trim();
  if (!q) {
    renderUsers(allUsersCache);
    return;
  }
  const filtered = allUsersCache.filter(
    (u) =>
      (u.matricule || "").toLowerCase().includes(q) ||
      ((u.prenom || "") + " " + (u.nom || "")).toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q),
  );
  renderUsers(filtered);
}

const roleLabels = {
  ADMIN: "Administrateur",
  DIRECTEUR: "Directeur",
  CHEF_DEPARTEMENT: "Chef Département",
  INGENIEUR_ETUDE_PMO: "PMO",
  DEVELOPPEUR: "Développeur",
};
const roleColors = {
  ADMIN: "#7c3aed",
  DIRECTEUR: "#0d2b6e",
  CHEF_DEPARTEMENT: "#0891b2",
  INGENIEUR_ETUDE_PMO: "#059669",
  DEVELOPPEUR: "#d97706",
};

function renderUsers(users) {
  const tbody = document.querySelector(".data-table tbody");
  if (!tbody) return;
  if (users.length === 0) {
    renderUsersEmpty();
    return;
  }
  tbody.innerHTML = users
    .map((u) => {
      const color = roleColors[u.role] || "#8a9fbf";
      const label = roleLabels[u.role] || u.role || "—";
      return `<tr>
      <td style="font-weight:700;color:#0d2b6e;letter-spacing:.04em">${u.matricule || "—"}</td>
      <td>${u.prenom || ""} ${u.nom || ""}</td>
      <td>${u.email || "—"}</td>
      <td><span style="background:${color}22;color:${color};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${label}</span></td>
      <td>${u.telephone || "—"}</td>
      <td>
        <button onclick="editUser(${u.id})" style="background:#eef4ff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;color:#0d2b6e;font-weight:600">Modifier</button>
        <button onclick="deleteUser(${u.id})" style="background:#fee;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;color:#c00;font-weight:600;margin-left:4px">Supprimer</button>
      </td>
    </tr>`;
    })
    .join("");
}

function renderUsersEmpty() {
  const tbody = document.querySelector(".data-table tbody");
  if (tbody)
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;color:#b0bdd0">Aucun utilisateur trouvé</td></tr>';
}

function editUser(id) {
  window.location.href = "/users/edit/" + id;
}

async function deleteUser(id) {
  if (!confirm("Supprimer cet utilisateur ?")) return;
  try {
    const res = await fetch(`${API_U}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) loadUsers();
    else alert("Erreur suppression");
  } catch (e) {
    alert("Erreur réseau");
  }
}

// Load user for edit
async function loadUserForEdit() {
  const parts = window.location.pathname.split("/");
  const idx = parts.indexOf("edit");
  if (idx === -1) return;
  const id = parts[idx + 1];
  if (!id) return;

  try {
    const res = await fetch(`${API_U}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return;
    const u = await res.json();
    document.getElementById("userId").value = u.id;
    document.getElementById("matricule").value = u.matricule || "";
    document.getElementById("nom").value = u.nom || "";
    document.getElementById("prenom").value = u.prenom || "";
    document.getElementById("email").value = u.email || "";
    document.getElementById("telephone").value = u.telephone || "";
    document.getElementById("role").value = u.role || "";
    const title = document.getElementById("pageTitle");
    if (title)
      title.textContent =
        "Modifier : " + (u.prenom || "") + " " + (u.nom || "");
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("users-list")) loadUsers();
  if (path.includes("users/edit")) loadUserForEdit();
});
