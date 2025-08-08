const express = require('express');
const { getExamsSection } = require('../controllers/exam_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 80, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/exam', limiter, xss, nosql, getExamsSection);

module.exports = router;
