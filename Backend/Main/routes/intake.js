const express = require('express');
const { getUG, getPG, getMBA } = require('../controllers/intakeController');

const router = express.Router();

router.get('/ug', getUG);
router.get('/pg', getPG);
router.get('/mba', getMBA);

module.exports = router;