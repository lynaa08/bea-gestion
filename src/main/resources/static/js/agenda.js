// ═══════════════════════════════════════════════════════════════
//  AGENDA.JS — BEA
//  ✅ Vue mois + vue semaine
//  ✅ Clic projet → modal détails (membres, dates, priorité, statut)
//  ✅ Projets en retard détectés automatiquement
//  ✅ Recherche synchronisée
// ═══════════════════════════════════════════════════════════════

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

const AGENDA_STATUT_LABEL = {
  EN_COURS: "En cours",
  CLOTURE: "Clôturé",
  NON_COMMENCE: "Non commencé",
  PAS_DE_VISIBILITE: "Pas de visibilité",
};
const AGENDA_STATUT_COLOR = {
  EN_COURS: { ev: "ev-blue", dot: "blue", badge: "en-cours" },
  CLOTURE: { ev: "ev-green", dot: "green", badge: "valider" },
  NON_COMMENCE: { ev: "ev-orange", dot: "orange", badge: "urgent" },
  PAS_DE_VISIBILITE: { ev: "ev-teal", dot: "blue", badge: "en-cours" },
};
const PRIORITE_CFG = {
  CRITIQUE: { bg: "#fef2f2", color: "#ef4444", icon: "🔴" },
  HAUTE: { bg: "#fff7ed", color: "#f97316", icon: "🟠" },
  MOYENNE: { bg: "#fefce8", color: "#eab308", icon: "🟡" },
  BASSE: { bg: "#f0fdf4", color: "#22c55e", icon: "🟢" },
};

let allProjets = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentView = "month";
let weekStart = getMonday(new Date());

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  if (!checkAuth()) return;

  injectStyles();
  buildViewToggle();
  buildOverdueSection();

  renderCalendar();
  renderDeadlines();
  renderOverdue();
  setupMonthTabs();
  setupSearch();

  await loadProjets();

  renderCalendar();
  renderDeadlines();
  renderOverdue();
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

// ══════════════════════════════════════════════════════════════
//  VUE MOIS
// ══════════════════════════════════════════════════════════════
function renderMonthView(projets) {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  document.getElementById("calendarTitle").textContent =
    `AGENDA — ${MONTHS_FR[currentMonth]} ${currentYear}`;

  const weekLbl = document.getElementById("weekLabel");
  if (weekLbl) weekLbl.textContent = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(currentYear, currentMonth, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let html = "";
  DAYS_FR.forEach((d) => {
    html += `<div class="cal-day-header">${d}</div>`;
  });
  for (let i = 0; i < startDow; i++)
    html += `<div class="cal-cell cal-empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonth, day);
    cellDate.setHours(0, 0, 0, 0);
    const isToday = cellDate.getTime() === today.getTime();
    const dayProjets = getProjetsForDay(projets, cellDate);

    html += `<div class="cal-cell${isToday ? " cal-cell-today" : ""}">
      <div class="cal-day-num${isToday ? " cal-today" : ""}">${day}</div>`;

    dayProjets.slice(0, 3).forEach((p) => {
      const isDebut = p.dateDebut && sameDay(new Date(p.dateDebut), cellDate);
      const isDeadline = p.deadline && sameDay(new Date(p.deadline), cellDate);
      const isLate =
        p.deadline && new Date(p.deadline) < today && p.statut !== "CLOTURE";
      const evClass = isLate ? "ev-red" : getProjetEvClass(p.statut);
      const badge = isDebut ? "D" : isDeadline ? "F" : "";
      html += `<div class="cal-ev ${evClass}" onclick="openModal(${p.id})" title="${p.nom}">
        <span class="cal-ev-name">${truncate(p.nom, 10)}</span>
        ${badge ? `<span class="cal-ev-badge">${badge}</span>` : ""}
        ${isLate && isDeadline ? `<span class="cal-ev-badge late-badge">!</span>` : ""}
      </div>`;
    });
    if (dayProjets.length > 3)
      html += `<div class="cal-more">+${dayProjets.length - 3}</div>`;
    html += `</div>`;
  }

  const totalCells = startDow + daysInMonth;
  const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < trailing; i++)
    html += `<div class="cal-cell cal-empty"></div>`;

  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  grid.innerHTML = html;
  renderLegend();
}

// ══════════════════════════════════════════════════════════════
//  VUE SEMAINE
// ══════════════════════════════════════════════════════════════
function renderWeekView(projets) {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  document.getElementById("calendarTitle").textContent =
    `SEMAINE — ${fmtShort(weekStart)} → ${fmtShort(weekEnd)}`;
  const weekLbl = document.getElementById("weekLabel");
  if (weekLbl) weekLbl.textContent = `Semaine ${getWeekNumber(weekStart)}`;

  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const isT = d.getTime() === today.getTime();
    html += `<div class="cal-day-header week-day-header${isT ? " today" : ""}">
      <span>${DAYS_FR[i]}</span>
      <span class="day-num${isT ? " today-num" : ""}">${d.getDate()}</span>
    </div>`;
  }
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dayProjets = getProjetsForDay(projets, d);
    html += `<div class="week-all-day-cell">`;
    dayProjets.forEach((p) => {
      const isDebut = p.dateDebut && sameDay(new Date(p.dateDebut), d);
      const isDeadline = p.deadline && sameDay(new Date(p.deadline), d);
      const isLate =
        p.deadline && new Date(p.deadline) < today && p.statut !== "CLOTURE";
      const evClass = isLate ? "ev-red" : getProjetEvClass(p.statut);
      const badge = isDebut ? "Début" : isDeadline ? "Fin" : "";
      html += `<div class="cal-ev week-ev ${evClass}" onclick="openModal(${p.id})">
        <span class="cal-ev-name">${truncate(p.nom, 18)}</span>
        ${badge ? `<span class="cal-ev-badge">${badge}</span>` : ""}
        ${isLate ? `<span class="cal-ev-badge late-badge">RETARD</span>` : ""}
      </div>`;
    });
    html += `</div>`;
  }
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  grid.innerHTML = html;
  renderLegend();
  buildWeekNav();
}

function renderCalendar(projets) {
  const src = projets || allProjets;
  currentView === "week" ? renderWeekView(src) : renderMonthView(src);
}

// ══════════════════════════════════════════════════════════════
//  LÉGENDE
// ══════════════════════════════════════════════════════════════
function renderLegend() {
  let legend = document.getElementById("calendarLegend");
  if (!legend) {
    legend = document.createElement("div");
    legend.id = "calendarLegend";
    legend.className = "cal-legend";
    const card = document.querySelector(".agenda-card");
    if (card) card.appendChild(legend);
  }
  legend.innerHTML = `
    <span class="leg-item"><span class="leg-dot" style="background:#1a5fa8"></span>En cours</span>
    <span class="leg-item"><span class="leg-dot" style="background:#22c55e"></span>Clôturé</span>
    <span class="leg-item"><span class="leg-dot" style="background:#f59e0b"></span>Non commencé</span>
    <span class="leg-item"><span class="leg-dot" style="background:#8a9fbf"></span>Pas de visibilité</span>
    <span class="leg-item"><span class="leg-dot" style="background:#ef4444"></span>En retard !</span>
    <span class="leg-sep"></span>
    <span class="leg-hint"><strong>D</strong> = début &nbsp;·&nbsp; <strong>F</strong> = deadline</span>
  `;
}

// ══════════════════════════════════════════════════════════════
//  MODAL DÉTAILS PROJET
// ══════════════════════════════════════════════════════════════
function openModal(projetId) {
  const p = allProjets.find((x) => x.id === projetId);
  if (!p) return;

  const cfg = AGENDA_STATUT_COLOR[p.statut] || { badge: "en-cours" };
  const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dead = p.deadline ? new Date(p.deadline) : null;
  if (dead) dead.setHours(0, 0, 0, 0);
  const isLate = dead && dead < today && p.statut !== "CLOTURE";
  const daysLate = isLate ? Math.ceil((today - dead) / 86400000) : 0;
  const daysLeft = dead && !isLate ? Math.ceil((dead - today) / 86400000) : 0;

  // Priorité config
  const pCfg = p.priorite ? PRIORITE_CFG[p.priorite.toUpperCase()] || {} : {};

  // ── Membres : l'API renvoie membresNoms (List<String> : "Prénom Nom (matricule)")
  const membresHtml = (() => {
    const noms = p.membresNoms || [];
    if (noms.length === 0) {
      return `<div style="color:#8a9fbf;font-size:12px;font-style:italic">Aucun membre assigné</div>`;
    }
    return noms
      .map((fullName) => {
        // extraire initiales depuis "Prénom Nom (matricule)"
        const clean = fullName.replace(/\(.*?\)/g, "").trim();
        const parts = clean.split(" ");
        const initials = parts
          .map((w) => w.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");
        return `<div class="modal-member-chip">
        <div class="member-avatar">${initials}</div>
        <span>${fullName}</span>
      </div>`;
      })
      .join("");
  })();

  // ── Alerte retard
  const retardHtml = isLate
    ? `
    <div class="modal-overdue-alert">
      ⚠ Ce projet a dépassé sa deadline de <strong>${daysLate} jour${daysLate > 1 ? "s" : ""}</strong> et n'est pas encore clôturé.
    </div>`
    : "";

  // ── Compte à rebours
  const countdownHtml =
    dead && !isLate
      ? `
    <div class="modal-countdown${daysLeft <= 7 ? " urgent" : ""}">
       ${daysLeft === 0 ? "Deadline <strong>aujourd'hui !</strong>" : `Il reste <strong>${daysLeft} jour${daysLeft > 1 ? "s" : ""}</strong> avant la deadline`}
    </div>`
      : "";

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "projetModal";
  overlay.innerHTML = `
    <div class="modal-box">

      <!-- HEAD -->
      <div class="modal-head">
        <div style="flex:1;min-width:0">
          <div class="modal-title">${p.nom || "—"}</div>
          ${p.chefProjetNom ? `<div class="modal-subtitle">Chef : ${p.chefProjetNom}</div>` : ""}
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <!-- Badges statut + priorité + retard -->
        <div class="modal-badge-row">
          <span class="dl-badge ${cfg.badge}">${lbl}</span>
          ${p.type ? `<span class="modal-type-badge">${p.type}</span>` : ""}
          ${p.priorite ? `<span class="modal-prio-badge" style="background:${pCfg.bg || "#f5f5f5"};color:${pCfg.color || "#666"}">${pCfg.icon || ""} ${p.priorite}</span>` : ""}
          ${isLate ? `<span class="modal-late-badge">⚠ En retard +${daysLate}j</span>` : ""}
        </div>

        <!-- Alerte retard -->
        ${retardHtml}

        <!-- Compte à rebours -->
        ${countdownHtml}

        <!-- Description -->
        ${p.description ? `<div class="modal-desc">${p.description}</div>` : ""}

        <!-- Dates & infos clés -->
        <div class="modal-dates">
          <div class="modal-date-item">
            <span class="modal-date-label"> Date de début</span>
            <span class="modal-date-val">${formatDate(p.dateDebut)}</span>
          </div>
          <div class="modal-date-item">
            <span class="modal-date-label"> Deadline</span>
            <span class="modal-date-val${isLate ? " late" : daysLeft <= 7 && daysLeft >= 0 ? " soon" : ""}">${formatDate(p.deadline)}</span>
          </div>
          <div class="modal-date-item">
            <span class="modal-date-label"> Priorité</span>
            <span class="modal-date-val" style="${pCfg.color ? "color:" + pCfg.color : ""}">${pCfg.icon || ""} ${p.priorite || "—"}</span>
          </div>
          <div class="modal-date-item">
            <span class="modal-date-label"> Statut</span>
            <span class="modal-date-val">${lbl}</span>
          </div>
          <div class="modal-date-item">
            <span class="modal-date-label"> Création</span>
            <span class="modal-date-val">${formatDate(p.dateCreation)}</span>
          </div>
          <div class="modal-date-item">
            <span class="modal-date-label"> Membres</span>
            <span class="modal-date-val">${(p.membresNoms || []).length}</span>
          </div>
        </div>

        <!-- Membres -->
        <div class="modal-members-title">Membres du projet</div>
        <div class="modal-members">
          ${membresHtml}
        </div>

      </div>

      <!-- FOOTER -->
      <div class="modal-foot">
        <button class="modal-btn-secondary" onclick="closeModal()">Fermer</button>
        <button class="modal-btn-primary" onclick="window.location.href='/projets/edit/${p.id}'">
           Modifier le projet
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeModal() {
  const m = document.getElementById("projetModal");
  if (!m) return;
  m.classList.remove("open");
  setTimeout(() => m.remove(), 200);
}

// ══════════════════════════════════════════════════════════════
//  PROJETS EN RETARD
// ══════════════════════════════════════════════════════════════
function renderOverdue() {
  const list = document.getElementById("overdueList");
  if (!list) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const late = allProjets
    .filter(
      (p) =>
        p.deadline && new Date(p.deadline) < today && p.statut !== "CLOTURE",
    )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const section = document.getElementById("overdueSection");
  if (section) section.style.display = late.length === 0 ? "none" : "";
  const countEl = document.getElementById("overdueCount");
  if (countEl) countEl.textContent = late.length;

  if (late.length === 0) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = late
    .map((p) => {
      const cfg = AGENDA_STATUT_COLOR[p.statut] || {
        dot: "blue",
        badge: "en-cours",
      };
      const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
      const daysLate = Math.ceil((today - new Date(p.deadline)) / 86400000);
      return `<div class="deadline-item overdue-item" onclick="openModal(${p.id})">
      <div class="dl-dot ${cfg.dot}"></div>
      <div class="dl-body">
        <div class="dl-name">${p.nom}</div>
        <div class="dl-meta">Deadline dépassée · ${formatDate(p.deadline)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span class="dl-badge ${cfg.badge}">${lbl}</span>
        <div class="late-days">+${daysLate}j de retard</div>
      </div>
    </div>`;
    })
    .join("");
}

// ══════════════════════════════════════════════════════════════
//  PROCHAINES ÉCHÉANCES
// ══════════════════════════════════════════════════════════════
function renderDeadlines(projets) {
  const list = document.getElementById("deadlinesList");
  if (!list) return;

  const src = projets || allProjets;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = src
    .filter((p) => p.deadline && new Date(p.deadline) >= today)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 6);

  if (upcoming.length === 0) {
    list.innerHTML = `<div style="color:#8a9fbf;font-size:13px;padding:12px 0;">Aucune échéance à venir</div>`;
    return;
  }

  list.innerHTML = upcoming
    .map((p) => {
      const cfg = AGENDA_STATUT_COLOR[p.statut] || {
        dot: "blue",
        badge: "en-cours",
      };
      const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
      const days = Math.ceil((new Date(p.deadline) - today) / 86400000);
      const urgentStyle = days <= 7 ? "border-left:3px solid #f59e0b" : "";
      return `<div class="deadline-item" onclick="openModal(${p.id})" style="${urgentStyle}">
      <div class="dl-dot ${cfg.dot}"></div>
      <div class="dl-body">
        <div class="dl-name">${p.nom}</div>
        <div class="dl-meta">Échéance · ${formatDate(p.deadline)} ${days <= 7 ? `<strong style="color:#f59e0b">· ${days}j restants</strong>` : ""}</div>
      </div>
      <span class="dl-badge ${cfg.badge}">${lbl}</span>
    </div>`;
    })
    .join("");
}

// ══════════════════════════════════════════════════════════════
//  NAVIGATION MOIS + TABS
// ══════════════════════════════════════════════════════════════
function setupMonthTabs() {
  const tabsEl = document.getElementById("monthTabs");
  if (tabsEl) {
    tabsEl.innerHTML = MONTHS_SHORT.map(
      (m, i) =>
        `<div class="mtab${i === currentMonth ? " active" : ""}" data-m="${i}">${m}</div>`,
    ).join("");
  }
  document.querySelectorAll(".mtab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".mtab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentMonth = parseInt(tab.dataset.m);
      if (currentView === "week")
        weekStart = getMonday(new Date(currentYear, currentMonth, 1));
      renderCalendar();
      renderDeadlines();
    });
  });
  updateYearLabel();
  document.getElementById("prevYear")?.addEventListener("click", () => {
    currentYear--;
    updateYearLabel();
    if (currentView === "week")
      weekStart = getMonday(new Date(currentYear, currentMonth, 1));
    renderCalendar();
    renderDeadlines();
  });
  document.getElementById("nextYear")?.addEventListener("click", () => {
    currentYear++;
    updateYearLabel();
    if (currentView === "week")
      weekStart = getMonday(new Date(currentYear, currentMonth, 1));
    renderCalendar();
    renderDeadlines();
  });
}

function updateYearLabel() {
  const el = document.getElementById("yearLabel");
  if (el) el.textContent = currentYear;
  const prevBtn = document.getElementById("prevYear");
  if (prevBtn) prevBtn.style.opacity = currentYear <= 2020 ? "0.3" : "1";
}

// ══════════════════════════════════════════════════════════════
//  TOGGLE VUE
// ══════════════════════════════════════════════════════════════
function buildViewToggle() {
  const toolbar = document.querySelector(".agenda-toolbar");
  if (!toolbar || document.getElementById("viewToggle")) return;
  const wrap = document.createElement("div");
  wrap.id = "viewToggle";
  wrap.className = "view-toggle";
  wrap.innerHTML = `
    <button class="vtab active" data-v="month"> Mois</button>
    <button class="vtab"        data-v="week">Semaine</button>
  `;
  toolbar.insertBefore(wrap, toolbar.children[1]);
  wrap.querySelectorAll(".vtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      wrap
        .querySelectorAll(".vtab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.v;
      if (currentView === "week") {
        weekStart = getMonday(new Date(currentYear, currentMonth, 1));
        buildWeekNav();
      } else removeWeekNav();
      renderCalendar();
    });
  });
}

function buildWeekNav() {
  if (document.getElementById("weekNav")) return;
  const card = document.querySelector(".agenda-card");
  if (!card) return;
  const nav = document.createElement("div");
  nav.id = "weekNav";
  nav.className = "week-nav";
  nav.innerHTML = `
    <button class="week-nav-btn" id="prevWeek">&#8249; Semaine préc.</button>
    <button class="week-nav-btn" id="nextWeek">Semaine suiv. &#8250;</button>
  `;
  card.insertBefore(nav, card.querySelector("#calendarGrid"));
  document.getElementById("prevWeek").addEventListener("click", () => {
    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() - 7);
    currentMonth = weekStart.getMonth();
    currentYear = weekStart.getFullYear();
    updateMonthTabHighlight();
    renderCalendar();
    renderDeadlines();
  });
  document.getElementById("nextWeek").addEventListener("click", () => {
    weekStart = new Date(weekStart);
    weekStart.setDate(weekStart.getDate() + 7);
    currentMonth = weekStart.getMonth();
    currentYear = weekStart.getFullYear();
    updateMonthTabHighlight();
    renderCalendar();
    renderDeadlines();
  });
}
function removeWeekNav() {
  document.getElementById("weekNav")?.remove();
}
function updateMonthTabHighlight() {
  document.querySelectorAll(".mtab").forEach((t) => {
    t.classList.toggle("active", parseInt(t.dataset.m) === currentMonth);
  });
  updateYearLabel();
}

// ══════════════════════════════════════════════════════════════
//  RECHERCHE
// ══════════════════════════════════════════════════════════════
function setupSearch() {
  const input = document.getElementById("agendaSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    if (!q) {
      renderCalendar();
      renderDeadlines();
      renderOverdue();
      return;
    }
    const filtered = allProjets.filter((p) => p.nom.toLowerCase().includes(q));
    renderCalendar(filtered);
    const list = document.getElementById("deadlinesList");
    if (list) {
      list.innerHTML =
        filtered.length === 0
          ? `<div style="color:#8a9fbf;font-size:13px;">Aucun résultat</div>`
          : filtered
              .map((p) => {
                const cfg = AGENDA_STATUT_COLOR[p.statut] || {
                  dot: "blue",
                  badge: "en-cours",
                };
                const lbl = AGENDA_STATUT_LABEL[p.statut] || p.statut || "—";
                return `<div class="deadline-item" onclick="openModal(${p.id})">
              <div class="dl-dot ${cfg.dot}"></div>
              <div class="dl-body">
                <div class="dl-name">${p.nom}</div>
                <div class="dl-meta">
                  ${p.dateDebut ? "Début · " + formatDate(p.dateDebut) : ""}
                  ${p.deadline ? " · Fin · " + formatDate(p.deadline) : ""}
                </div>
              </div>
              <span class="dl-badge ${cfg.badge}">${lbl}</span>
            </div>`;
              })
              .join("");
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION EN RETARD (injectée dans le DOM)
// ══════════════════════════════════════════════════════════════
function buildOverdueSection() {
  const deadlinesSection = document.querySelector(".deadlines-section");
  if (!deadlinesSection || document.getElementById("overdueSection")) return;
  const section = document.createElement("div");
  section.id = "overdueSection";
  section.className = "deadlines-section";
  section.style.display = "none";
  section.innerHTML = `
    <div class="deadlines-title" style="color:#ef4444;">
      ⚠ Projets en retard
      <span id="overdueCount" style="
        background:#fef2f2;color:#ef4444;border:1px solid #fecaca;
        border-radius:10px;font-size:10px;padding:1px 7px;margin-left:6px;font-weight:700;
      "></span>
    </div>
    <div id="overdueList"></div>
  `;
  deadlinesSection.parentNode.insertBefore(section, deadlinesSection);
}

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════
function injectStyles() {
  const s = document.createElement("style");
  s.textContent = `
    /* View toggle */
    .view-toggle { display:flex; gap:3px; background:#f0f6ff; border:1.5px solid #d8e6f2; border-radius:10px; padding:3px; flex-shrink:0; }
    .vtab { border:none; background:transparent; padding:5px 14px; border-radius:7px; font-size:12px; font-weight:600; color:#4a6080; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .vtab.active { background:#0d2b6e; color:#fff; }
    .vtab:hover:not(.active) { background:#dbeafe; color:#0d2b6e; }

    /* Week nav */
    .week-nav { display:flex; justify-content:space-between; padding:8px 16px; background:#f8fafd; border-bottom:1px solid #e8f0f8; }
    .week-nav-btn { border:1px solid #d8e6f2; background:#fff; color:#0d2b6e; font-size:12px; font-weight:600; padding:5px 14px; border-radius:8px; cursor:pointer; transition:all .15s; }
    .week-nav-btn:hover { background:#0d2b6e; color:#fff; }
    .week-day-header { background:#f5f9ff; text-align:center; padding:8px 4px 6px; border-right:1px solid #e8f0f8; border-bottom:1px solid #e8f0f8; font-size:10px; font-weight:700; color:#4a6080; letter-spacing:.5px; }
    .week-day-header.today { background:#e8f4ff; }
    .week-day-header .day-num { display:block; font-size:20px; font-weight:800; color:#0d2b6e; margin-top:2px; }
    .week-day-header .day-num.today-num { background:#5bb8e8; color:#fff; width:32px; height:32px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin:4px auto 0; }
    .week-all-day-cell { border-right:1px solid #e8f0f8; border-bottom:1px solid #e8f0f8; min-height:110px; padding:6px 4px; background:#fff; overflow-y:auto; max-height:240px; }
    .week-ev { margin-bottom:4px; padding:4px 7px; font-size:11px; border-radius:6px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* Calendar cells */
    .cal-cell { border-right:1px solid #e8f0f8; border-bottom:1px solid #f0f6ff; min-height:100px; padding:3px; position:relative; box-sizing:border-box; overflow:hidden; vertical-align:top; }
    .cal-cell-today { background:#f0f8ff; }
    .cal-cell.cal-empty { background:#fafbff; }
    .cal-ev { cursor:pointer; }
    .ev-red { background:#fef2f2 !important; color:#ef4444 !important; border-left:2px solid #ef4444; }
    .late-badge { background:#ef4444 !important; color:#fff !important; }

    /* Legend */
    .cal-legend { display:flex; gap:16px; flex-wrap:wrap; padding:10px 20px; font-size:11px; color:#4a6080; border-top:1px solid #e8f0f8; align-items:center; }
    .leg-item { display:flex; align-items:center; gap:5px; }
    .leg-dot { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
    .leg-sep { flex:1; }
    .leg-hint { margin-left:auto; color:#8a9fbf; }

    /* Modal overlay */
    .modal-overlay { position:fixed; inset:0; background:rgba(13,43,110,.4); z-index:9999; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; }
    .modal-overlay.open { opacity:1; }
    .modal-box { background:#fff; border-radius:18px; width:500px; max-width:96vw; max-height:90vh; overflow-y:auto; box-shadow:0 24px 70px rgba(13,43,110,.22); transform:translateY(10px); transition:transform .2s; }
    .modal-overlay.open .modal-box { transform:translateY(0); }

    /* Modal head */
    .modal-head { display:flex; align-items:flex-start; padding:20px 22px 14px; border-bottom:1px solid #e8f0f8; gap:12px; }
    .modal-title { font-size:16px; font-weight:800; color:#0d2b6e; }
    .modal-subtitle { font-size:11px; color:#8a9fbf; margin-top:3px; }
    .modal-close { border:none; background:#f0f4fa; color:#4a6080; font-size:14px; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .modal-close:hover { background:#e0e8f8; color:#0d2b6e; }

    /* Modal body */
    .modal-body { padding:18px 22px; }
    .modal-badge-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
    .modal-type-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; background:#eef2ff; color:#3730a3; }
    .modal-prio-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:6px; }
    .modal-late-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:6px; background:#fef2f2; color:#ef4444; border:1px solid #fecaca; animation:pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

    /* Retard alert */
    .modal-overdue-alert { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:11px 14px; margin-bottom:12px; font-size:13px; color:#b91c1c; display:flex; gap:8px; align-items:flex-start; }
    .modal-countdown { background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:9px 14px; margin-bottom:12px; font-size:13px; color:#c2410c; }
    .modal-countdown.urgent { background:#fef2f2; border-color:#fecaca; color:#b91c1c; }

    /* Description */
    .modal-desc { font-size:13px; color:#4a6080; line-height:1.6; background:#f8fafd; border-radius:8px; padding:10px 14px; margin-bottom:14px; }

    /* Dates grid */
    .modal-dates { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
    .modal-date-item { background:#f5f9ff; border-radius:10px; padding:9px 12px; }
    .modal-date-label { display:block; font-size:10px; color:#8a9fbf; font-weight:600; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; }
    .modal-date-val { font-size:13px; font-weight:700; color:#0d2b6e; }
    .modal-date-val.late { color:#ef4444; }
    .modal-date-val.soon { color:#f59e0b; }

    /* Members */
    .modal-members-title { font-size:11px; font-weight:700; color:#4a6080; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
    .modal-members { display:flex; flex-wrap:wrap; gap:8px; }
    .modal-member-chip { display:flex; align-items:center; gap:6px; background:#f0f6ff; border-radius:20px; padding:4px 12px 4px 4px; font-size:12px; color:#2d4a7a; }
    .member-avatar { width:26px; height:26px; border-radius:50%; background:#0d2b6e; color:#fff; font-size:9px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

    /* Footer */
    .modal-foot { display:flex; justify-content:flex-end; gap:10px; padding:14px 22px; border-top:1px solid #e8f0f8; background:#f8fafd; }
    .modal-btn-secondary { border:1.5px solid #d8e6f2; background:#fff; color:#4a6080; font-size:13px; font-weight:600; padding:8px 18px; border-radius:8px; cursor:pointer; }
    .modal-btn-primary { border:none; background:#0d2b6e; color:#fff; font-size:13px; font-weight:600; padding:8px 18px; border-radius:8px; cursor:pointer; }
    .modal-btn-primary:hover { background:#1a4ba8; }

    /* Overdue */
    .overdue-item { border-left:3px solid #ef4444 !important; }
    .late-days { font-size:11px; font-weight:700; color:#ef4444; margin-top:3px; }
  `;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════
function getProjetsForDay(projets, cellDate) {
  return projets.filter((p) => {
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
}
function getProjetEvClass(statut) {
  return (
    {
      EN_COURS: "ev-blue",
      CLOTURE: "ev-green",
      NON_COMMENCE: "ev-orange",
      PAS_DE_VISIBILITE: "ev-teal",
    }[statut] || "ev-blue"
  );
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtShort(date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function truncate(str, n) {
  return str && str.length > n ? str.substring(0, n) + "…" : str || "";
}
function getMonday(date) {
  const d = new Date(date),
    day = d.getDay(),
    diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return Math.ceil(
    ((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7,
  );
}
