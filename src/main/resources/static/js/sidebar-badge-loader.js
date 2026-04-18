// ── SIDEBAR BADGE LOADER ──────────────────────────────────────────────────
// Chargé automatiquement. Met à jour badges sidebar : statuts projets + remarques.

async function loadSidebarBadges() {
  try {
    const resp = await fetch("/api/dashboard/stats", {
      headers: getAuthHeaders(),
    });
    if (!resp.ok) return;
    const stats = await resp.json();

    const b = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = val || 0;
        el.style.display = (val || 0) > 0 ? "flex" : "none";
      }
    };
    b("badge-encours", stats.EN_COURS);
    b("badge-cloture", stats.CLOTURE);
    b("badge-noncommence", stats.NON_COMMENCE);
    b("badge-pasvisibilite", stats.PAS_DE_VISIBILITE);
  } catch (e) {}
}

async function loadRemarquesBadge() {
  try {
    const projRes = await fetch("/api/projets/all", {
      headers: getAuthHeaders(),
    });
    if (!projRes.ok) return;
    const projets = await projRes.json();
    let total = 0;
    await Promise.all(
      projets.map(async (p) => {
        try {
          const r = await fetch(`/api/projets/${p.id}/remarques`, {
            headers: getAuthHeaders(),
          });
          if (r.ok) {
            const list = await r.json();
            total += list.length;
          }
        } catch (e) {}
      }),
    );
    const badge = document.getElementById("sidebarRemarqueBadge");
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? "flex" : "none";
    }
    const dot = document.getElementById("remarqueDot");
    if (dot) dot.style.display = total > 0 ? "block" : "none";
  } catch (e) {}
}
