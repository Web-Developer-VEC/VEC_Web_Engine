const express = require('express');
const { getPlacementsSection } = require('../controllers/placement_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/placement', limiter, xss, getPlacementsSection);

module.exports = router;
