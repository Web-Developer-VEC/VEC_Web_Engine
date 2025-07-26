const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../config/db');

router.post('/admin_signup', async (req, res) => {
    if (
        !req.session ||
        !req.session.admin_auth ||
        !req.session.authenticated_sectors ||
        req.session.authenticated_sectors.signup_access !== true
    ) {
        return res.status(403).json({ error: 'Unauthorized: signup access denied' });
    }

    let { username, password, authenticated_sectors } = req.body;
    username = username?.trim().toLowerCase();

    if (!username || !password || typeof authenticated_sectors !== 'object') {
        return res.status(400).json({ error: 'Username, password, and authenticated_sectors are required' });
    }

    try {
        const existingUser = await db.collection('admin_details').findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPassword,
            authenticated_sectors,
            status: 'active',
            createdAt: new Date()
        };

        await db.collection('admin_details').insertOne(newUser);

        res.status(201).json({ message: 'Signup successful' });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
