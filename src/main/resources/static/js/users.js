const API_BASE_URL = '/api';

// Load all users
async function loadUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/api/login';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else if (response.status === 403) {
            document.getElementById('users-container').innerHTML = 
                '<div class="error-message">⛔ Accès non autorisé. Réservé aux administrateurs.</div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Erreur lors du chargement des utilisateurs');
    }
}

// Display users in a table
function displayUsers(users) {
    const container = document.getElementById('users-container');
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucun utilisateur trouvé</div>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Téléphone</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        const roleText = getRoleText(user.role);
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.prenom} ${user.nom}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role.toLowerCase()}">${roleText}</span></td>
                <td>${user.telephone || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="act-btn" onclick="editUser(${user.id})" title="Modifier">✏️</button>
                        <button class="act-btn" onclick="deleteUser(${user.id})" title="Supprimer">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Create new user
async function createUser(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const userData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        telephone: document.getElementById('telephone').value,
        fonction: document.getElementById('fonction').value,
        matricule: document.getElementById('matricule').value,
        role: document.getElementById('role').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showMessage('✅ Utilisateur créé avec succès!', 'success');
            setTimeout(() => {
                window.location.href = '/api/users';
            }, 1500);
        } else {
            const error = await response.json();
            showMessage('❌ ' + (error.message || 'Erreur lors de la création'), 'error');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage('❌ Erreur de connexion au serveur', 'error');
    }
}

// Edit user
async function editUser(id) {
    window.location.href = `/api/users/edit/${id}`;
}

// Load user for editing
async function loadUserForEdit(id) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            populateUserForm(user);
            document.getElementById('userId').value = user.id;
            document.getElementById('password').required = false;
            document.querySelector('.page-title').textContent = 'Modifier un utilisateur';
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showMessage('❌ Erreur lors du chargement', 'error');
    }
}

// Populate form with user data
function populateUserForm(user) {
    document.getElementById('nom').value = user.nom || '';
    document.getElementById('prenom').value = user.prenom || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('telephone').value = user.telephone || '';
    document.getElementById('fonction').value = user.fonction || '';
    document.getElementById('matricule').value = user.matricule || '';
    document.getElementById('role').value = user.role || '';
}

// Update user
async function updateUser(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const userId = document.getElementById('userId').value;
    
    const userData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        email: document.getElementById('email').value,
        telephone: document.getElementById('telephone').value,
        fonction: document.getElementById('fonction').value,
        matricule: document.getElementById('matricule').value,
        role: document.getElementById('role').value
    };
    
    const password = document.getElementById('password').value;
    if (password) {
        userData.password = password;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            showMessage('✅ Utilisateur modifié avec succès!', 'success');
            setTimeout(() => {
                window.location.href = '/api/users';
            }, 1500);
        } else {
            const error = await response.json();
            showMessage('❌ ' + (error.message || 'Erreur lors de la modification'), 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('❌ Erreur de connexion au serveur', 'error');
    }
}

// Delete user
async function deleteUser(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                showMessage('✅ Utilisateur supprimé avec succès!', 'success');
                loadUsers();
            } else {
                showMessage('❌ Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showMessage('❌ Erreur de connexion au serveur', 'error');
        }
    }
}

// Handle form submission
function handleUserSubmit(event) {
    const userId = document.getElementById('userId')?.value;
    if (userId) {
        updateUser(event);
    } else {
        createUser(event);
    }
}

// Helper functions
function getRoleText(role) {
    switch(role) {
        case 'ADMIN': return 'Administrateur';
        case 'CHEF_PROJET': return 'Chef de projet';
        case 'CONSULTANT': return 'Consultant';
        default: return role;
    }
}

function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
        const className = type === 'error' ? 'error-message' : 'success-message';
        messageArea.innerHTML = `<div class="${className}">${message}</div>`;
        setTimeout(() => {
            messageArea.innerHTML = '';
        }, 3000);
    } else {
        alert(message);
    }
}

function showError(message) {
    showMessage(message, 'error');
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/api/users') {
        loadUsers();
    } else if (window.location.pathname.includes('/api/users/edit/')) {
        const id = window.location.pathname.split('/').pop();
        if (id && !isNaN(id)) {
            loadUserForEdit(id);
        }
    }
});