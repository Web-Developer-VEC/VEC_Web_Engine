const express = require('express');
const { getLandingpageData } = require('../controllers/landing_controllers');

const router = express.Router();

router.get('/landing_page_data', getLandingpageData);

module.exports = router