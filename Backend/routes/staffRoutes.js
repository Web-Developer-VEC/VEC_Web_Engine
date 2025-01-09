const express = require('express');
const Staff = require('../models/Staff');

const router = express.Router();

// Route to get all staff data
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
