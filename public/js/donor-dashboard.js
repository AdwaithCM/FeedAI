// Donor Dashboard JavaScript

// Global variables
let currentUser = null;
const API_URL = '/api';

// DOM Elements
const donationForm = document.getElementById('donationForm');
const donationHistory = document.getElementById('donationHistory');
const totalDonations = document.getElementById('totalDonations');
const impactPoints = document.getElementById('impactPoints');
const badgesContainer = document.getElementById('badgesContainer');
const leaderboard = document.getElementById('leaderboard');
const logoutBtn = document.getElementById('logoutBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', initialize);
donationForm.addEventListener('submit', handleDonation);
logoutBtn.addEventListener('click', handleLogout);

// Initialize dashboard
async function initialize() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    try {
        // Load user data
        await loadUserData();
        
        // Load donations
        await loadDonations();
        
        // Load leaderboard
        await loadLeaderboard();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

// Load user data
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        currentUser = data;
        
        updateStats();
        updateBadges();
    } catch (error) {
        console.error('Load user data error:', error);
        throw error;
    }
}

// Update stats display
function updateStats() {
    if (!currentUser) return;
    
    totalDonations.textContent = currentUser.totalDonations || 0;
    impactPoints.textContent = currentUser.points || 0;
}

// Update badges display
function updateBadges() {
    if (!currentUser || !currentUser.badges) return;
    
    badgesContainer.innerHTML = currentUser.badges.map(badge => `
        <div class="col-4 badge-card">
            <div class="badge-icon">🏆</div>
            <p>${badge}</p>
        </div>
    `).join('');
}

// Load donation history
async function loadDonations() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/donations/my-donations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const donations = await response.json();
        updateDonationHistory(donations);
    } catch (error) {
        console.error('Load donations error:', error);
        throw error;
    }
}

// Update donation history display
function updateDonationHistory(donations) {
    donationHistory.innerHTML = donations.map(donation => `
        <tr>
            <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
            <td>${donation.foodType}</td>
            <td>${donation.quantity} kg</td>
            <td><span class="badge bg-${getStatusColor(donation.status)}">${donation.status}</span></td>
            <td>${donation.recipientName || 'Pending Match'}</td>
        </tr>
    `).join('');
}

// Get color for status badge
function getStatusColor(status) {
    switch (status) {
        case 'available':
            return 'primary';
        case 'matched':
            return 'warning';
        case 'completed':
            return 'success';
        default:
            return 'secondary';
    }
}

// Load leaderboard
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const leaders = await response.json();
        updateLeaderboard(leaders);
    } catch (error) {
        console.error('Load leaderboard error:', error);
        throw error;
    }
}

// Update leaderboard display
function updateLeaderboard(leaders) {
    leaderboard.innerHTML = leaders.map((leader, index) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${index + 1}. ${leader.name}</span>
            <span class="badge bg-primary">${leader.points} pts</span>
        </li>
    `).join('');
}

// Handle new donation submission
async function handleDonation(e) {
    e.preventDefault();
    
    const donationData = {
        foodType: document.getElementById('foodType').value,
        quantity: document.getElementById('quantity').value,
        pickupTime: document.getElementById('pickupTime').value,
        perishable: document.getElementById('perishable').checked
    };
    
    try {
        const response = await fetch(`${API_URL}/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(donationData)
        });
        
        const data = await response.json();
        
        if (data.donation) {
            showToast('Donation submitted successfully!', 'success');
            donationForm.reset();
            
            // Refresh data
            await loadUserData();
            await loadDonations();
            await loadLeaderboard();
        } else {
            showToast('Failed to submit donation', 'error');
        }
    } catch (error) {
        console.error('Donation submission error:', error);
        showToast('Failed to submit donation', 'error');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
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
