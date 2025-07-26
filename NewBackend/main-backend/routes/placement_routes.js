const express = require('express');
const { getPlacementTeam, getPlacementData } = require('../controllers/placement_controllers');

const router = express.Router();

router.get('/placementteam', getPlacementTeam);
router.get('/placementsdata', getPlacementData);

module.exports = router;