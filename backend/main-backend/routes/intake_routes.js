const express = require('express');
const { getUG, getPG, getMBA, getAdmisionTeam } = require('../controllers/intake_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/ug', limiter, xss, getUG);
router.get('/pg', limiter, xss, getPG);
router.get('/mba', limiter, xss, getMBA);
router.get('/admission-team', limiter, xss, getAdmisionTeam);

module.exports = router;