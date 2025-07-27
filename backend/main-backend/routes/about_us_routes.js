const express = require('express');

const { getAboutUs } = require('../controllers/about_us_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');


const router = express.Router();

const limiter = createRateLimiter({ max: 20, windowMs:  60 * 1000 });

router.post('/about_us', limiter, xss, getAboutUs);

module.exports = router;
