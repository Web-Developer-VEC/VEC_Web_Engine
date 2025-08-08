const express = require('express');
const { getPlacementsSection } = require('../controllers/placement_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 70, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/placement', limiter, xss, nosql, getPlacementsSection);

module.exports = router;
