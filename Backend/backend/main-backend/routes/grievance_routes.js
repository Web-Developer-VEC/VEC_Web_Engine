const express = require('express');
const { getGrievance } = require('../controllers/grievance_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitizers/sanitize_grievance');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 20, windowMs: 10 * 60 * 1000 });

const router = express();

router.post('/get_grievance', limiter, xss, sanitize, nosql, getGrievance);

module.exports = router;