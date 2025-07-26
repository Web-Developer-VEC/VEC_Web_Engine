const express = require('express');
const { ensureAuthenticatedWarden } = require('../../middleware/authMiddelware');
const { getFoodCount } = require('../../controllers/wardenController/attendanceController');

const router = express.Router();

router.get('/food_count_warden', ensureAuthenticatedWarden, getFoodCount);

module.exports = router;