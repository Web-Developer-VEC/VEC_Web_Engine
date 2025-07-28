const express = require('express');
const { getLandingpageData } = require('../controllers/landing_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/landing_page_data', limiter, xss, getLandingpageData);

module.exports = router