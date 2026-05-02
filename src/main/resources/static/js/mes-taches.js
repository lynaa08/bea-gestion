// ══════════════════════════════════════════════════════════════
//  mes-taches.js  —  BEA Gestion  —  Page "Mes Tâches" (DEV)
// ══════════════════════════════════════════════════════════════
 
// ── Constantes (préfixe MT_ pour éviter conflits avec projets.js) ─
const MT_STATUT_LABELS = {
  A_FAIRE:  "À faire",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  BLOQUEE:  "Bloquée",
};
 
const MT_STATUT_STYLE = {
  A_FAIRE:  { bg: "#f1f5f9", color: "#64748b" },
  EN_COURS: { bg: "#fff7e6", color: "#d97706" },
  TERMINEE: { bg: "#e6f7ee", color: "#16a34a" },
  BLOQUEE:  { bg: "#fef2f2", color: "#ef4444" },
};
 
const MT_PRIO_COLOR = {
  HAUTE:    "#ef4444",
  CRITIQUE: "#b91c1c",
  MOYENNE:  "#f59e0b",
  BASSE:    "#22c55e",
};
 
// ── État global ────────────────────────────────────────────────
let allTaches      = [];
let statutFilter   = "Tous";
let currentTacheId = null;
let dropdownOpen   = false;
 
// ── Helpers ────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return d; }
}
 
function getDeadlineInfo(dateEcheance, statut) {
  if (!dateEcheance) return { label: "Aucune deadline", cls: "dl-aucune", icon: "" };
  if (statut === "TERMINEE") return { label: formatDate(dateEcheance), cls: "dl-ok", icon: "✅" };
  const diff = Math.ceil((new Date(dateEcheance) - new Date()) / 86400000);
  if (diff < 0)   return { label: `${formatDate(dateEcheance)} · ${Math.abs(diff)}j de retard`, cls: "dl-retard", icon: "⛔" };
  if (diff === 0) return { label: "Aujourd'hui !", cls: "dl-retard", icon: "🔥" };
  if (diff === 1) return { label: "Demain !", cls: "dl-proche", icon: "⚠️" };
  if (diff <= 3)  return { label: `${formatDate(dateEcheance)} · dans ${diff}j`, cls: "dl-proche", icon: "📅" };
  return            { label: `${formatDate(dateEcheance)} · dans ${diff}j`, cls: "dl-ok", icon: "📅" };
}
 
// ── Chargement initial ─────────────────────────────────────────
async function loadTaches() {
  try {
    const res = await fetch("/api/taches/me", { headers: getAuthHeaders() });
    if (res.status === 401) { window.location.href = "/login"; return; }
    allTaches = res.ok ? await res.json() : [];
    buildProjetFilter();
    updateStats();
    applyFilters();
  } catch {
    document.getElementById("tachesContainer").innerHTML =
      `<div class="empty-state"><p>Erreur de chargement. Vérifiez votre connexion.</p></div>`;
  }
}
 
// ── Dropdown filtre projet ─────────────────────────────────────
function buildProjetFilter() {
  const sel = document.getElementById("projetFilter");
  if (!sel) return;
  const projets = [...new Set(allTaches.map(t => t.projetNom).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">📁 Tous les projets</option>`;
  projets.forEach(nom => {
    const o = document.createElement("option");
    o.value = nom; o.textContent = "📁 " + nom;
    sel.appendChild(o);
  });
}
 
// ── Stats cards ────────────────────────────────────────────────
function updateStats() {
  document.getElementById("statTotal").textContent    = allTaches.length;
  document.getElementById("statAFaire").textContent   = allTaches.filter(t => t.statut === "A_FAIRE").length;
  document.getElementById("statEnCours").textContent  = allTaches.filter(t => t.statut === "EN_COURS").length;
  document.getElementById("statBloquee").textContent  = allTaches.filter(t => t.statut === "BLOQUEE").length;
  document.getElementById("statTerminee").textContent = allTaches.filter(t => t.statut === "TERMINEE").length;
}
 
// ── Filtre statut (tabs) ───────────────────────────────────────
function setStatutFilter(val, el) {
  statutFilter = val;
  document.querySelectorAll(".ftab").forEach(t => {
    t.classList.remove("active", "bg-bea-800", "text-white");
    t.classList.add("text-slate-500");
  });
  el.classList.add("active", "bg-bea-800", "text-white");
  el.classList.remove("text-slate-500");
  applyFilters();
}
 
// ── Application des filtres ────────────────────────────────────
function applyFilters() {
  const searchEl  = document.getElementById("searchInput");
  const projetEl  = document.getElementById("projetFilter");
  const search    = (searchEl ? searchEl.value : "").toLowerCase();
  const projetVal = projetEl ? projetEl.value : "";
 
  let list = allTaches;
  if (statutFilter !== "Tous") list = list.filter(t => t.statut === statutFilter);
  if (projetVal)  list = list.filter(t => t.projetNom === projetVal);
  if (search)     list = list.filter(t =>
    (t.titre || "").toLowerCase().includes(search) ||
    (t.projetNom || "").toLowerCase().includes(search)
  );
 
  const countEl = document.getElementById("countInfo");
  if (countEl) countEl.textContent = `${list.length} tâche(s)`;
  renderGroupes(list);
}
 
// ── Rendu groupé par projet ────────────────────────────────────
function renderGroupes(taches) {
  const container = document.getElementById("tachesContainer");
  if (!container) return;
 
  if (!taches.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="margin-bottom:12px;opacity:0.35">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
          <path d="M8 9h8M8 13h5M8 17h3" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p style="font-size:14px;font-weight:600;margin-bottom:4px">Aucune tâche trouvée</p>
        <p style="font-size:12px">Essayez un autre filtre ou attendez qu'une tâche vous soit assignée.</p>
      </div>`;
    return;
  }
 
  // Grouper par projetNom
  const groupes = {};
  taches.forEach(t => {
    const key = t.projetNom || "Sans projet";
    if (!groupes[key]) groupes[key] = [];
    groupes[key].push(t);
  });
 
  container.innerHTML = Object.entries(groupes).map(([projetNom, liste]) => {
    const rows = liste.map(t => renderTacheRow(t)).join("");
    const safeId = "grp_" + projetNom.replace(/[^a-zA-Z0-9]/g, "_");
    return `
      <div class="projet-group">
        <div class="projet-header" onclick="toggleGroupe('${safeId}', this)">
          <div class="projet-header-left">
            <div class="projet-icon">📁</div>
            <span class="projet-name">${projetNom}</span>
            <span class="projet-count">${liste.length} tâche${liste.length > 1 ? "s" : ""}</span>
          </div>
          <span class="projet-chevron">▼</span>
        </div>
        <div id="${safeId}">${rows}</div>
      </div>`;
  }).join("");
}
 
function renderTacheRow(t) {
  const isDone    = t.statut === "TERMINEE";
  const isEnCours = t.statut === "EN_COURS";
  const isBloquee = t.statut === "BLOQUEE";
  const st = MT_STATUT_STYLE[t.statut] || MT_STATUT_STYLE.A_FAIRE;
  const dl = getDeadlineInfo(t.dateEcheance, t.statut);
  const checkClass   = isDone ? "done" : isEnCours ? "encours" : isBloquee ? "bloquee" : "";
  const checkContent = isDone ? "✓"   : isEnCours ? "◑"       : isBloquee ? "✕"       : "";
  const prioColor    = MT_PRIO_COLOR[t.priorite] || "#8a9fbf";
 
  return `
    <div class="tache-row" onclick="openDrawer(${t.id})">
      <div class="tache-checkbox ${checkClass}">${checkContent}</div>
      <div class="tache-info">
        <div class="tache-titre ${isDone ? "done" : ""}">${t.titre || "—"}</div>
        <div class="tache-meta">
          ${t.dateEcheance ? `<span class="tache-meta-item ${dl.cls}">${dl.icon} ${dl.label}</span>` : ""}
          ${t.priorite     ? `<span class="tache-meta-item" style="color:${prioColor};font-weight:600">● ${t.priorite}</span>` : ""}
        </div>
      </div>
      <div class="statut-pill" style="background:${st.bg};color:${st.color}">
        ${MT_STATUT_LABELS[t.statut] || t.statut}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;color:#94a3b8">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
}
 
// ── Toggle groupe projet (collapse/expand) ─────────────────────
function toggleGroupe(id, headerEl) {
  const grp     = document.getElementById(id);
  const chevron = headerEl.querySelector(".projet-chevron");
  if (!grp) return;
  const isVisible = grp.style.display !== "none";
  grp.style.display = isVisible ? "none" : "block";
  chevron.classList.toggle("rotated", isVisible);
}
 
// ══════════════════════════════════════════════════════════════
//  DRAWER — Détail tâche
// ══════════════════════════════════════════════════════════════
async function openDrawer(tacheId) {
  currentTacheId = tacheId;
  const tache = allTaches.find(t => t.id === tacheId);
  if (!tache) return;
 
  // Header
  document.getElementById("d-projet").textContent = "📁 " + (tache.projetNom || "—");
  document.getElementById("d-titre").textContent  = tache.titre || "—";
  setStatutUI(tache.statut);
 
  // Infos
  const prioEl = document.getElementById("d-priorite");
  prioEl.textContent = tache.priorite || "—";
  prioEl.style.color = MT_PRIO_COLOR[tache.priorite] || "#8a9fbf";
 
  document.getElementById("d-assigne").textContent =
    ((tache.assignePrenom || "") + " " + (tache.assigneNom || "")).trim() || "—";
 
  const dl   = getDeadlineInfo(tache.dateEcheance, tache.statut);
  const dlEl = document.getElementById("d-deadline");
  dlEl.textContent  = (dl.icon ? dl.icon + " " : "") + dl.label;
  dlEl.className    = "text-sm font-semibold " + dl.cls;
 
  document.getElementById("d-desc").textContent = tache.description || "Aucune description.";
 
  // Ouvrir
  document.getElementById("drawer").classList.add("open");
  document.getElementById("drawerOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
 
  // Charger sous-tâches
  await loadSousTaches(tacheId);
}
 
function closeDrawer() {
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawerOverlay").classList.remove("open");
  document.body.style.overflow = "";
  currentTacheId = null;
  fermerDropdown();
}
 
// ── Sous-tâches ────────────────────────────────────────────────
async function loadSousTaches(tacheId) {
  const listEl  = document.getElementById("d-sousTachesList");
  const progSec = document.getElementById("d-progressSection");
  listEl.innerHTML = `<div class="text-xs text-center py-6" style="color:#c0cce0">Chargement...</div>`;
 
  try {
    const res = await fetch(`/api/taches/${tacheId}/sous-taches`, { headers: getAuthHeaders() });
    const sousTaches = res.ok ? await res.json() : [];
 
    const total  = sousTaches.length;
    const faites = sousTaches.filter(s => s.faite).length;
 
    // Progression
    if (total > 0) {
      progSec.style.display = "block";
      const pct = Math.round((faites / total) * 100);
      document.getElementById("d-progressText").textContent  = `${faites}/${total}`;
      document.getElementById("d-progressBar").style.width   = pct + "%";
      document.getElementById("d-progressBar").style.background = pct === 100 ? "#22c55e" : "#5bb8e8";
      document.getElementById("d-progressPct").textContent   = pct + "%";
    } else {
      progSec.style.display = "none";
    }
 
    if (!sousTaches.length) {
      listEl.innerHTML = `<div class="text-xs text-center py-6" style="color:#c0cce0">Aucune sous-tâche.</div>`;
      return;
    }
 
    listEl.innerHTML = sousTaches.map(st => `
      <div class="st-row" id="st-${st.id}">
        <div class="st-checkbox ${st.faite ? "done" : ""}"
          onclick="toggleSousTache(${tacheId}, ${st.id}, this)">
          ${st.faite ? "✓" : ""}
        </div>
        <span class="st-titre ${st.faite ? "done" : ""}" id="st-titre-${st.id}">${st.titre || "—"}</span>
      </div>`).join("");
 
  } catch {
    listEl.innerHTML = `<div class="text-xs text-center py-4" style="color:#ef4444">Erreur chargement sous-tâches.</div>`;
  }
}
 
// ── Toggle sous-tâche ──────────────────────────────────────────
async function toggleSousTache(tacheId, sousTacheId, el) {
  const wasDone = el.classList.contains("done");
 
  // Optimistic UI
  el.classList.toggle("done", !wasDone);
  el.textContent = !wasDone ? "✓" : "";
  const titreEl = document.getElementById("st-titre-" + sousTacheId);
  if (titreEl) titreEl.classList.toggle("done", !wasDone);
 
  try {
    const res = await fetch(`/api/taches/${tacheId}/sous-taches/${sousTacheId}/toggle`, {
      method: "PATCH", headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error();
    await loadSousTaches(tacheId);
  } catch {
    // Rollback
    el.classList.toggle("done", wasDone);
    el.textContent = wasDone ? "✓" : "";
    if (titreEl) titreEl.classList.toggle("done", wasDone);
    showNotification("Erreur lors de la mise à jour.", "error");
  }
}
 
// ── Dropdown statut tâche ──────────────────────────────────────
function toggleStatutDropdown(e) {
  e.stopPropagation();
  dropdownOpen = !dropdownOpen;
  document.getElementById("statutDropdown").style.display = dropdownOpen ? "block" : "none";
}
 
function fermerDropdown() {
  dropdownOpen = false;
  const dd = document.getElementById("statutDropdown");
  if (dd) dd.style.display = "none";
}
 
async function changerStatut(newStatut) {
  if (!currentTacheId) return;
  fermerDropdown();
  try {
    const res = await fetch(`/api/taches/${currentTacheId}/statut`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ statut: newStatut }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
 
    // Mise à jour locale
    const idx = allTaches.findIndex(t => t.id === currentTacheId);
    if (idx !== -1) allTaches[idx] = updated;
 
    // Rafraîchir UI
    setStatutUI(newStatut);
    updateStats();
    applyFilters();
 
    const dl   = getDeadlineInfo(updated.dateEcheance, newStatut);
    const dlEl = document.getElementById("d-deadline");
    dlEl.textContent = (dl.icon ? dl.icon + " " : "") + dl.label;
    dlEl.className   = "text-sm font-semibold " + dl.cls;
 
    showNotification("Statut mis à jour ✅", "success");
  } catch {
    showNotification("Erreur mise à jour statut.", "error");
  }
}
 
function setStatutUI(statut) {
  const st  = MT_STATUT_STYLE[statut] || MT_STATUT_STYLE.A_FAIRE;
  const btn = document.getElementById("d-statutBtn");
  if (btn) {
    document.getElementById("d-statutText").textContent = MT_STATUT_LABELS[statut] || statut;
    btn.style.background = st.bg;
    btn.style.color      = st.color;
  }
}
 
// ── Fermer dropdown si clic en dehors ─────────────────────────
document.addEventListener("click", e => {
  const wrapper = document.getElementById("statutWrapper");
  if (wrapper && !wrapper.contains(e.target)) fermerDropdown();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
 
// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  try {
    var userStr = localStorage.getItem("user");
    if (!userStr) { window.location.href = "/login"; return; }
    var user = JSON.parse(userStr);
    if (user.role !== "DEVELOPPEUR") {
      window.location.href = "/dashboard";
      return;
    }
  } catch (e) {
    window.location.href = "/login";
    return;
  }
  loadTaches();
});