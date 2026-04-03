// Dashboard functionality
let statsChart = null;

// Check authentication on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
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
        console.error('Error loading dashboard:', error);
        showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
}

// Load statistics for cards
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update dashboard statistics cards
function updateDashboardStats(stats) {
    // Update main cards
    const encoursCard = document.querySelector('.qcard.accent .qcard-num');
    const attenteCard = document.querySelector('.qcard.warn .qcard-num');
    const termineCard = document.querySelector('.qcard:not(.accent):not(.warn) .qcard-num');
    
    if (encoursCard) encoursCard.textContent = stats.EN_COURS || 0;
    if (attenteCard) attenteCard.textContent = stats.EN_ATTENTE || 0;
    if (termineCard) termineCard.textContent = stats.TERMINE || 0;
    
    // Update sidebar badges
    const badges = document.querySelectorAll('.nav-badge');
    if (badges.length >= 3) {
        badges[0].textContent = stats.EN_COURS || 0;
        badges[1].textContent = stats.EN_ATTENTE || 0;
        badges[2].textContent = stats.TERMINE || 0;
    }
}

// Load statistics by project type
async function loadStatsByType() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats/by-type`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayStatsByType(stats);
        }
    } catch (error) {
        console.error('Error loading stats by type:', error);
    }
}

// Display statistics by type
function displayStatsByType(stats) {
    const container = document.getElementById('stats-by-type');
    if (!container) return;
    
    if (!stats || Object.keys(stats).length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #8A9FBF;">Aucune donnée disponible</div>';
        return;
    }
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">';
    
    for (const [type, data] of Object.entries(stats)) {
        const total = data.TOTAL || 0;
        const encours = data.EN_COURS || 0;
        const attente = data.EN_ATTENTE || 0;
        const termine = data.TERMINE || 0;
        
        const encoursPercent = total > 0 ? (encours / total * 100).toFixed(0) : 0;
        const attentePercent = total > 0 ? (attente / total * 100).toFixed(0) : 0;
        const terminePercent = total > 0 ? (termine / total * 100).toFixed(0) : 0;
        
        html += `
            <div style="background: #F8FAFD; border-radius: 10px; padding: 16px; border: 0.5px solid #D8E6F2;">
                <div style="font-size: 14px; font-weight: 700; color: #0D2B6E; margin-bottom: 12px;">${type}</div>
                <div style="font-size: 28px; font-weight: 700; color: #1A4BA8; margin-bottom: 8px;">${total}</div>
                <div style="font-size: 11px; color: #8A9FBF; margin-bottom: 12px;">Total projets</div>
                
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                        <span>En cours</span>
                        <span><strong>${encours}</strong> (${encoursPercent}%)</span>
                    </div>
                    <div style="height: 6px; background: #E8EFF8; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${encoursPercent}%; height: 100%; background: #5BB8E8; border-radius: 3px;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                        <span>En attente</span>
                        <span><strong>${attente}</strong> (${attentePercent}%)</span>
                    </div>
                    <div style="height: 6px; background: #E8EFF8; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${attentePercent}%; height: 100%; background: #F5A623; border-radius: 3px;"></div>
                    </div>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                        <span>Terminé</span>
                        <span><strong>${termine}</strong> (${terminePercent}%)</span>
                    </div>
                    <div style="height: 6px; background: #E8EFF8; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${terminePercent}%; height: 100%; background: #1A7A40; border-radius: 3px;"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Load recent projects
async function loadRecentProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/recent?limit=5`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const projects = await response.json();
            displayRecentProjects(projects);
        }
    } catch (error) {
        console.error('Error loading recent projects:', error);
    }
}

// Display recent projects
function displayRecentProjects(projects) {
    const container = document.getElementById('recent-projects');
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #8A9FBF;">Aucun projet récent</div>';
        return;
    }
    
    let html = '<div style="margin-top: 16px;">';
    projects.forEach(project => {
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
    html += '</div>';
    
    // Add recent projects section if not exists
    const statsContainer = document.getElementById('stats-by-type');
    if (statsContainer && !document.getElementById('recent-projects')) {
        const recentSection = document.createElement('div');
        recentSection.id = 'recent-projects';
        recentSection.innerHTML = '<div class="section-label" style="margin-top: 24px;">📋 Projets récents</div>';
        statsContainer.parentNode.appendChild(recentSection);
        document.getElementById('recent-projects').innerHTML += html;
    } else if (document.getElementById('recent-projects')) {
        document.getElementById('recent-projects').innerHTML += html;
    }
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function getStatusClass(statut) {
    switch(statut) {
        case 'EN_COURS': return 'p-encours';
        case 'EN_ATTENTE': return 'p-attente';
        case 'TERMINE': return 'p-termine';
        default: return '';
    }
}

function getStatusText(statut) {
    switch(statut) {
        case 'EN_COURS': return 'En cours';
        case 'EN_ATTENTE': return 'En attente';
        case 'TERMINE': return 'Terminé';
        default: return statut;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Load user info
function loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    const roleText = user.role === 'ADMIN' ? 'Administrateur' : 
                     user.role === 'CHEF_PROJET' ? 'Chef de projet' : 'Consultant';
    
    // Update user name in all places
    document.querySelectorAll('.user-chip-name, .sidebar-name').forEach(el => {
        if (el) el.textContent = `${user.prenom} ${user.nom}`;
    });
    
    // Update role
    document.querySelectorAll('.user-chip-role, .sidebar-role').forEach(el => {
        if (el) el.textContent = roleText;
    });
    
    // Update avatar
    const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
    document.querySelectorAll('.user-chip-avatar').forEach(el => {
        if (el) el.textContent = initials;
    });
}

// Refresh dashboard periodically (every 30 seconds)
setInterval(() => {
    if (window.location.pathname === '/dashboard') {
        loadStatistics();
        loadStatsByType();
    }
}, 30000);