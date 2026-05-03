// ══════════════════════════════════════════════════════════════
// SIDEBAR-BADGE-LOADER.JS
// Permissions par rôle + badges sidebar
// ══════════════════════════════════════════════════════════════

// ── Permissions sidebar ───────────────────────────────────────
// Basé sur les URLs réelles du projet :
//   /dashboard, /projets-list, /projets/new, /remarques
//   /mes-taches, /materiels-list, /materiels/new
//   /reservations-list, /users-list, /users/new, /agenda, /problemes
// ─────────────────────────────────────────────────────────────

const SIDEBAR_PERMISSIONS = {

  // Navigation (dashboard visible par tous sauf vérification login)
  "section-navigation": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "ADMIN"],
  "nav-dashboard": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "ADMIN"],

  // Section Projets
  "section-projets": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-projets-list": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-projets-new": ["CHEF_DEPARTEMENT", "DIRECTEUR"],
  "nav-remarques": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],

  // Section Tâches
  "section-taches": ["DEVELOPPEUR", "INGENIEUR_ETUDE_PMO"],
  "nav-mes-taches": ["DEVELOPPEUR"],

  // Section Matériels
  "section-materiels": ["CHEF_DEPARTEMENT"],
  "nav-materiels": ["CHEF_DEPARTEMENT"],
  "nav-materiels-new": ["CHEF_DEPARTEMENT"],
  "nav-reservations": ["CHEF_DEPARTEMENT", "DEVELOPPEUR"],

  // Section Administration
  "section-admin": ["CHEF_DEPARTEMENT", "ADMIN"],
  "nav-users": ["DIRECTEUR", "CHEF_DEPARTEMENT", "ADMIN"],
  "nav-users-new": ["CHEF_DEPARTEMENT", "ADMIN"],

  // Section Agenda
  "section-agenda": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],
  "nav-agenda": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],

  // Section Outils
  "section-outils": ["INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-problemes": ["INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "CHEF_DEPARTEMENT"],
};

// ── Pages autorisées par rôle ─────────────────────────────────
// IMPORTANT : basé sur les URLs réelles (users-list, materiels-list, etc.)
const PAGE_PERMISSIONS = {
  "/dashboard": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "ADMIN"],
  "/projets-list": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "/projets/new": ["CHEF_DEPARTEMENT", "DIRECTEUR"],
  "/projets/edit": ["CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],
  "/remarques": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "/mes-taches": ["DEVELOPPEUR"],
  "/materiels-list": ["CHEF_DEPARTEMENT"],
  "/materiels/new": ["CHEF_DEPARTEMENT"],
  "/materiels/edit": ["CHEF_DEPARTEMENT"],
  "/reservations-list": ["CHEF_DEPARTEMENT", "DEVELOPPEUR"],
  "/users-list": ["DIRECTEUR", "CHEF_DEPARTEMENT", "ADMIN"],
  "/users/new": ["CHEF_DEPARTEMENT", "ADMIN"],
  "/users/edit": ["CHEF_DEPARTEMENT", "ADMIN"],
  "/agenda": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],
  "/problemes": ["INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "CHEF_DEPARTEMENT"],
};

// ── Page d'accueil par rôle ───────────────────────────────────
const HOME_BY_ROLE = {
  DIRECTEUR: "/dashboard",
  CHEF_DEPARTEMENT: "/dashboard",
  ADMIN: "/dashboard",
  INGENIEUR_ETUDE_PMO: "/dashboard",
  DEVELOPPEUR: "/dashboard",
};

// ══════════════════════════════════════════════════════════════
// VÉRIFICATION ACCÈS PAGE
// ══════════════════════════════════════════════════════════════
function verifierAccesPage() {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login"; return false; }

  let user;
  try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { }
  if (!user) { window.location.href = "/login"; return false; }

  const role = user.role;
  const path = window.location.pathname;

  for (const [url, roles] of Object.entries(PAGE_PERMISSIONS)) {
    if (path === url || path.startsWith(url + "/")) {
      if (!roles.includes(role)) {
        window.location.href = HOME_BY_ROLE[role] || "/dashboard";
        return false;
      }
      break;
    }
  }
  return true;
}

// ══════════════════════════════════════════════════════════════
// APPLIQUER RESTRICTIONS SIDEBAR
// ══════════════════════════════════════════════════════════════
function appliquerRestrictionsRole() {
  let user;
  try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { }
  if (!user) return;

  const role = user.role;

  Object.entries(SIDEBAR_PERMISSIONS).forEach(([id, rolesAutorises]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = rolesAutorises.includes(role) ? "" : "none";
  });
}

// ══════════════════════════════════════════════════════════════
// BADGES SIDEBAR
// ══════════════════════════════════════════════════════════════
async function loadSidebarBadges() {
  try {
    const resp = await fetch("/api/dashboard/stats", { headers: getAuthHeaders() });
    if (!resp.ok) return;
    const stats = await resp.json();
    const b = (id, val) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val || 0; el.style.display = (val || 0) > 0 ? "flex" : "none"; }
    };
    b("badge-encours", stats.EN_COURS);
    b("badge-attente", stats.EN_ATTENTE);
    b("badge-termine", stats.TERMINE);
    b("badge-cloture", stats.CLOTURE);
    b("badge-noncommence", stats.NON_COMMENCE);
    b("badge-pasvisibilite", stats.PAS_DE_VISIBILITE);
  } catch (e) { }
}

// ══════════════════════════════════════════════════════════════
// BADGE REMARQUES
// ══════════════════════════════════════════════════════════════
async function loadRemarquesBadge() {
  try {
    const projRes = await fetch("/api/projets/all", { headers: getAuthHeaders() });
    if (!projRes.ok) return;
    const projets = await projRes.json();
    let total = 0;
    await Promise.all(projets.map(async (p) => {
      try {
        const r = await fetch(`/api/projets/${p.id}/remarques`, { headers: getAuthHeaders() });
        if (r.ok) { const list = await r.json(); total += list.length; }
      } catch (e) { }
    }));
    const dot = document.getElementById("remarqueDot");
    if (dot) dot.style.display = total > 0 ? "block" : "none";
    const badge = document.getElementById("sidebarRemarqueBadge");
    if (badge) { badge.textContent = total; badge.style.display = total > 0 ? "flex" : "none"; }
  } catch (e) { }
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("/login")) return;

  if (!verifierAccesPage()) return;

  setTimeout(() => {
    appliquerRestrictionsRole();
    loadSidebarBadges();
    loadRemarquesBadge();
  }, 0);
});