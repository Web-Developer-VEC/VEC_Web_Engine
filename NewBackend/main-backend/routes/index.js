const express = require('express');
const router = express.Router();

// Import page-specific routers using variables
const landing = require('./landing');

// Register them with router
router.use('/landing', landing);

module.exports = router;
