// Recipient Dashboard JavaScript

// Global variables
let currentUser = null;
const API_URL = '/api';

// DOM Elements
const profileForm = document.getElementById('profileForm');
const matchesList = document.getElementById('matchesList');
const availableDonations = document.getElementById('availableDonations');
const totalReceived = document.getElementById('totalReceived');
const activeMatches = document.getElementById('activeMatches');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', initialize);
profileForm.addEventListener('submit', handleProfileUpdate);
logoutBtn.addEventListener('click', handleLogout);

// Initialize dashboard
async function initialize() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        // Load profile data
        await loadProfile();
        
        // Load matches
        await loadMatches();
        
        // Load available donations
        await loadAvailableDonations();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

// Load profile data
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/recipients/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        currentUser = data;
        
        // Populate form
        document.getElementById('capacity').value = data.currentCapacity || '';
        data.foodPreferences?.forEach(pref => {
            const checkbox = document.getElementById(`pref${capitalize(pref)}`);
            if (checkbox) checkbox.checked = true;
        });
        
        if (data.availableHours?.length > 0) {
            document.getElementById('startTime').value = data.availableHours[0].start;
            document.getElementById('endTime').value = data.availableHours[0].end;
        }
        
        updateStats();
    } catch (error) {
        console.error('Load profile error:', error);
        throw error;
    }
}

// Update stats display
function updateStats() {
    if (!currentUser) return;
    
    totalReceived.textContent = currentUser.totalReceived || 0;
    activeMatches.textContent = currentUser.activeMatches || 0;
}

// Load matches
async function loadMatches() {
    try {
        const response = await fetch(`${API_URL}/matches`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const matches = await response.json();
        updateMatchesList(matches);
    } catch (error) {
        console.error('Load matches error:', error);
        throw error;
    }
}

// Update matches list display
function updateMatchesList(matches) {
    matchesList.innerHTML = matches.map(match => `
        <tr>
            <td>${match.donorName}</td>
            <td>${match.foodType}</td>
            <td>${match.quantity} kg</td>
            <td>${new Date(match.pickupTime).toLocaleString()}</td>
            <td><span class="badge bg-${getStatusColor(match.status)}">${match.status}</span></td>
            <td>
                ${getMatchActions(match)}
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to action buttons
    matches.forEach(match => {
        const acceptBtn = document.getElementById(`accept-${match._id}`);
        const completeBtn = document.getElementById(`complete-${match._id}`);
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => handleMatchAction(match._id, 'accepted'));
        }
        if (completeBtn) {
            completeBtn.addEventListener('click', () => handleMatchAction(match._id, 'completed'));
        }
    });
}

// Get match action buttons based on status
function getMatchActions(match) {
    switch (match.status) {
        case 'pending':
            return `<button id="accept-${match._id}" class="btn btn-sm btn-success">Accept</button>`;
        case 'accepted':
            return `<button id="complete-${match._id}" class="btn btn-sm btn-primary">Complete</button>`;
        default:
            return '';
    }
}

// Handle match actions (accept/complete)
async function handleMatchAction(matchId, status) {
    try {
        const response = await fetch(`${API_URL}/matches/${matchId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showToast(`Match ${status} successfully!`, 'success');
            await loadMatches();
            await loadProfile();
        } else {
            showToast('Failed to update match', 'error');
        }
    } catch (error) {
        console.error('Match action error:', error);
        showToast('Failed to update match', 'error');
    }
}

// Load available donations
async function loadAvailableDonations() {
    try {
        const response = await fetch(`${API_URL}/recipients/available-donations`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const donations = await response.json();
        updateAvailableDonations(donations);
    } catch (error) {
        console.error('Load available donations error:', error);
        throw error;
    }
}

// Update available donations display
function updateAvailableDonations(donations) {
    availableDonations.innerHTML = donations.map(donation => `
        <tr>
            <td>${donation.foodType}</td>
            <td>${donation.quantity} kg</td>
            <td>${donation.location.address}</td>
            <td>${(donation.matchScore * 100).toFixed(1)}%</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="handleRequestMatch('${donation._id}')">
                    Request Match
                </button>
            </td>
        </tr>
    `).join('');
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const foodPreferences = ['prepared', 'fresh', 'canned', 'baked']
        .filter(pref => document.getElementById(`pref${capitalize(pref)}`).checked);
    
    const profileData = {
        capacity: document.getElementById('capacity').value,
        foodPreferences,
        availableHours: [{
            start: document.getElementById('startTime').value,
            end: document.getElementById('endTime').value
        }]
    };
    
    try {
        const response = await fetch(`${API_URL}/recipients/needs`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            showToast('Profile updated successfully!', 'success');
            await loadProfile();
            await loadAvailableDonations(); // Refresh available donations as preferences changed
        } else {
            showToast('Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Failed to update profile', 'error');
    }
}

// Handle match request
async function handleRequestMatch(donationId) {
    try {
        const response = await fetch(`${API_URL}/matches/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ donationId })
        });
        
        if (response.ok) {
            showToast('Match requested successfully!', 'success');
            await loadMatches();
            await loadAvailableDonations();
        } else {
            showToast('Failed to request match', 'error');
        }
    } catch (error) {
        console.error('Match request error:', error);
        showToast('Failed to request match', 'error');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Utility Functions
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getStatusColor(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'accepted':
            return 'primary';
        case 'completed':
            return 'success';
        default:
            return 'secondary';
    }
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
