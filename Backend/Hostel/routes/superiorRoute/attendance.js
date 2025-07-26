const express = require('express');
const { ensureAuthenticatedSuperior } = require('../../middleware/authMiddelware');
const { getFoodCountSuperior } = require('../../controllers/superiorController/attendanceController');

const router = express.Router();

router.get('/food_count_superior', ensureAuthenticatedSuperior, getFoodCountSuperior);

module.exports = router;