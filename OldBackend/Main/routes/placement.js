const express = require('express');
const { getPlacementTeam, getPlacementData } = require('../controllers/placementController');

const router = express.Router();

router.get('/placementteam', getPlacementTeam);
router.get('/placementsdata', getPlacementData);

module.exports = router;