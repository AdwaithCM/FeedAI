const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { getDB } = require('../config/db');

// Get matches for user
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        
        const query = req.user.type === 'donor'
            ? { donorId: req.user.userId }
            : { recipientId: req.user.userId };
        
        const matches = await db.query({
            selector: query,
            sort: [{ createdAt: 'desc' }]
        });
        
        res.json(matches);
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update match status
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const db = getDB();
        const match = await db.get(id);
        
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        
        // Verify user is involved in the match
        if (match.donorId !== req.user.userId && 
            match.recipientId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        match.status = status;
        await db.insert(match);
        
        // If match is completed, update donation status
        if (status === 'completed') {
            const donation = await db.get(match.donationId);
            donation.status = 'completed';
            await db.insert(donation);
        }
        
        res.json(match);
    } catch (error) {
        console.error('Update match error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
