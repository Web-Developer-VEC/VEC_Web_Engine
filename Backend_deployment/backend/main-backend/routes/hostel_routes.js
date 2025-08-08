const express = require('express');
const { getHostelDetails } = require('../controllers/hostel_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 60, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/hostel_menu', limiter, xss, nosql, getHostelDetails);

module.exports = router;