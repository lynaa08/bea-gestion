const API_URL = "http://localhost:8081/materiels";

// Récupérer token JWT
function getToken() {
    return localStorage.getItem("token");
}

// ================================
// 🔹 CHARGER LES MATERIELS
// ================================
async function chargerMateriels() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (!response.ok) throw new Error("Erreur chargement : " + response.status);

        const materiels = await response.json();
        afficherMateriels(materiels);

    } catch (error) {
        console.error("chargerMateriels:", error);
    }
}

// ================================
// 🔹 AFFICHER TABLEAU
// ================================
function afficherMateriels(data) {
    const table = document.getElementById("materielTable");
    if (!table) return;

    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="9" class="mat-empty">Aucun matériel enregistré.</td>
            </tr>`;
        return;
    }

    const etatStyles = {
        "Neuf"     : "t-badge t-badge-neuf",
        "Bon état" : "t-badge t-badge-bon",
        "Usagé"    : "t-badge t-badge-usage",
        "En panne" : "t-badge t-badge-panne"
    };

    data.forEach(m => {
        const etatClass = etatStyles[m.etat] || "t-badge";
        table.innerHTML += `
            <tr>
                <td><span class="t-badge t-badge-id">${m.id ?? '-'}</span></td>
                <td><strong>${m.nom ?? '-'}</strong></td>
                <td><span class="t-badge t-badge-service">${m.service ?? '-'}</span></td>
                <td>${m.bureau ?? '-'}</td>
                <td>${m.type ?? '-'}</td>
                <td>${m.marque ?? '-'}</td>
                <td>${m.quantite ?? '-'}</td>
                <td><span class="${etatClass}">${m.etat ?? '-'}</span></td>
                <td>
                    <button class="t-action edit" onclick="modifierMateriel(${m.id})" title="Modifier">✏️</button>
                    <button class="t-action"      onclick="supprimerMateriel(${m.id})" title="Supprimer">🗑️</button>
                </td>
            </tr>`;
    });
}

// ================================
// 🔹 AJOUTER MATERIEL
// ================================
async function ajouterMateriel() {

    // Lecture sécurisée de chaque champ
    const get = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const materiel = {
        nom:      get("nom"),
        service:  get("service"),
        bureau:   get("bureau"),
        type:     get("type"),
        marque:   get("marque"),
        quantite: get("quantite"),
        etat:     get("etat")
        // ⚠️ "projet" supprimé car le champ n'existe pas dans le HTML
    };

    // Validation
    if (!materiel.nom || !materiel.service || !materiel.bureau) {
        alert("Veuillez remplir les champs obligatoires : Nom, Service, Bureau.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(materiel)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Réponse serveur :", response.status, errText);
            throw new Error("Erreur ajout : " + response.status);
        }

        alert("Matériel ajouté avec succès ✅");
        clearForm();
        chargerMateriels();

    } catch (error) {
        console.error("ajouterMateriel:", error);
        alert("Erreur serveur ❌ — voir la console pour les détails.");
    }
}


/*
// ================================
// 🔹 GESTION ROLE
// ================================
function gererRole() {
    const role = localStorage.getItem("role");
    if (role !== "CHEF_DEPARTEMENT") {
        const btn = document.querySelector(".mat-btn-submit");
        if (btn) btn.style.display = "none";
    }
}
*/
// ================================
// 🔹 BADGES SIDEBAR
// ================================
async function loadSidebarBadges() {
    try {
        const resp = await fetch("/api/dashboard/stats", {
            headers: { "Authorization": "Bearer " + getToken() }
        });

        if (!resp.ok) return;

        const stats = await resp.json();

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val ?? 0;
        };

        set("badge-encours", stats.EN_COURS);
        set("badge-attente", stats.EN_ATTENTE);
        set("badge-termine", stats.TERMINE);

    } catch (e) {
        console.error("loadSidebarBadges:", e);
    }
}

// ================================
// 🔥 INIT
// ================================
window.onload = () => {
    chargerMateriels();
    //gererRole();
    loadSidebarBadges();
};