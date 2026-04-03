// ── Agenda JavaScript ──────────────────────────────────────────────────────
// Place this file at: src/main/resources/static/js/agenda.js

const DAYS = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                   'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// Week to display: Mon Feb 10 – Sun Feb 16 (adjust as needed)
let currentWeekStart = new Date(2025, 1, 10); // Feb 10 2025

// Sample events keyed by "YYYY-M-D HH"
// Replace / extend with real API data
const SAMPLE_EVENTS = [
  { date: new Date(2025,1,11), startHour: 8, endHour: 9,  title: 'Réunion DG',    color: 'ev-blue' },
  { date: new Date(2025,1,12), startHour: 9, endHour: 11, title: 'AlgerPort P2',  color: 'ev-teal' },
  { date: new Date(2025,1,12), startHour:11, endHour: 12, title: 'Point hebdo',   color: 'ev-teal' },
  { date: new Date(2025,1,14), startHour: 9, endHour: 10, title: 'Audit Q4',      color: 'ev-orange' },
  { date: new Date(2025,1,10), startHour:10, endHour: 11, title: 'CNAT Revue',    color: 'ev-green' },
];

const SAMPLE_DEADLINES = [
  { name: 'AlgerPort — Phase 2', meta: 'Échéance · 28 fév · Équipe: 4 membres', badge: 'En cours',   dotClass: 'blue',   badgeClass: 'en-cours', url: '/projets-list' },
  { name: 'Audit conformité Q4',  meta: 'Échéance · 14 fév · Priorité haute',    badge: 'Urgent',    dotClass: 'orange', badgeClass: 'urgent',   url: '/projets-list' },
  { name: 'CNAT 2025 — Livrable final', meta: 'Échéance · 20 fév · Externe',     badge: 'À valider', dotClass: 'green',  badgeClass: 'valider',  url: '/projets-list' },
];

// ── Init ────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgenda);
} else {
  initAgenda();
}

async function initAgenda() {
  if (!checkAuth()) return;
  loadUserInfo();
  await loadSidebarBadges();
  renderCalendar();
  renderDeadlines();
  setupMonthTabs();
}

// ── Sidebar badges ───────────────────────────────────────────────────────────
async function loadSidebarBadges() {
  try {
    const resp = await fetch('/api/dashboard/stats', { headers: getAuthHeaders() });
    if (!resp.ok) return;
    const stats = await resp.json();
    const b1 = document.getElementById('badge-encours');
    const b2 = document.getElementById('badge-attente');
    const b3 = document.getElementById('badge-termine');
    if (b1) b1.textContent = stats.EN_COURS  || 0;
    if (b2) b2.textContent = stats.EN_ATTENTE || 0;
    if (b3) b3.textContent = stats.TERMINE    || 0;
  } catch(e) { /* silent */ }
}

// ── Calendar rendering ───────────────────────────────────────────────────────
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  // Update title
  const monthIdx = currentWeekStart.getMonth();
  const year     = currentWeekStart.getFullYear();
  const weekNum  = getWeekNumber(currentWeekStart);
  document.getElementById('calendarTitle').textContent =
    `AGENDA — ${MONTHS_FR[monthIdx]} ${year}`;
  document.getElementById('weekLabel').textContent = `Semaine ${weekNum}`;

  const today = new Date();
  today.setHours(0,0,0,0);

  // Build week dates Mon→Sun
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    weekDates.push(d);
  }

  // Hours 08:00 – 17:00
  const hours = [8,9,10,11,12,13,14,15,16,17];

  let html = '';

  // Header row
  html += '<div class="time-col-header"></div>';
  DAYS.forEach((day, i) => {
    const d = weekDates[i];
    const isToday = d.getTime() === today.getTime();
    html += `<div class="cal-day-header${isToday ? ' today' : ''}">
      ${day}<span class="day-num">${d.getDate()}</span>
    </div>`;
  });

  // Time rows
  hours.forEach(h => {
    html += `<div class="time-slot">${String(h).padStart(2,'0')}:00</div>`;
    weekDates.forEach(d => {
      const ev = SAMPLE_EVENTS.find(e => {
        const sd = new Date(e.date); sd.setHours(0,0,0,0);
        return sd.getTime() === d.getTime() && e.startHour === h;
      });
      if (ev) {
        html += `<div class="cal-cell">
          <div class="cal-event ${ev.color}">
            <span class="ev-title">${ev.title}</span>
            <span class="ev-time">${ev.startHour}h–${ev.endHour}h</span>
          </div>
        </div>`;
      } else {
        html += '<div class="cal-cell"></div>';
      }
    });
  });

  grid.innerHTML = html;
}

// ── Deadlines ────────────────────────────────────────────────────────────────
function renderDeadlines() {
  const list = document.getElementById('deadlinesList');
  if (!list) return;

  // Try to load from API first, fall back to samples
  fetch('/api/projets?page=0&size=5', { headers: getAuthHeaders() })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.content && data.content.length > 0) {
        list.innerHTML = data.content.map(p => `
          <div class="deadline-item" onclick="window.location.href='/projets-list'">
            <div class="dl-dot ${statusDotClass(p.statut)}"></div>
            <div class="dl-body">
              <div class="dl-name">${p.nom}</div>
              <div class="dl-meta">Échéance · ${formatDate(p.deadline)} · ${p.typeProjet || ''}</div>
            </div>
            <span class="dl-badge ${statusBadgeClass(p.statut)}">${p.statut || ''}</span>
          </div>`).join('');
      } else {
        renderSampleDeadlines(list);
      }
    })
    .catch(() => renderSampleDeadlines(list));
}

function renderSampleDeadlines(list) {
  list.innerHTML = SAMPLE_DEADLINES.map(d => `
    <div class="deadline-item" onclick="window.location.href='${d.url}'">
      <div class="dl-dot ${d.dotClass}"></div>
      <div class="dl-body">
        <div class="dl-name">${d.name}</div>
        <div class="dl-meta">${d.meta}</div>
      </div>
      <span class="dl-badge ${d.badgeClass}">${d.badge}</span>
    </div>`).join('');
}

// ── Month tabs ────────────────────────────────────────────────────────────────
function setupMonthTabs() {
  document.querySelectorAll('.mtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const m = parseInt(tab.dataset.m);
      // Move to first Monday of selected month in current year
      const year = currentWeekStart.getFullYear();
      const firstDay = new Date(year, m, 1);
      const dayOfWeek = firstDay.getDay(); // 0=Sun
      const diff = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
      currentWeekStart = new Date(year, m, 1 + diff);
      renderCalendar();
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate()} ${['jan','fév','mar','avr','mai','jun','jul','août','sep','oct','nov','déc'][d.getMonth()]}`;
}

function statusDotClass(statut) {
  if (!statut) return 'blue';
  const s = statut.toUpperCase();
  if (s.includes('COURS'))   return 'blue';
  if (s.includes('ATTENTE')) return 'orange';
  return 'green';
}

function statusBadgeClass(statut) {
  if (!statut) return 'en-cours';
  const s = statut.toUpperCase();
  if (s.includes('COURS'))   return 'en-cours';
  if (s.includes('ATTENTE')) return 'urgent';
  return 'valider';
}
