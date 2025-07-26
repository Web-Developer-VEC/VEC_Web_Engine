const express = require('express');
const { getUG, getPG, getMBA, getAdmisionTeam } = require('../controllers/intake_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/ug', limiter, getUG);
router.get('/pg', limiter, getPG);
router.get('/mba', limiter, getMBA);
router.get('/admission-team', limiter, getAdmisionTeam);

module.exports = router;