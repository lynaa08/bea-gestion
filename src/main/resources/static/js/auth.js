// Dashboard functionality
let statsChart = null;

// Load dashboard data
async function loadDashboard() {
    if (!checkAuth()) return;
    
    try {
        // Load statistics
        await loadStatistics();
        
        // Load recent projects
        await loadRecentProjects();
        
        // Load activity feed
        await loadActivityFeed();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
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
    document.querySelectorAll('.nav-badge').forEach((badge, index) => {
        if (index === 0) badge.textContent = stats.EN_COURS || 0;
        else if (index === 1) badge.textContent = stats.EN_ATTENTE || 0;
        else if (index === 2) badge.textContent = stats.TERMINE || 0;
    });
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
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucun projet récent</div>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="recent-project-item" onclick="window.location.href='/projets/view/${project.id}'">
            <div class="project-info">
                <div class="project-name">${escapeHtml(project.nom)}</div>
                <div class="project-date">${formatDate(project.dateCreation)}</div>
            </div>
            <span class="pill ${getStatusClass(project.statut)}">
                <span class="pill-dot"></span>${getStatusText(project.statut)}
            </span>
        </div>
    `).join('');
}

// Load activity feed
async function loadActivityFeed() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/activity?limit=10`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const activities = await response.json();
            displayActivityFeed(activities);
        }
    } catch (error) {
        console.error('Error loading activity feed:', error);
    }
}

// Display activity feed
function displayActivityFeed(activities) {
    const container = document.getElementById('activity-feed');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucune activité récente</div>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">📋</div>
            <div class="activity-content">
                <div class="activity-text">${escapeHtml(activity.nom)}</div>
                <div class="activity-time">${formatRelativeTime(activity.dateCreation)}</div>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return `Il y a ${Math.floor(diff / 1440)}j`;
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

// Load dashboard when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
} else {
    loadDashboard();
}