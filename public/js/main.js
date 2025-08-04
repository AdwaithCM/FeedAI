// Main JavaScript file for AI-FEED

// Global variables
let currentUser = null;
const API_URL = '/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const navbarNav = document.getElementById('navbarNav');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user data
        fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                currentUser = data.user;
                updateUI();
                redirectToDashboard();
            }
        })
        .catch(error => {
            console.error('Auth error:', error);
            localStorage.removeItem('token');
        });
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showToast('Login successful!', 'success');
            redirectToDashboard();
        } else {
            showToast('Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const type = document.getElementById('registerType').value;
    const address = document.getElementById('registerAddress').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                type,
                location: { address }
            })
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showToast('Registration successful!', 'success');
            redirectToDashboard();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed', 'error');
    }
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
    if (!currentUser) return;
    
    const dashboardUrl = currentUser.type === 'donor'
        ? 'donor-dashboard.html'
        : 'recipient-dashboard.html';
    
    window.location.href = dashboardUrl;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type === 'error' ? 'danger' : 'success'} text-white`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Update UI based on auth state
function updateUI() {
    if (currentUser) {
        // Update navigation for logged-in user
        navbarNav.innerHTML = `
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <span class="nav-link">Welcome, ${currentUser.name}</span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="handleLogout()">Logout</a>
                </li>
            </ul>
        `;
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
