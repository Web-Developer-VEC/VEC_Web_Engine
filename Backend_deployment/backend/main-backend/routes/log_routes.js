const express = require('express');

const { getDatabaseLogs } = require('../controllers/log_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const router = express.Router();

const limiter = createRateLimiter({ max: 5, windowMs: 10* 60 * 1000 });

// do admin access and rmodify the rate limiter for this
router.get('/logs', limiter, xss, getDatabaseLogs);

module.exports = router;
