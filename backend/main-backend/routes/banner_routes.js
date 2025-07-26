const express = require('express');
const { getBanner } = require('../controllers/banner_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/banner', limiter, xss, getBanner);

module.exports = router;