const express = require('express');

const { getAcademicsData } = require('../controllers/academic_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');



const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/academics', limiter, xss, nosql, getAcademicsData);

module.exports = router; 