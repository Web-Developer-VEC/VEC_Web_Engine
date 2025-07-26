const express = require('express');

const { getAbtUs } = require('../controllers/about_us_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');

const router = express.Router();

const limiter = createRateLimiter({ max: 2, windowMs:  60 * 1000 });

router.get('/about_us', limiter, getAbtUs);

module.exports = router;
