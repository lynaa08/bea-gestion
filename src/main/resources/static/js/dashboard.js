// ── Dashboard ─────────────────────────────────────────────────────────────

const STATUT_LABEL = {
  EN_COURS: "Projet en cours",
  CLOTURE: "Projet clôturé",
  NON_COMMENCE: "Projet non commencé",
  PAS_DE_VISIBILITE: "Pas de visibilité",
};
const STATUT_COLOR = {
  EN_COURS: "#5BB8E8",
  CLOTURE: "#22c55e",
  NON_COMMENCE: "#F5A623",
  PAS_DE_VISIBILITE: "#8a9fbf",
};

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
  loadDashboard();
});

async function loadDashboard() {
  await Promise.all([
    loadStatistics(),
    loadStatsByType(),
    loadRecentProjects(),
  ]);
}

// ── 1. Cartes + barres de progression ──────────────────────────────────────
async function loadStatistics() {
  try {
    const res = await fetch("/api/dashboard/stats", {
      headers: getAuthHeaders(),
    });
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) return;
    const stats = await res.json();
    updateCards(stats);
  } catch (e) {}
}

function updateCards(stats) {
  const total = stats.TOTAL || 0;
  const keys = [
    { key: "EN_COURS", id: "qcard-encours", bar: "bar-encours" },
    { key: "NON_COMMENCE", id: "qcard-noncommence", bar: "bar-noncommence" },
    { key: "CLOTURE", id: "qcard-cloture", bar: "bar-cloture" },
    {
      key: "PAS_DE_VISIBILITE",
      id: "qcard-pasvisibilite",
      bar: "bar-pasvisibilite",
    },
  ];

  keys.forEach(({ key, id, bar }) => {
    const val = stats[key] || 0;
    const pct = total > 0 ? Math.round((val / total) * 100) : 0;

    const numEl = document.getElementById(id);
    if (numEl) {
      numEl.textContent = val;
      // Animate number
      animateNumber(numEl, val);
    }

    const barEl = document.getElementById(bar);
    if (barEl) {
      setTimeout(() => {
        barEl.style.width = pct + "%";
      }, 100);
      barEl.title = pct + "% du total";
    }
  });

  // Also update the avancement section
  renderAvancement(stats, total);
}

function animateNumber(el, target) {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 20));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

// ── 2. Avancement global (barres de pourcentage) ────────────────────────────
function renderAvancement(stats, total) {
  const container = document.getElementById("dash-avancement");
  if (!container) return;

  if (total === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;color:#b0bdd0;font-size:13px">Aucun projet enregistré</div>';
    return;
  }

  const rows = [
    { key: "EN_COURS", label: "En cours", color: "#5BB8E8" },
    { key: "CLOTURE", label: "Clôturés", color: "#22c55e" },
    { key: "NON_COMMENCE", label: "Non commencés", color: "#F5A623" },
    { key: "PAS_DE_VISIBILITE", label: "Pas de visibilité", color: "#8a9fbf" },
  ];

  // Total badge
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:0.5px solid #eef2f8;">
      <span style="font-size:13px;font-weight:600;color:#1a2d5a;">Total projets</span>
      <span style="font-size:26px;font-weight:800;color:#0d2b6e;">${total}</span>
    </div>
    ${rows
      .map(({ key, label, color }) => {
        const val = stats[key] || 0;
        const pct = Math.round((val / total) * 100);
        return `<div class="dash-progress-row">
        <div class="dash-progress-dot" style="background:${color}"></div>
        <span class="dash-progress-label">${label}</span>
        <div class="dash-progress-bar-wrap">
          <div class="dash-progress-bar-inner" style="width:0%;background:${color}" data-pct="${pct}"></div>
        </div>
        <span class="dash-progress-pct">${pct}%</span>
        <span class="dash-progress-count">${val}</span>
      </div>`;
      })
      .join("")}
  `;

  // Animate progress bars
  setTimeout(() => {
    container.querySelectorAll(".dash-progress-bar-inner").forEach((bar) => {
      bar.style.width = bar.dataset.pct + "%";
    });
  }, 150);
}

// ── 3. Projets récents ──────────────────────────────────────────────────────
async function loadRecentProjects() {
  const container = document.getElementById("dash-recent");
  if (!container) return;
  try {
    const res = await fetch("/api/dashboard/recent?limit=6", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      container.innerHTML =
        '<div style="padding:20px;color:#b0bdd0;font-size:12px;text-align:center">Indisponible</div>';
      return;
    }
    const projects = await res.json();

    if (!projects || projects.length === 0) {
      container.innerHTML =
        '<div style="padding:40px;color:#b0bdd0;font-size:13px;text-align:center">Aucun projet récent</div>';
      return;
    }

    container.innerHTML = projects
      .map((p) => {
        const color = STATUT_COLOR[p.statut] || "#8a9fbf";
        const label = STATUT_LABEL[p.statut] || p.statut || "—";
        const date = p.dateCreation
          ? new Date(p.dateCreation).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";
        return `<div class="dash-recent-item" onclick="window.location.href='/projets/edit/${p.id}'">
        <div class="dash-recent-dot" style="background:${color}"></div>
        <span class="dash-recent-name" title="${p.nom || ""}">${p.nom || "—"}</span>
        <span class="dash-recent-date">${date}</span>
        <span class="dash-recent-badge" style="background:${color}22;color:${color}">${label}</span>
      </div>`;
      })
      .join("");
  } catch (e) {
    container.innerHTML =
      '<div style="padding:20px;color:#ef4444;font-size:12px;text-align:center">Erreur chargement</div>';
  }
}

// ── 4. Stats par type ───────────────────────────────────────────────────────
async function loadStatsByType() {
  try {
    const res = await fetch("/api/dashboard/stats/by-type", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return;
    const stats = await res.json();
    displayStatsByType(stats);
  } catch (e) {}
}

function displayStatsByType(stats) {
  const container = document.getElementById("stats-by-type");
  if (!container) return;

  if (!stats || Object.keys(stats).length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;color:#8A9FBF;">Aucune donnée disponible</div>';
    return;
  }

  const statKeys = [
    { key: "EN_COURS", label: "En cours", color: "#5BB8E8" },
    { key: "CLOTURE", label: "Clôturés", color: "#22c55e" },
    { key: "NON_COMMENCE", label: "Non commencés", color: "#F5A623" },
    { key: "PAS_DE_VISIBILITE", label: "Pas de visibilité", color: "#8a9fbf" },
  ];

  container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:14px;">
    ${Object.entries(stats)
      .map(([type, data]) => {
        const total = data.TOTAL || 0;
        const bars = statKeys
          .map(({ key, label, color }) => {
            const val = data[key] || 0;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return `<div style="margin-bottom:9px">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;color:#4a6080">
            <span>${label}</span>
            <span style="font-weight:700;color:${color}">${pct}% <span style="color:#b0bdd0;font-weight:400">(${val})</span></span>
          </div>
          <div style="height:6px;background:#EEF2F8;border-radius:3px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:3px;transition:width 0.8s"></div>
          </div>
        </div>`;
          })
          .join("");

        return `<div style="background:#F8FAFD;border-radius:12px;padding:16px 18px;border:0.5px solid #D8E6F2;">
        <div style="font-size:13px;font-weight:700;color:#0D2B6E;margin-bottom:4px">${type}</div>
        <div style="font-size:28px;font-weight:800;color:#1A4BA8;margin-bottom:2px">${total}</div>
        <div style="font-size:10px;color:#B0BDD0;margin-bottom:14px;text-transform:uppercase;letter-spacing:.5px">projets</div>
        ${bars}
      </div>`;
      })
      .join("")}
  </div>`;
}

// Helper
function escapeHtml(t) {
  if (!t) return "";
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

// Auto-refresh toutes les 60s
setInterval(() => {
  if (window.location.pathname === "/dashboard") loadDashboard();
}, 60000);
