const express = require('express');
const { getLandingpageData } = require('../controllers/landing_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/landing_page_data', limiter, getLandingpageData);

module.exports = router