const express = require('express');
const { getAdministrationSection } = require('../controllers/administration_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');

const limiter = createRateLimiter({ max: 110, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/administration', limiter, xss, nosql, getAdministrationSection);

module.exports = router;
