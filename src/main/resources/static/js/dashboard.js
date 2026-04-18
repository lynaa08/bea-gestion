// Dashboard functionality
let statsChart = null;

// Check authentication on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    loadUserInfo();
    loadDashboard();
  });
} else {
  if (!checkAuth()) return;
  loadUserInfo();
  loadDashboard();
}

// Load all dashboard data
async function loadDashboard() {
  try {
    // Load statistics for cards
    await loadStatistics();

    // Load statistics by type
    await loadStatsByType();

    // Load recent projects (optional)
    await loadRecentProjects();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showNotification("Erreur lors du chargement du tableau de bord", "error");
  }
}

// Load statistics for cards
async function loadStatistics() {
  try {
    const response = await fetch(`/api/dashboard/stats`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const stats = await response.json();
      updateDashboardStats(stats);
    } else if (response.status === 401) {
      logout();
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Update dashboard statistics cards
function updateDashboardStats(stats) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || 0;
  };
  set("qcard-encours", stats.EN_COURS);
  set("qcard-noncommence", stats.NON_COMMENCE);
  set("qcard-cloture", stats.CLOTURE);
  set("qcard-pasvisibilite", stats.PAS_DE_VISIBILITE);
}

// Load statistics by project type
async function loadStatsByType() {
  try {
    const response = await fetch(`/api/dashboard/stats/by-type`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const stats = await response.json();
      displayStatsByType(stats);
    }
  } catch (error) {
    console.error("Error loading stats by type:", error);
  }
}

const STATUT_LABEL_DASH = {
  EN_COURS: "En cours",
  CLOTURE: "Clôturé",
  NON_COMMENCE: "Non commencé",
  PAS_DE_VISIBILITE: "Pas de visibilité",
};
const STATUT_COLOR_DASH = {
  EN_COURS: "#5BB8E8",
  CLOTURE: "#22c55e",
  NON_COMMENCE: "#F5A623",
  PAS_DE_VISIBILITE: "#8a9fbf",
};

// Display statistics by type
function displayStatsByType(stats) {
  const container = document.getElementById("stats-by-type");
  if (!container) return;

  if (!stats || Object.keys(stats).length === 0) {
    container.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #8A9FBF;">Aucune donnée disponible</div>';
    return;
  }

  let html =
    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">';

  for (const [type, data] of Object.entries(stats)) {
    const total = data.TOTAL || 0;
    const bars = ["EN_COURS", "NON_COMMENCE", "CLOTURE", "PAS_DE_VISIBILITE"]
      .map((s) => {
        const cnt = data[s] || 0;
        const pct = total > 0 ? ((cnt / total) * 100).toFixed(0) : 0;
        return `<div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
            <span>${STATUT_LABEL_DASH[s]}</span>
            <span><strong>${cnt}</strong> (${pct}%)</span>
          </div>
          <div style="height:6px;background:#E8EFF8;border-radius:3px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${STATUT_COLOR_DASH[s]};border-radius:3px"></div>
          </div>
        </div>`;
      })
      .join("");

    html += `
      <div style="background:#F8FAFD;border-radius:10px;padding:16px;border:.5px solid #D8E6F2;">
        <div style="font-size:14px;font-weight:700;color:#0D2B6E;margin-bottom:12px;">${type}</div>
        <div style="font-size:28px;font-weight:700;color:#1A4BA8;margin-bottom:8px;">${total}</div>
        <div style="font-size:11px;color:#8A9FBF;margin-bottom:12px;">Total projets</div>
        ${bars}
      </div>`;
  }

  html += "</div>";
  container.innerHTML = html;
}

// Load recent projects
async function loadRecentProjects() {
  try {
    const response = await fetch(`/api/dashboard/recent?limit=5`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const projects = await response.json();
      displayRecentProjects(projects);
    }
  } catch (error) {
    console.error("Error loading recent projects:", error);
  }
}

// Display recent projects
function displayRecentProjects(projects) {
  const container = document.getElementById("recent-projects");
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML =
      '<div style="text-align: center; padding: 20px; color: #8A9FBF;">Aucun projet récent</div>';
    return;
  }

  let html = '<div style="margin-top: 16px;">';
  projects.forEach((project) => {
    html += `
            <div onclick="window.location.href='/projets/view/${project.id}'" 
                 style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 0.5px solid #EEF2F8; cursor: pointer; hover:background: #F5F8FD;">
                <div>
                    <div style="font-weight: 600; color: #1A2D5A; margin-bottom: 4px;">${escapeHtml(project.nom)}</div>
                    <div style="font-size: 11px; color: #8A9FBF;">${formatDate(project.dateCreation)}</div>
                </div>
                <span class="pill ${getStatusClass(project.statut)}">
                    <span class="pill-dot"></span>${getStatusText(project.statut)}
                </span>
            </div>
        `;
  });
  html += "</div>";

  // Add recent projects section if not exists
  const statsContainer = document.getElementById("stats-by-type");
  if (statsContainer && !document.getElementById("recent-projects")) {
    const recentSection = document.createElement("div");
    recentSection.id = "recent-projects";
    recentSection.innerHTML =
      '<div class="section-label" style="margin-top: 24px;">📋 Projets récents</div>';
    statsContainer.parentNode.appendChild(recentSection);
    document.getElementById("recent-projects").innerHTML += html;
  } else if (document.getElementById("recent-projects")) {
    document.getElementById("recent-projects").innerHTML += html;
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
}

function getStatusClass(statut) {
  const map = {
    EN_COURS: "p-encours",
    CLOTURE: "p-cloture",
    NON_COMMENCE: "p-noncommence",
    PAS_DE_VISIBILITE: "p-pasvisibilite",
  };
  return map[statut] || "";
}

function getStatusText(statut) {
  const map = {
    EN_COURS: "Projet en cours",
    CLOTURE: "Projet clôturé",
    NON_COMMENCE: "Projet non commencé",
    PAS_DE_VISIBILITE: "Pas de visibilité",
  };
  return map[statut] || statut || "—";
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// Load user info
function loadUserInfo() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const roleText =
    user.role === "ADMIN"
      ? "Administrateur"
      : user.role === "CHEF_PROJET"
        ? "Chef de projet"
        : "Consultant";

  // Update user name in all places
  document.querySelectorAll(".user-chip-name, .sidebar-name").forEach((el) => {
    if (el) el.textContent = `${user.prenom} ${user.nom}`;
  });

  // Update role
  document.querySelectorAll(".user-chip-role, .sidebar-role").forEach((el) => {
    if (el) el.textContent = roleText;
  });

  // Update avatar
  const initials =
    `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  document.querySelectorAll(".user-chip-avatar").forEach((el) => {
    if (el) el.textContent = initials;
  });
}

// Refresh dashboard periodically (every 30 seconds)
setInterval(() => {
  if (window.location.pathname === "/dashboard") {
    loadStatistics();
    loadStatsByType();
  }
}, 30000);
