const express = require('express');
const { getPlacementTeam, getPlacementData } = require('../controllers/placement_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/placementteam', limiter, xss, getPlacementTeam);
router.get('/placementsdata', limiter, xss, getPlacementData);

module.exports = router;