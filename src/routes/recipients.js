const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Get recipient profile
router.get('/profile', async (req, res) => {
    try {
        const db = getDB();
        const recipient = await db.get(req.user.userId);
        
        if (!recipient || recipient.type !== 'recipient') {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        
        res.json(recipient);
    } catch (error) {
        console.error('Get recipient profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update recipient needs
router.patch('/needs', async (req, res) => {
    try {
        const { foodPreferences, capacity, availableHours } = req.body;
        
        const db = getDB();
        const recipient = await db.get(req.user.userId);
        
        if (!recipient || recipient.type !== 'recipient') {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        
        const updatedRecipient = {
            ...recipient,
            foodPreferences: foodPreferences || recipient.foodPreferences,
            currentCapacity: capacity || recipient.currentCapacity,
            availableHours: availableHours || recipient.availableHours
        };
        
        await db.insert(updatedRecipient);
        
        res.json(updatedRecipient);
    } catch (error) {
        console.error('Update recipient needs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available donations
router.get('/available-donations', async (req, res) => {
    try {
        const db = getDB();
        
        const donations = await db.query({
            selector: {
                status: 'available'
            },
            sort: [{ createdAt: 'desc' }]
        });
        
        res.json(donations);
    } catch (error) {
        console.error('Get available donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
