const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const MatchingService = require('../services/MatchingService');
const GamificationService = require('../services/GamificationService');
const { getDB } = require('../config/db');

// Create new donation
router.post('/', async (req, res) => {
    try {
        const donationData = {
            ...req.body,
            donorId: req.user.userId,
            status: 'available'
        };
        
        const donation = new Donation(donationData);
        const db = getDB();
        
        // Save donation
        await db.insert(donation);
        
        // Find optimal match
        const match = await MatchingService.findOptimalMatch(donation);
        
        // Update gamification
        const gamification = await GamificationService.updateDonorPoints(
            req.user.userId,
            donation
        );
        
        res.status(201).json({
            donation,
            match,
            gamification
        });
    } catch (error) {
        console.error('Donation creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donor's donations
router.get('/my-donations', async (req, res) => {
    try {
        const db = getDB();
        
        const donations = await db.query({
            selector: {
                donorId: req.user.userId
            },
            sort: [{ createdAt: 'desc' }]
        });
        
        res.json(donations);
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const db = getDB();
        const donation = await db.get(id);
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        
        if (donation.donorId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        donation.status = status;
        await db.insert(donation);
        
        res.json(donation);
    } catch (error) {
        console.error('Update donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
