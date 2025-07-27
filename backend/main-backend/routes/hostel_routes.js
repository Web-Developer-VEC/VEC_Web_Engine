const express = require('express');
const { getHostelDetails } = require('../controllers/hostel_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/hostel_menu', limiter, xss, getHostelDetails);

module.exports = router;