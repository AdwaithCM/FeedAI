const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDB } = require('../config/db');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, type, location } = req.body;
        
        const db = getDB();
        
        // Check if user already exists
        const existingUser = await db.query({
            selector: { email }
        });
        
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const hashedPassword = await User.hashPassword(password);
        const user = new User({
            email,
            password: hashedPassword,
            name,
            type,
            location
        });
        
        await db.insert(user);
        
        const token = jwt.sign(
            { userId: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ token, user: { ...user, password: undefined } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const db = getDB();
        
        // Find user
        const users = await db.query({
            selector: { email }
        });
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = new User(users[0]);
        
        // Check password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { ...user, password: undefined } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
