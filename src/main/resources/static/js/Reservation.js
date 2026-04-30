// ── Ouvrir le modal de réservation ────────────────────────────────────────
async function openReservationModal(projetId = null, projetNom = "") {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };

    const [resMateriels, resUsers, resProjets] = await Promise.all([
      fetch("/api/materiels", { headers }),
      fetch("/api/users", { headers }),
      fetch("/api/projets/all", { headers }),
    ]);

    const materiels = await resMateriels.json();
    const users = await resUsers.json();
    const projets = await resProjets.json();

    // ✅ Inclure tous les matériels (DISPONIBLE, EN_UTILISATION, null)
    const disponibles = materiels.filter(
      (m) =>
        m.statut === "DISPONIBLE" ||
        m.statut === "EN_UTILISATION" ||
        m.statut == null,
    );

    buildReservationModal(disponibles, users, projets, projetId, projetNom);
  } catch (e) {
    alert("Erreur chargement données : " + e.message);
  }
}

// ── Construire et afficher le modal ───────────────────────────────────────
function buildReservationModal(
  materiels,
  users,
  projets,
  defaultProjetId,
  defaultProjetNom,
) {
  const existing = document.getElementById("resaModal");
  if (existing) existing.remove();

  const materielOptions = materiels
    .map(
      (m) =>
        `<option value="${m.id}" data-statut="${m.statut || "DISPONIBLE"}">` +
        `${m.nom}${m.marque ? " - " + m.marque : ""}` +
        `${m.licence ? " (" + m.licence + ")" : ""}</option>`,
    )
    .join("");

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.matricule}">${u.prenom} ${u.nom} (${u.matricule})</option>`,
    )
    .join("");

  const projetOptions = projets
    .map(
      (p) =>
        `<option value="${p.id}" ${p.id == defaultProjetId ? "selected" : ""}>${p.nom}</option>`,
    )
    .join("");

  const today = new Date().toISOString().split("T")[0];

  const html = `
  <div id="resaModal" style="
    position:fixed;inset:0;z-index:9999;
    background:rgba(10,20,60,0.45);
    display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(3px);
  " onclick="if(event.target===this)closeResaModal()">
    <div style="
      background:#fff;border-radius:18px;width:520px;max-width:96vw;
      max-height:90vh;overflow-y:auto;
      box-shadow:0 24px 80px rgba(10,20,80,0.22);
    ">
      <div style="background:#0d2b6e;padding:18px 24px;border-radius:18px 18px 0 0;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="color:#fff;font-weight:700;font-size:16px">📦 Réserver un matériel</div>
          ${defaultProjetNom ? `<div style="color:#5bb8e8;font-size:12px;margin-top:2px">Projet : ${defaultProjetNom}</div>` : ""}
        </div>
        <button onclick="closeResaModal()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1">×</button>
      </div>
      <div style="padding:24px">
        <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:12px;color:#6d4c00">
          <strong>📊 Priorité automatique :</strong> Toutes les demandes démarrent <strong>EN_ATTENTE</strong> et sont examinées par le Chef de département. Le classement se fait par priorité du projet, deadline et urgence.
        </div>
        <div id="resaMessage"></div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">
            Matériel * <span id="resaStatutBadge"></span>
          </label>
          <select id="resaMaterielId" onchange="onMaterielChange(this)" style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;border-radius:8px;font-size:13px;color:#1a2d5a;outline:none">
            <option value="">-- Sélectionner un matériel --</option>
            ${materielOptions}
          </select>
          <div id="resaFileAttente" style="display:none;margin-top:8px"></div>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Responsable *</label>
          <select id="resaResponsable" style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;border-radius:8px;font-size:13px;color:#1a2d5a;outline:none">
            <option value="">-- Sélectionner un responsable --</option>
            ${userOptions}
          </select>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">
            Projet lié <span style="color:#8a9fbf;font-weight:400">(influence la priorité)</span>
          </label>
          <select id="resaProjetId" style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;border-radius:8px;font-size:13px;color:#1a2d5a;outline:none">
            <option value="">-- Aucun projet --</option>
            ${projetOptions}
          </select>
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Date souhaitée</label>
          <input type="date" id="resaDate" min="${today}"
            style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;border-radius:8px;font-size:13px;color:#1a2d5a;outline:none;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">
            Date de retour
         </label>

           <input type="datetime-local" id="resaDateRetour"
            min="${new Date().toISOString().slice(0, 16)}"
           style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;
            border-radius:8px;font-size:13px;color:#1a2d5a;outline:none;box-sizing:border-box" />
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:11px;font-weight:700;color:#4a6080;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Note (optionnel)</label>
          <textarea id="resaNote" rows="2" style="width:100%;padding:10px 12px;border:1.5px solid #d8e6f2;border-radius:8px;font-size:13px;color:#1a2d5a;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box" placeholder="Motif, précision..."></textarea>
        </div>
        <div style="display:flex;gap:10px">
          <button onclick="closeResaModal()" style="flex:1;padding:12px;background:#f5f5f5;border:1px solid #ddd;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;color:#666">Annuler</button>
          <button onclick="submitReservation()" id="btnSubmitResa" style="flex:2;padding:12px;background:#0d2b6e;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:700">📦 Réserver</button>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
}

async function onMaterielChange(select) {
  const materielId = select.value;
  const fileDiv = document.getElementById("resaFileAttente");
  const badgeDiv = document.getElementById("resaStatutBadge");

  if (!materielId) {
    fileDiv.style.display = "none";
    badgeDiv.innerHTML = "";
    return;
  }

  const statut =
    select.options[select.selectedIndex].getAttribute("data-statut");

  if (statut === "DISPONIBLE" || statut === null) {
    badgeDiv.innerHTML =
      '<span style="background:#e6f9ee;color:#1a7a40;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">● Disponible</span>';
    fileDiv.style.display = "none";
    return;
  }

  badgeDiv.innerHTML =
    '<span style="background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">● Déjà en cours d\'utilisation</span>';

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/reservations/materiel/${materielId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const reservations = await res.json();
    const actives = reservations.filter((r) => r.statut === "ACTIVE");
    const attentes = reservations.filter((r) => r.statut === "EN_ATTENTE");

    let html =
      '<div style="background:#f8fafd;border:1px solid #e0eaf5;border-radius:8px;padding:10px 12px;font-size:12px">';
    html +=
      '<div style="font-weight:700;color:#0d2b6e;margin-bottom:6px">📋 État actuel des réservations</div>';
    if (actives.length > 0) {
      const a = actives[0];
      html += `<div style="color:#e65100;margin-bottom:4px">🔒 Attribué à : <strong>${a.responsablePrenom} ${a.responsableNom}</strong>`;
      if (a.projetNom) html += ` (${a.projetNom})`;
      html += ` — Score : ${a.scoresPriorite}</div>`;
    }
    if (attentes.length > 0) {
      html += `<div style="color:#6a8ab0">⏳ ${attentes.length} demande(s) en attente</div>`;
      attentes.forEach((r) => {
        html += `<div style="color:#8a9fbf;padding-left:12px">• ${r.responsablePrenom} ${r.responsableNom} (score: ${r.scoresPriorite})</div>`;
      });
    }
    html += "</div>";
    fileDiv.innerHTML = html;
    fileDiv.style.display = "block";
  } catch {}
}

async function submitReservation() {
  const materielId = document.getElementById("resaMaterielId").value;
  const responsable = document.getElementById("resaResponsable").value;
  const projetId = document.getElementById("resaProjetId").value;
  const date = document.getElementById("resaDate").value;
  const note = document.getElementById("resaNote").value;

  if (!materielId) {
    showResaMsg("error", "Veuillez sélectionner un matériel.");
    return;
  }
  if (!responsable) {
    showResaMsg("error", "Veuillez sélectionner un responsable.");
    return;
  }

  const btn = document.getElementById("btnSubmitResa");
  btn.disabled = true;
  btn.textContent = "Réservation en cours...";

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        materielId: parseInt(materielId),
        responsableMatricule: responsable,
        projetId: projetId ? parseInt(projetId) : null,
        dateReservation: date || null,
        note: note || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showResaMsg("error", data.message || "Erreur lors de la réservation.");
      btn.disabled = false;
      btn.textContent = "📦 Réserver";
      return;
    }

    // ✅ Demande soumise → EN_ATTENTE, affichage score, puis redirection
    showResaMsg(
      "success",
      "⏳ Demande soumise — EN ATTENTE d'approbation (score priorité : " +
        data.scoresPriorite +
        ")",
    );

    setTimeout(() => {
      closeResaModal();
      window.location.href = "/reservations-list";
    }, 1500);
  } catch (e) {
    showResaMsg("error", "Erreur réseau : " + e.message);
    btn.disabled = false;
    btn.textContent = "📦 Réserver";
  }
}

function closeResaModal() {
  const m = document.getElementById("resaModal");
  if (m) m.remove();
}

function showResaMsg(type, msg) {
  const el = document.getElementById("resaMessage");
  if (!el) return;
  const bg = type === "success" ? "#e6f9ee" : "#fee";
  const color = type === "success" ? "#1a7a40" : "#b00";
  el.innerHTML = `<div style="background:${bg};color:${color};padding:10px 14px;border-radius:8px;margin-bottom:12px;font-size:13px">${msg}</div>`;
}

// ══════════════════════════════════════════════════════════════════
//  voirReservations — appelé depuis materiel-list.html
// ══════════════════════════════════════════════════════════════════
async function voirReservations(materielId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/reservations/materiel/${materielId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    alert(
      "Erreur lors du chargement des réservations (code " + res.status + ")",
    );
    return;
  }

  const reservations = await res.json();

  const rows = reservations
    .map((r) => {
      const statutColor =
        r.statut === "ACTIVE"
          ? "#22c55e"
          : r.statut === "EN_ATTENTE"
            ? "#f59e0b"
            : "#94a3b8";

      const statutLabel =
        r.statut === "ACTIVE"
          ? "Attribué"
          : r.statut === "EN_ATTENTE"
            ? "En attente"
            : r.statut === "TERMINEE"
              ? "Terminée"
              : r.statut === "ANNULEE"
                ? "Annulée"
                : r.statut || "—";

      const action =
        r.statut === "ACTIVE"
          ? `<button onclick="terminerResa(${r.id})"
           style="background:#e6f9ee;border:1px solid #86efac;border-radius:6px;
                  padding:4px 10px;cursor:pointer;font-size:11px;color:#1a7a40;font-weight:600">
           ✓ Libérer
         </button>`
          : r.statut === "EN_ATTENTE"
            ? `<button onclick="annulerResa(${r.id})"
           style="background:#fee;border:1px solid #fca5a5;border-radius:6px;
                  padding:4px 10px;cursor:pointer;font-size:11px;color:#b00;font-weight:600">
           ✗ Annuler
         </button>`
            : "—";

      return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff">
        ${r.responsablePrenom || ""} ${r.responsableNom || ""}<br>
        <span style="color:#8a9fbf;font-size:11px">${r.responsableMatricule || ""}</span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;color:#4a6080;font-size:12px">
        ${r.projetNom || "—"}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;text-align:center">
        <span style="background:${statutColor}22;color:${statutColor};
                     padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">
          ${statutLabel}
        </span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;
                 text-align:center;font-weight:700;color:#0d2b6e">
        ${r.scoresPriorite ?? "—"}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f4ff;text-align:center">
        ${action}
      </td>
    </tr>`;
    })
    .join("");

  const tableContent =
    reservations.length === 0
      ? '<div style="text-align:center;padding:30px;color:#8a9fbf;font-size:13px">Aucune réservation pour ce matériel</div>'
      : `<table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f0f4ff">
            <th style="padding:10px 12px;text-align:left;color:#4a6080;font-size:11px;text-transform:uppercase">Responsable</th>
            <th style="padding:10px 12px;text-align:left;color:#4a6080;font-size:11px;text-transform:uppercase">Projet</th>
            <th style="padding:10px 12px;text-align:center;color:#4a6080;font-size:11px;text-transform:uppercase">Statut</th>
            <th style="padding:10px 12px;text-align:center;color:#4a6080;font-size:11px;text-transform:uppercase">Score priorité</th>
            <th style="padding:10px 12px;text-align:center;color:#4a6080;font-size:11px;text-transform:uppercase">Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

  // Remove existing modal if open
  document.getElementById("resaListModal")?.remove();

  const html = `
  <div id="resaListModal"
    style="position:fixed;inset:0;z-index:9999;background:rgba(10,20,60,0.45);
           display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)"
    onclick="if(event.target===this)this.remove()">
    <div style="background:#fff;border-radius:16px;width:700px;max-width:96vw;
                max-height:80vh;overflow:auto;box-shadow:0 24px 80px rgba(10,20,80,0.2)">
      <div style="background:#0d2b6e;padding:16px 20px;border-radius:16px 16px 0 0;
                  display:flex;justify-content:space-between;align-items:center;
                  position:sticky;top:0;z-index:1">
        <div style="color:#fff;font-weight:700;font-size:15px">📦 Réservations du matériel</div>
        <button onclick="document.getElementById('resaListModal').remove()"
          style="background:rgba(255,255,255,0.15);border:none;color:#fff;
                 width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:18px;
                 display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div style="padding:16px;overflow-x:auto">${tableContent}</div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
}

async function terminerResa(id) {
  if (
    !confirm(
      "Libérer ce matériel ? Le suivant en file d'attente sera attribué automatiquement.",
    )
  )
    return;
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/reservations/${id}/terminer`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  document.getElementById("resaListModal")?.remove();
  if (res.ok) location.reload();
  else alert("Erreur lors de la libération.");
}

async function annulerResa(id) {
  if (!confirm("Annuler cette réservation ?")) return;
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/reservations/${id}/annuler`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  document.getElementById("resaListModal")?.remove();
  if (res.ok) location.reload();
  else alert("Erreur lors de l'annulation.");
}
