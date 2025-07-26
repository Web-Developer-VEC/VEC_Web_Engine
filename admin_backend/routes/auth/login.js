const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../config/db');
const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 5 * 60 * 1000; 

router.post('/admin_login', async (req, res) => {
    let { username, password } = req.body;
    username = username?.trim().toLowerCase();

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const ip = req.ip;
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, time: now };

    if (attempt.count >= MAX_ATTEMPTS && now - attempt.time < BLOCK_DURATION) {
        return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    }

    try {
        const user = await db.collection('admin_details').findOne({ username });

        if (!user) {
            loginAttempts.set(ip, {
                count: attempt.count + 1,
                time: attempt.time
            });
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        if (user.status && user.status.toLowerCase() !== 'active') {
            return res.status(403).json({ error: 'Account is inactive or blocked. Contact admin.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            loginAttempts.set(ip, {
                count: attempt.count + 1,
                time: attempt.time
            });
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        loginAttempts.delete(ip);

        req.session.username = user.username;
        req.session.authenticated_sectors = user.authenticated_sectors || [];
        req.session.admin_auth = true;

        res.json({ message: 'Login successful', username: user.username });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
