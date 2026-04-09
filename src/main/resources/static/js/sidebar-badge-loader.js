// ── SIDEBAR BADGE LOADER ──────────────────────────────────────────────────
// Add this function to your auth.js (or call it from every page's JS).
// It loads project counts and updates the sidebar badges on ALL pages.

async function loadSidebarBadges() {
  try {
    const resp = await fetch("/api/dashboard/stats", {
      headers: getAuthHeaders(),
    });
    if (!resp.ok) return;
    const stats = await resp.json();

    const b1 = document.getElementById("badge-encours");
    const b2 = document.getElementById("badge-attente");
    const b3 = document.getElementById("badge-termine");

    if (b1) b1.textContent = stats.EN_COURS || 0;
    if (b2) b2.textContent = stats.EN_ATTENTE || 0;
    if (b3) b3.textContent = stats.TERMINE || 0;
  } catch (e) {
    // Silently fail — badges will stay at 0
  }
}

// ── HOW TO USE ────────────────────────────────────────────────────────────
// In each page's JS (projets.js, users.js, agenda.js, etc.), call:
//
//   document.addEventListener('DOMContentLoaded', () => {
//     if (!checkAuth()) return;
//     loadUserInfo();
//     loadSidebarBadges();   // ← add this line
//     // ... rest of page init
//   });
//
// Alternatively, add the call inside your existing loadUserInfo() function
// in auth.js so it runs automatically on every page.
