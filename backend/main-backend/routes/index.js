const express = require('express');

const router = express.Router();

const about_us = require('./about_us_routes');

// Register them with router
router.use('', about_us);

module.exports = router;
