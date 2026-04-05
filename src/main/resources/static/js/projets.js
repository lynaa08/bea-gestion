// Projects management
let currentPage = 0;
let currentFilter = 'Tous';
let currentSearchTerm = '';
let totalPages = 0;

// Load projects list
async function loadProjects(page = 0, filter = 'Tous', searchTerm = '') {
    if (!checkAuth()) return;
    
    currentPage = page;
    currentFilter = filter;
    currentSearchTerm = searchTerm;
    
    let url = `${API_BASE_URL}/projets?page=${page}&size=10`;
    
    if (filter !== 'Tous') {
        let statut = filter === 'En cours' ? 'EN_COURS' : 
                     filter === 'En attente' ? 'EN_ATTENTE' : 'TERMINE';
        url += `&statut=${statut}`;
    }
    
    if (searchTerm) {
        url += `&nom=${encodeURIComponent(searchTerm)}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            totalPages = data.totalPages;
            renderProjectsTable(data.content);
            renderPagination(data);
            updatePageInfo(data);
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
    }
}

// Render projects table
function renderProjectsTable(projects) {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Aucun projet trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = projects.map(projet => `
        <tr onclick="viewProject(${projet.id})">
            <td style="font-weight: 700; color: #0D2B6E;">${projet.id}</td>
            <td>
                <div class="proj-name" style="font-weight: 600; color: #1A2D5A;">${escapeHtml(projet.nom)}</div>
                <div class="proj-date" style="color: #7A90B8; font-size: 11px;">${escapeHtml(projet.description || '')}</div>
            </td>
            <td>${formatDate(projet.dateDebut)}</td>
            <td>
                <span class="pill ${getStatusClass(projet.statut)}">
                    <span class="pill-dot"></span>${getStatusText(projet.statut)}
                </span>
            </td>
            <td>
                <span class="type-badge ${projet.type === 'INTERNE' ? 't-interne' : 't-externe'}">
                    ${projet.type === 'INTERNE' ? 'Interne' : 'Externe'}
                </span>
            </td>
            <td onclick="event.stopPropagation()">
                <div class="action-btns">
                    <div class="act-btn" onclick="viewProject(${projet.id})" title="Voir">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#5BB8E8" stroke-width="1.8"/>
                            <circle cx="12" cy="12" r="3" stroke="#5BB8E8" stroke-width="1.8"/>
                        </svg>
                    </div>
                    <div class="act-btn" onclick="editProject(${projet.id})" title="Modifier">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#4A6080" stroke-width="1.8"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#4A6080" stroke-width="1.8"/>
                        </svg>
                    </div>
                    <div class="act-btn" onclick="deleteProject(${projet.id})" title="Supprimer">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <polyline points="3 6 5 6 21 6" stroke="#E05A2B" stroke-width="1.8"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#E05A2B" stroke-width="1.8"/>
                        </svg>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render pagination
function renderPagination(data) {
    const pageBtns = document.querySelector('.page-btns');
    if (!pageBtns) return;
    
    pageBtns.innerHTML = '';
    
    // Previous button
    const prevBtn = createPageButton('‹', data.pageable.pageNumber > 0);
    prevBtn.onclick = () => {
        if (data.pageable.pageNumber > 0) {
            loadProjects(data.pageable.pageNumber - 1, currentFilter, currentSearchTerm);
        }
    };
    pageBtns.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(0, data.pageable.pageNumber - 2);
    const endPage = Math.min(data.totalPages - 1, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNum = i + 1;
        const pageBtn = createPageButton(pageNum, true, i === data.pageable.pageNumber);
        pageBtn.onclick = () => loadProjects(i, currentFilter, currentSearchTerm);
        pageBtns.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = createPageButton('›', data.pageable.pageNumber + 1 < data.totalPages);
    nextBtn.onclick = () => {
        if (data.pageable.pageNumber + 1 < data.totalPages) {
            loadProjects(data.pageable.pageNumber + 1, currentFilter, currentSearchTerm);
        }
    };
    pageBtns.appendChild(nextBtn);
}

// Create page button
function createPageButton(text, enabled, isActive = false) {
    const btn = document.createElement('div');
    btn.className = `page-btn ${isActive ? 'active' : ''}`;
    btn.innerHTML = text;
    if (!enabled) {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
    return btn;
}

// Update page info
function updatePageInfo(data) {
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) {
        const start = data.pageable.offset + 1;
        const end = Math.min(data.pageable.offset + data.pageable.pageSize, data.totalElements);
        pageInfo.textContent = `Affichage ${start}–${end} sur ${data.totalElements} projets`;
    }
}

// Filter projects
function filterProjects(filter) {
    currentFilter = filter;
    currentPage = 0;
    
    // Update active tab
    document.querySelectorAll('.ftab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === filter) {
            tab.classList.add('active');
        }
    });
    
    loadProjects(0, filter, currentSearchTerm);
}

// Search projects
function searchProjects() {
    const searchInput = document.querySelector('.search-input');
    currentSearchTerm = searchInput ? searchInput.value : '';
    currentPage = 0;
    loadProjects(0, currentFilter, currentSearchTerm);
}

// Create new project
async function createProject(projectData) {
    try {
        const response = await fetch(`${API_BASE_URL}/projets`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            showNotification('Projet créé avec succès!', 'success');
            window.location.href = '/api/projets-list';
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erreur lors de la création', 'error');
        }
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Erreur lors de la création du projet', 'error');
    }
}

// Update project
async function updateProject(id, projectData) {
    try {
        const response = await fetch(`${API_BASE_URL}/projets/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            showNotification('Projet modifié avec succès!', 'success');
            window.location.href = '/api/projets-list';
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Error updating project:', error);
        showNotification('Erreur lors de la modification du projet', 'error');
    }
}

// View project
function viewProject(id) {
    window.location.href = `/api/projets/view/${id}`;
}

// Edit project
function editProject(id) {
    window.location.href = `/api/projets/edit/${id}`;
}

// Delete project
async function deleteProject(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/projets/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                showNotification('Projet supprimé avec succès!', 'success');
                loadProjects(currentPage, currentFilter, currentSearchTerm);
            } else {
                showNotification('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Load project for editing
async function loadProjectForEdit(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/projets/${id}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const project = await response.json();
            populateProjectForm(project);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showNotification('Erreur lors du chargement du projet', 'error');
    }
}

// Populate project form
function populateProjectForm(project) {
    document.getElementById('nom').value = project.nom || '';
    document.getElementById('description').value = project.description || '';
    document.getElementById('statut').value = project.statut || '';
    document.getElementById('type').value = project.type || '';
    document.getElementById('priorite').value = project.priorite || '';
    document.getElementById('dateDebut').value = project.dateDebut || '';
    document.getElementById('deadline').value = project.deadline || '';
}

// Handle project form submission
async function handleProjectSubmit(event) {
    event.preventDefault();
    
    const projectId = document.getElementById('projectId')?.value;
    const projectData = {
        nom: document.getElementById('nom').value,
        description: document.getElementById('description').value,
        statut: document.getElementById('statut').value,
        type: document.getElementById('type').value,
        priorite: document.getElementById('priorite').value,
        dateDebut: document.getElementById('dateDebut').value,
        deadline: document.getElementById('deadline').value,
        dateCreation: new Date().toISOString().split('T')[0]
    };
    
    if (projectId) {
        await updateProject(projectId, projectData);
    } else {
        await createProject(projectData);
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

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/api/projets-list') {
            loadProjects();
            
            // Setup search
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') searchProjects();
                });
            }
        } else if (window.location.pathname.includes('/api/projets/edit/')) {
            const id = window.location.pathname.split('/').pop();
            if (id && !isNaN(id)) {
                loadProjectForEdit(id);
            }
        }
    });
}