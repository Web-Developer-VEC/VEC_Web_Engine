const express = require('express');
const { getHostelDetails } = require('../controllers/hostel_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/hostel_menu', limiter, getHostelDetails);

module.exports = router;