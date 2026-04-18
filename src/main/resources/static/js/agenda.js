const DAYS_FR = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const MONTHS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ── Nouveaux statuts ──────────────────────────────────────────────────────
const AGENDA_STATUT_LABEL = {
  EN_COURS: "Projet en cours",
  CLOTURE: "Projet clôturé",
  NON_COMMENCE: "Projet non commencé",
  PAS_DE_VISIBILITE: "Pas de visibilité",
};
const AGENDA_STATUT_COLOR = {
  EN_COURS: { ev: "ev-blue", dot: "blue", badge: "en-cours" },
  CLOTURE: { ev: "ev-green", dot: "green", badge: "valider" },
  NON_COMMENCE: { ev: "ev-orange", dot: "orange", badge: "urgent" },
  PAS_DE_VISIBILITE: { ev: "ev-teal", dot: "blue", badge: "en-cours" },
};

let allProjets = [];

document.addEventListener("DOMContentLoaded", async () => {
  renderCalendar();
  renderDeadlines();
  setupMonthTabs();
  setupSearch();
  await loadProjets();
  renderCalendar();
  renderDeadlines();
});

async function loadProjets() {
  try {
    const resp = await fetch("/api/projets/all", { headers: getAuthHeaders() });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.length > 0) allProjets = data;
    }
  } catch (e) {}
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  document.getElementById("calendarTitle").textContent =
    `AGENDA — ${MONTHS_FR[currentMonth]} ${currentYear}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(currentYear, currentMonth, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let html = "";
  // Day headers
  DAYS_FR.forEach((d) => {
    html += `<div class="cal-day-header" style="font-size:12px;padding:8px 4px;">${d}</div>`;
  });

  // Empty cells before month start
  for (let i = 0; i < startDow; i++) {
    html += `<div class="cal-cell" style="background:#fafbff;height:90px;"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonth, day);
    cellDate.setHours(0, 0, 0, 0);
    const isToday = cellDate.getTime() === today.getTime();

    const dayProjets = allProjets.filter((p) => {
      if (!p.dateDebut && !p.deadline) return false;
      const debut = p.dateDebut ? new Date(p.dateDebut) : null;
      const deadline = p.deadline ? new Date(p.deadline) : null;
      if (debut) debut.setHours(0, 0, 0, 0);
      if (deadline) deadline.setHours(0, 0, 0, 0);
      return (
        (debut && debut.getTime() === cellDate.getTime()) ||
        (deadline && deadline.getTime() === cellDate.getTime()) ||
        (debut && deadline && cellDate >= debut && cellDate <= deadline)
      );
    });

    html += `<div class="cal-cell" style="height:90px;vertical-align:top;padding:4px;">
      <div style="font-size:13px;font-weight:${isToday ? "700" : "500"};color:${isToday ? "#fff" : "#2d4a7a"};
        background:${isToday ? "#5bb8e8" : "transparent"};width:22px;height:22px;border-radius:50%;
        display:inline-flex;align-items:center;justify-content:center;margin-bottom:3px;">
        ${day}
      </div>`;

    dayProjets.slice(0, 2).forEach((p) => {
      const isDebut =
        p.dateDebut &&
        new Date(p.dateDebut).toDateString() === cellDate.toDateString();
      const isDeadline =
        p.deadline &&
        new Date(p.deadline).toDateString() === cellDate.toDateString();
      const evClass = getProjetEvClass(p.statut);
      const badge = isDebut ? "DÉBUT" : isDeadline ? "FIN" : "";
      html += `<div class="cal-event ${evClass}" style="margin-bottom:2px;font-size:10px;padding:2px 5px;border-radius:4px;">
        ${p.nom.length > 12 ? p.nom.substring(0, 12) + "…" : p.nom}
        ${badge ? `<span style="font-size:9px;font-weight:700;margin-left:3px;opacity:0.8;">${badge}</span>` : ""}
      </div>`;
    });

    if (dayProjets.length > 2) {
      html += `<div style="font-size:9px;color:#8a9fbf;">+${dayProjets.length - 2} autres</div>`;
    }
    html += `</div>`;
  }

  // Trailing empty cells
  const totalCells = startDow + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < remaining; i++) {
    html += `<div class="cal-cell" style="background:#fafbff;height:90px;"></div>`;
  }

  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  grid.innerHTML = html;
  renderLegend();
}

function renderLegend() {
  let legend = document.getElementById("calendarLegend");
  if (!legend) {
    legend = document.createElement("div");
    legend.id = "calendarLegend";
    legend.style.cssText =
      "display:flex;gap:16px;flex-wrap:wrap;padding:10px 20px;font-size:11px;color:#4a6080;border-top:1px solid #e8f0f8;";
    const card = document.querySelector(".agenda-card");
    if (card) card.appendChild(legend);
  }
  legend.innerHTML = `
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#1a5fa8;margin-right:4px;"></span>En cours</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;margin-right:4px;"></span>Clôturé</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;margin-right:4px;"></span>Non commencé</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#8a9fbf;margin-right:4px;"></span>Pas de visibilité</span>
    <span style="margin-left:auto;"><strong>DÉBUT</strong> = date de début &nbsp;|&nbsp; <strong>FIN</strong> = deadline</span>
  `;
}

function renderDeadlines() {
  const list = document.getElementById("deadlinesList");
  if (!list) return;

  const upcoming = allProjets
    .filter((p) => p.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 6);

  if (upcoming.length === 0) {
    list.innerHTML =
      '<div style="color:#8a9fbf;font-size:13px;padding:12px 0;">Aucune échéance à venir</div>';
    return;
  }

  list.innerHTML = upcoming
    .map((p) => {
      const cfg = AGENDA_STATUT_COLOR[p.statut] || {
        dot: "blue",
        badge: "en-cours",
      };
      const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
      return `<div class="deadline-item" onclick="window.location.href='/projets/edit/${p.id || ""}'">
      <div class="dl-dot ${cfg.dot}"></div>
      <div class="dl-body">
        <div class="dl-name">${p.nom}</div>
        <div class="dl-meta">Échéance · ${formatDate(p.deadline)}</div>
      </div>
      <span class="dl-badge ${cfg.badge}">${lbl}</span>
    </div>`;
    })
    .join("");
}

function setupMonthTabs() {
  // Render all 12 month tabs dynamically
  const tabsEl = document.getElementById("monthTabs");
  if (tabsEl) {
    tabsEl.innerHTML = MONTHS_SHORT.map(
      (m, i) =>
        `<div class="mtab${i === currentMonth ? " active" : ""}" data-m="${i}">${m}</div>`,
    ).join("");
  }

  // Month click
  document.querySelectorAll(".mtab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".mtab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentMonth = parseInt(tab.dataset.m);
      renderCalendar();
      renderDeadlines();
    });
  });

  // Year label init
  updateYearLabel();

  // Previous year
  const prevBtn = document.getElementById("prevYear");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentYear--;
      updateYearLabel();
      renderCalendar();
      renderDeadlines();
    });
  }

  // Next year
  const nextBtn = document.getElementById("nextYear");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentYear++;
      updateYearLabel();
      renderCalendar();
      renderDeadlines();
    });
  }
}

function updateYearLabel() {
  const el = document.getElementById("yearLabel");
  if (el) el.textContent = currentYear;
  // Also disable prev if too far back (optional guard)
  const prevBtn = document.getElementById("prevYear");
  if (prevBtn) prevBtn.style.opacity = currentYear <= 2020 ? "0.3" : "1";
}

function setupSearch() {
  const input = document.getElementById("agendaSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    if (!q) {
      renderCalendar();
      renderDeadlines();
      return;
    }
    const filtered = allProjets.filter((p) => p.nom.toLowerCase().includes(q));
    const list = document.getElementById("deadlinesList");
    if (!list) return;
    list.innerHTML =
      filtered.length === 0
        ? '<div style="color:#8a9fbf;font-size:13px;">Aucun résultat</div>'
        : filtered
            .map((p) => {
              const cfg = AGENDA_STATUT_COLOR[p.statut] || {
                dot: "blue",
                badge: "en-cours",
              };
              const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
              return `<div class="deadline-item" onclick="window.location.href='/projets/edit/${p.id || ""}'">
            <div class="dl-dot ${cfg.dot}"></div>
            <div class="dl-body">
              <div class="dl-name">${p.nom}</div>
              <div class="dl-meta">${p.dateDebut ? "Début · " + formatDate(p.dateDebut) : ""} ${p.deadline ? "· Fin · " + formatDate(p.deadline) : ""}</div>
            </div>
            <span class="dl-badge ${cfg.badge}">${lbl}</span>
          </div>`;
            })
            .join("");
  });
}

function getProjetEvClass(statut) {
  const map = {
    EN_COURS: "ev-blue",
    CLOTURE: "ev-green",
    NON_COMMENCE: "ev-orange",
    PAS_DE_VISIBILITE: "ev-teal",
  };
  return map[statut] || "ev-blue";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
