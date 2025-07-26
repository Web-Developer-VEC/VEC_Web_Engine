const express = require('express');
const { getDean } = require('../controllers/dean_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.use('/deanandassociates', limiter, xss, getDean);

module.exports = router