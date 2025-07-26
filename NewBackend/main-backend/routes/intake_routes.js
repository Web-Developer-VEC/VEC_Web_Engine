const express = require('express');
const { getUG, getPG, getMBA, getAdmisionTeam } = require('../controllers/intake_controllers');

const router = express.Router();

router.get('/ug', getUG);
router.get('/pg', getPG);
router.get('/mba', getMBA);
router.get('/admission-team', getAdmisionTeam);

module.exports = router;