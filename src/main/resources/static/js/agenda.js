// Auth helpers
function checkAuth() {
  return true; // On désactive la vérification pour l'instant
}

function getAuthHeaders() {
  return { 
    'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
    'Content-Type': 'application/json' 
  };
}

function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.querySelectorAll('.sidebar-name, .user-chip-name')
    .forEach(el => el.textContent = (user.prenom || 'Admin') + ' ' + (user.nom || ''));
  document.querySelectorAll('.sidebar-role, .user-chip-role')
    .forEach(el => el.textContent = user.role || 'ADMIN');
}

// ── Agenda JavaScript ──────────────────────────────────────────────────────
const DAYS_FR = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin',
                   'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Août','Sep','Oct','Nov','Déc'];

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

// Données fictives pour tester
let allProjets = [
  { nom: 'Projet Alpha', statut: 'EN_COURS', dateDebut: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-01`, deadline: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-15` },
  { nom: 'BEA Web', statut: 'EN_ATTENTE', dateDebut: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-05`, deadline: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-20` },
  { nom: 'Audit', statut: 'TERMINE', dateDebut: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-10`, deadline: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-14` },
  { nom: 'Migration', statut: 'EN_COURS', dateDebut: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-12`, deadline: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-28` },
];

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgenda);
} else {
  initAgenda();
}

async function initAgenda() {
  loadUserInfo();
  await loadSidebarBadges();
  await loadProjets();
  renderCalendar();
  renderDeadlines();
  setupMonthTabs();
  setupSearch();
}

async function loadProjets() {
  try {
    const resp = await fetch('/api/projets/all', { headers: getAuthHeaders() });
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.length > 0) allProjets = data;
    }
  } catch(e) {}
}

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
  } catch(e) {}
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  document.getElementById('calendarTitle').textContent =
    `AGENDA — ${MONTHS_FR[currentMonth]} ${currentYear}`;
  document.getElementById('weekLabel').textContent = '';

  const today = new Date();
  today.setHours(0,0,0,0);

  const firstDay = new Date(currentYear, currentMonth, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let html = '';

  DAYS_FR.forEach(d => {
    html += `<div class="cal-day-header" style="font-size:12px;padding:8px 4px;">${d}</div>`;
  });

  for (let i = 0; i < startDow; i++) {
    html += `<div class="cal-cell" style="background:#fafbff;height:90px;"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentYear, currentMonth, day);
    cellDate.setHours(0,0,0,0);
    const isToday = cellDate.getTime() === today.getTime();

    const dayProjets = allProjets.filter(p => {
      if (!p.dateDebut && !p.deadline) return false;
      const debut    = p.dateDebut ? new Date(p.dateDebut) : null;
      const deadline = p.deadline  ? new Date(p.deadline)  : null;
      if (debut)    debut.setHours(0,0,0,0);
      if (deadline) deadline.setHours(0,0,0,0);
      return (debut && debut.getTime() === cellDate.getTime()) ||
             (deadline && deadline.getTime() === cellDate.getTime()) ||
             (debut && deadline && cellDate >= debut && cellDate <= deadline);
    });

    html += `<div class="cal-cell" style="height:90px;vertical-align:top;padding:4px;">
      <div style="font-size:13px;font-weight:${isToday?'700':'500'};color:${isToday?'#fff':'#2d4a7a'};
        background:${isToday?'#5bb8e8':'transparent'};width:22px;height:22px;border-radius:50%;
        display:inline-flex;align-items:center;justify-content:center;margin-bottom:3px;">
        ${day}
      </div>`;

    dayProjets.slice(0,2).forEach(p => {
      const isDebut    = p.dateDebut && new Date(p.dateDebut).toDateString() === cellDate.toDateString();
      const isDeadline = p.deadline  && new Date(p.deadline).toDateString()  === cellDate.toDateString();
      const color = getProjetColor(p.statut);
      const badge = isDebut ? 'DÉBUT' : (isDeadline ? 'FIN' : '');
      html += `<div class="cal-event ${color}" style="margin-bottom:2px;font-size:10px;padding:2px 5px;border-radius:4px;">
        ${p.nom.length > 12 ? p.nom.substring(0,12)+'…' : p.nom}
        ${badge ? `<span style="font-size:9px;font-weight:700;margin-left:3px;opacity:0.8;">${badge}</span>` : ''}
      </div>`;
    });

    if (dayProjets.length > 2) {
      html += `<div style="font-size:9px;color:#8a9fbf;">+${dayProjets.length-2} autres</div>`;
    }

    html += `</div>`;
  }

  const totalCells = startDow + daysInMonth;
  const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < remaining; i++) {
    html += `<div class="cal-cell" style="background:#fafbff;height:90px;"></div>`;
  }

  grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
  grid.innerHTML = html;
  renderLegend();
}

function renderLegend() {
  let legend = document.getElementById('calendarLegend');
  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'calendarLegend';
    legend.style.cssText = 'display:flex;gap:16px;padding:10px 20px;font-size:11px;color:#4a6080;border-top:1px solid #e8f0f8;';
    document.querySelector('.agenda-card').appendChild(legend);
  }
  legend.innerHTML = `
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#1a5fa8;margin-right:4px;"></span>En cours</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#8a9fbf;margin-right:4px;"></span>En attente</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#42c97e;margin-right:4px;"></span>Terminé</span>
    <span style="margin-left:auto;"><strong>DÉBUT</strong> = date de début &nbsp;|&nbsp; <strong>FIN</strong> = deadline</span>
  `;
}

function renderDeadlines() {
  const list = document.getElementById('deadlinesList');
  if (!list) return;

  const upcoming = allProjets
    .filter(p => p.deadline)
    .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0,5);

  if (upcoming.length === 0) {
    list.innerHTML = '<div style="color:#8a9fbf;font-size:13px;padding:12px 0;">Aucune échéance à venir</div>';
    return;
  }

  list.innerHTML = upcoming.map(p => `
    <div class="deadline-item">
      <div class="dl-dot ${statusDotClass(p.statut)}"></div>
      <div class="dl-body">
        <div class="dl-name">${p.nom}</div>
        <div class="dl-meta">Échéance · ${formatDate(p.deadline)}</div>
      </div>
      <span class="dl-badge ${statusBadgeClass(p.statut)}">${statusLabel(p.statut)}</span>
    </div>`).join('');
}

function setupMonthTabs() {
  document.querySelectorAll('.mtab').forEach(tab => {
    const m = parseInt(tab.dataset.m);
    tab.classList.toggle('active', m === currentMonth);
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMonth = parseInt(tab.dataset.m);
      renderCalendar();
      renderDeadlines();
    });
  });
}

function setupSearch() {
  const input = document.getElementById('agendaSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    if (!q) { renderCalendar(); renderDeadlines(); return; }
    const filtered = allProjets.filter(p => p.nom.toLowerCase().includes(q));
    const list = document.getElementById('deadlinesList');
    if (!list) return;
    list.innerHTML = filtered.length === 0
      ? '<div style="color:#8a9fbf;font-size:13px;">Aucun résultat</div>'
      : filtered.map(p => `
        <div class="deadline-item">
          <div class="dl-dot ${statusDotClass(p.statut)}"></div>
          <div class="dl-body">
            <div class="dl-name">${p.nom}</div>
            <div class="dl-meta">${p.dateDebut ? 'Début · ' + formatDate(p.dateDebut) : ''} ${p.deadline ? '· Fin · ' + formatDate(p.deadline) : ''}</div>
          </div>
          <span class="dl-badge ${statusBadgeClass(p.statut)}">${statusLabel(p.statut)}</span>
        </div>`).join('');
  });
}

function getProjetColor(statut) {
  if (!statut) return 'ev-blue';
  const s = statut.toUpperCase();
  if (s.includes('COURS'))   return 'ev-blue';
  if (s.includes('ATTENTE')) return 'ev-teal';
  return 'ev-green';
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

function statusLabel(statut) {
  if (!statut) return '';
  const s = statut.toUpperCase();
  if (s.includes('COURS'))   return 'En cours';
  if (s.includes('ATTENTE')) return 'En attente';
  return 'Terminé';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}