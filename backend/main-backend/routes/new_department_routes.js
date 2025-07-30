const express = require('express');
const { getDepartmentSection } = require('../controllers/new_department_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 70, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/department_test', limiter, xss, nosql, getDepartmentSection);

module.exports = router;
