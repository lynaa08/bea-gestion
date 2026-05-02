function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login"; return false; }
  loadUserInfo();
  applyRoleUI();
  return true;
}

// ══════════════════════════════════════════════════════════════
// PERMISSIONS SIDEBAR (même table que sidebar-badge-loader)
// ══════════════════════════════════════════════════════════════
const ROLE_PERMISSIONS = {
  "section-navigation": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "ADMIN"],
  "nav-dashboard":      ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "ADMIN"],

  "section-projets":  ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-projets-list": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-projets-new":  ["CHEF_DEPARTEMENT", "DIRECTEUR"],
  "nav-remarques":    ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],

  "section-taches": ["DEVELOPPEUR", "INGENIEUR_ETUDE_PMO"],
  "nav-mes-taches": ["DEVELOPPEUR"],

  "section-materiels": ["CHEF_DEPARTEMENT"],
  "nav-materiels":     ["CHEF_DEPARTEMENT"],
  "nav-materiels-new": ["CHEF_DEPARTEMENT"],
  "nav-reservations":  ["CHEF_DEPARTEMENT"],

  "section-admin": ["CHEF_DEPARTEMENT", "ADMIN"],
  "nav-users":     ["DIRECTEUR", "CHEF_DEPARTEMENT", "ADMIN"],
  "nav-users-new": ["CHEF_DEPARTEMENT", "ADMIN"],

  "section-agenda": ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],
  "nav-agenda":     ["DIRECTEUR", "CHEF_DEPARTEMENT", "INGENIEUR_ETUDE_PMO"],

  "section-outils": ["INGENIEUR_ETUDE_PMO", "DEVELOPPEUR"],
  "nav-problemes":  ["INGENIEUR_ETUDE_PMO", "DEVELOPPEUR", "CHEF_DEPARTEMENT"],
};

function applyRoleUI() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const role = user.role;
    Object.entries(ROLE_PERMISSIONS).forEach(([id, rolesAutorises]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = rolesAutorises.includes(role) ? "" : "none";
    });
  } catch (e) {}
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

function loadUserInfo() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    const roleDisplay = {
      ADMIN:               "Administrateur",
      DIRECTEUR:           "Directeur",
      CHEF_DEPARTEMENT:    "Chef Département",
      INGENIEUR_ETUDE_PMO: "PMO",
      DEVELOPPEUR:         "Développeur",
    };
    const label = roleDisplay[user.role] || user.role || "";
    document.querySelectorAll(".user-chip-name").forEach(el => el.textContent = `${user.prenom || ""} ${user.nom || ""}`);
    document.querySelectorAll(".user-chip-role").forEach(el => el.textContent = label);
    document.querySelectorAll(".sidebar-name").forEach(el => el.textContent = `${user.prenom || ""} ${user.nom || ""}`);
    document.querySelectorAll(".sidebar-role").forEach(el => el.textContent = label);
  } catch (e) {}
}

function showNotification(message, type = "info") {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
    document.body.appendChild(container);
  }
  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6", warning: "#f59e0b" };
  const notif = document.createElement("div");
  notif.style.cssText = `background:${colors[type]||colors.info};color:white;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:320px;`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => notif.remove(), 3500);
}

// ── NOTIFICATION PANEL ────────────────────────────────────────

function escapeHtmlSafe(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff/86400)} j`;
  return d.toLocaleDateString("fr-FR");
}

function getTypeInfo(type) {
  const map = {
    PROJET_CREE:      { icon: "🆕", bg: "#EEF4FF" },
    PROJET_MODIFIE:   { icon: "✏️", bg: "#FFF4E0" },
    PROJET_TERMINE:   { icon: "✅", bg: "#E6F7EE" },
    PROBLEME_SIGNALE: { icon: "⚠️", bg: "#FFF0F0" },
    USER_CREE:        { icon: "👤", bg: "#F0F8FF" },
  };
  return map[type] || { icon: "🔔", bg: "#F4F7FC" };
}

async function loadNotifCount() {
  try {
    const res = await fetch("/api/notifications/me/count", { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const count = data.count || 0;
    const badge = document.getElementById("notif-count-badge");
    if (badge) { badge.textContent = count > 99 ? "99+" : count; badge.style.display = count > 0 ? "flex" : "none"; }
  } catch (e) {}
}

async function loadNotifPanel() {
  const list = document.getElementById("notif-panel-list");
  if (!list) return;
  list.innerHTML = '<div style="padding:30px;text-align:center;color:#B0BDD0;font-size:12px;">Chargement...</div>';
  try {
    const res = await fetch("/api/notifications/me", { headers: getAuthHeaders() });
    if (!res.ok) { list.innerHTML = '<div style="padding:30px;text-align:center;color:#ef4444;font-size:12px;">Erreur chargement</div>'; return; }
    const notifs = await res.json();
    if (notifs.length === 0) { list.innerHTML = '<div style="padding:40px;text-align:center;color:#B0BDD0;font-size:12px;">🔔<br><br>Aucune notification</div>'; return; }
    list.innerHTML = notifs.slice(0, 20).map((n) => {
      const t = getTypeInfo(n.type);
      return `<div onclick="handleNotifClick(${n.id},${n.projetId||"null"})"
        style="display:flex;gap:10px;padding:12px 16px;border-bottom:.5px solid #F4F7FC;cursor:pointer;background:${n.lue?"#fff":"#EEF6FF"};"
        onmouseover="this.style.background='${n.lue?"#F8FAFD":"#E5F0FF"}'"
        onmouseout="this.style.background='${n.lue?"#fff":"#EEF6FF"}'">
        <div style="width:32px;height:32px;border-radius:8px;background:${t.bg};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">${t.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:600;color:#1A2D5A;margin-bottom:2px;">${escapeHtmlSafe(n.titre)}</div>
          <div style="font-size:11px;color:#6A80A0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlSafe(n.message)}</div>
          <div style="font-size:10px;color:#B0BDD0;margin-top:2px;">${timeAgo(n.dateCreation)}${n.projetNom?" · "+escapeHtmlSafe(n.projetNom):""}</div>
        </div>
        ${!n.lue?'<div style="width:7px;height:7px;border-radius:50%;background:#5BB8E8;margin-top:5px;flex-shrink:0;"></div>':""}
      </div>`;
    }).join("");
  } catch (e) { list.innerHTML = '<div style="padding:30px;text-align:center;color:#ef4444;font-size:12px;">Erreur de connexion</div>'; }
}

async function handleNotifClick(notifId, projetId) {
  try { await fetch(`/api/notifications/${notifId}/lue`, { method: "PATCH", headers: getAuthHeaders() }); } catch (e) {}
  closeNotifPanel();
  if (projetId) window.location.href = `/projets/edit/${projetId}`;
}

async function markAllRead() {
  try {
    await fetch("/api/notifications/me/toutes-lues", { method: "PATCH", headers: getAuthHeaders() });
    await loadNotifPanel();
    await loadNotifCount();
  } catch (e) {}
}

function toggleNotifPanel() {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  if (panel.style.display === "flex") { closeNotifPanel(); }
  else { panel.style.display = "flex"; loadNotifPanel(); loadNotifCount(); setTimeout(() => document.addEventListener("click", outsideNotifClick), 50); }
}

function closeNotifPanel() {
  const panel = document.getElementById("notif-panel");
  if (panel) panel.style.display = "none";
  document.removeEventListener("click", outsideNotifClick);
}

function outsideNotifClick(e) {
  const panel = document.getElementById("notif-panel");
  const btn = document.getElementById("notifBellBtn");
  if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) closeNotifPanel();
}

function injectNotifPanel() {
  const notifBtn = document.getElementById("notifBellBtn");
  if (!notifBtn) return;
  notifBtn.style.cursor = "pointer";
  notifBtn.onclick = (e) => { e.stopPropagation(); toggleNotifPanel(); };
  if (document.getElementById("notif-panel")) return;
  const dot = notifBtn.querySelector(".notif-dot");
  if (dot) dot.style.display = "none";
  const badge = document.createElement("span");
  badge.id = "notif-count-badge";
  badge.style.cssText = "position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;border-radius:8px;background:#E05A2B;color:#fff;font-size:9px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 3px;border:2px solid #fff;";
  notifBtn.appendChild(badge);
  const panel = document.createElement("div");
  panel.id = "notif-panel";
  panel.style.cssText = "display:none;position:fixed;top:56px;right:16px;width:360px;max-height:480px;background:#fff;border-radius:14px;border:.5px solid #D8E6F0;box-shadow:0 12px 40px rgba(13,43,110,0.14);z-index:9000;flex-direction:column;overflow:hidden;";
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:.5px solid #EEF2F8;flex-shrink:0;">
      <span style="font-size:13px;font-weight:700;color:#0D2B6E;">🔔 Notifications</span>
      <span onclick="markAllRead()" style="font-size:10px;color:#5BB8E8;cursor:pointer;font-weight:500;">Tout marquer lu</span>
    </div>
    <div id="notif-panel-list" style="overflow-y:auto;flex:1;"></div>
    <div style="padding:10px 16px;border-top:.5px solid #EEF2F8;text-align:center;flex-shrink:0;">
      <span onclick="closeNotifPanel()" style="font-size:11px;color:#5BB8E8;cursor:pointer;font-weight:500;">Fermer ✕</span>
    </div>`;
  document.body.appendChild(panel);
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (!path.includes("/login")) {
    checkAuth();
    setTimeout(() => applyRoleUI(), 100);
    injectNotifPanel();
    injectRemarquePanel();
    setTimeout(() => { injectNotifPanel(); injectRemarquePanel(); }, 200);
    loadNotifCount();
    setInterval(loadNotifCount, 30000);
    if (typeof loadSidebarBadges  === "function") loadSidebarBadges();
    if (typeof loadRemarquesBadge === "function") loadRemarquesBadge();
  }
});

// ── REMARQUE PANEL ────────────────────────────────────────────

function injectRemarquePanel() {
  const rBtn = document.getElementById("remarqueBtnTopbar");
  if (!rBtn) return;
  rBtn.style.cursor = "pointer";
  rBtn.onclick = (e) => { e.stopPropagation(); toggleRemarquePanel(); };
  if (document.getElementById("remarque-panel")) return;
  const panel = document.createElement("div");
  panel.id = "remarque-panel";
  panel.style.cssText = "display:none;position:fixed;top:56px;right:58px;width:380px;max-height:500px;background:#fff;border-radius:14px;border:.5px solid #D8E6F0;box-shadow:0 12px 40px rgba(13,43,110,0.14);z-index:9000;flex-direction:column;overflow:hidden;";
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:.5px solid #EEF2F8;flex-shrink:0;">
      <span style="font-size:13px;font-weight:700;color:#0D2B6E;">💬 Remarques récentes</span>
      <a href="/remarques" style="font-size:10px;color:#5BB8E8;text-decoration:none;font-weight:500;">Voir tout →</a>
    </div>
    <div id="remarque-panel-list" style="overflow-y:auto;flex:1;max-height:380px;"></div>
    <div style="padding:10px 16px;border-top:.5px solid #EEF2F8;text-align:center;flex-shrink:0;">
      <span onclick="closeRemarquePanel()" style="font-size:11px;color:#5BB8E8;cursor:pointer;font-weight:500;">Fermer ✕</span>
    </div>`;
  document.body.appendChild(panel);
}

async function loadRemarquePanel() {
  const list = document.getElementById("remarque-panel-list");
  if (!list) return;
  list.innerHTML = '<div style="padding:30px;text-align:center;color:#B0BDD0;font-size:12px;">Chargement...</div>';
  try {
    const projRes = await fetch("/api/projets/all", { headers: getAuthHeaders() });
    if (!projRes.ok) { list.innerHTML = '<div style="padding:30px;text-align:center;color:#ef4444;font-size:12px;">Erreur</div>'; return; }
    const projets = await projRes.json();
    const all = await Promise.all(projets.map(async (p) => {
      try {
        const r = await fetch(`/api/projets/${p.id}/remarques`, { headers: getAuthHeaders() });
        const items = r.ok ? await r.json() : [];
        return items.map((rq) => ({ ...rq, projetId: p.id, projetNom: p.nom }));
      } catch { return []; }
    }));
    const flat = all.flat().sort((a, b) => new Date(b.dateCreation||0) - new Date(a.dateCreation||0)).slice(0, 15);
    if (flat.length === 0) { list.innerHTML = '<div style="padding:40px;text-align:center;color:#B0BDD0;font-size:12px;">💬<br><br>Aucune remarque</div>'; return; }
    list.innerHTML = flat.map((r) => {
      const auteur = r.auteurNom || (r.auteur ? r.auteur.prenom + " " + r.auteur.nom : "—");
      const initiales = auteur.split(" ").map(w => w[0]||"").join("").substring(0,2).toUpperCase();
      const date = r.dateCreation ? new Date(r.dateCreation).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}) : "";
      const contenu = (r.contenu||"").substring(0,80)+((r.contenu||"").length>80?"…":"");
      return `<div onclick="window.location.href='/projets/edit/${r.projetId}'"
        style="display:flex;gap:10px;padding:11px 16px;border-bottom:.5px solid #F4F7FC;cursor:pointer;"
        onmouseover="this.style.background='#F8FAFD'" onmouseout="this.style.background='#fff'">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0d2b6e,#5bb8e8);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0;">${initiales}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:11px;font-weight:700;color:#0D2B6E;margin-bottom:1px;">${escapeHtmlSafe(r.projetNom)}</div>
          <div style="font-size:11px;color:#6A80A0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtmlSafe(contenu)}</div>
          <div style="font-size:10px;color:#B0BDD0;margin-top:2px;">${auteur} · ${date}</div>
        </div>
        <div style="font-size:10px;color:#5BB8E8;font-weight:600;white-space:nowrap;align-self:center;">Voir →</div>
      </div>`;
    }).join("");
  } catch (e) { list.innerHTML = '<div style="padding:30px;text-align:center;color:#ef4444;font-size:12px;">Erreur de connexion</div>'; }
}

function toggleRemarquePanel() {
  const panel = document.getElementById("remarque-panel");
  if (!panel) return;
  if (panel.style.display === "flex") { closeRemarquePanel(); }
  else { panel.style.display = "flex"; loadRemarquePanel(); setTimeout(() => document.addEventListener("click", outsideRemarqueClick), 50); }
}

function closeRemarquePanel() {
  const panel = document.getElementById("remarque-panel");
  if (panel) panel.style.display = "none";
  document.removeEventListener("click", outsideRemarqueClick);
}

function outsideRemarqueClick(e) {
  const panel = document.getElementById("remarque-panel");
  const btn = document.getElementById("remarqueBtnTopbar");
  if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) closeRemarquePanel();
}