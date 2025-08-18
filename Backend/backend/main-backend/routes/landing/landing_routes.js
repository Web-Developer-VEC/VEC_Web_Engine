const express = require('express');
const { getLandingpageData } = require('../../controllers/landing_controllers');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 1000, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/landing_page_data', limiter, xss, nosql, hitTracker, getLandingpageData);

module.exports = router