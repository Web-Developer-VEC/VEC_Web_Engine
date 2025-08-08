const express = require('express');
const { getResearchSection } = require('../controllers/research_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');

const limiter = createRateLimiter({ max: 800, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/research', limiter, xss, nosql, getResearchSection);

module.exports = router;
