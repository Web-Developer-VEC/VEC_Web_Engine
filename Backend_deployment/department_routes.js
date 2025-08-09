const express = require('express');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const sanitize = require('../middlewares/sanitizers/sanitize_department');
const {getDepartmentSection } = require('../controllers/department_controllers');


const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });

const router = express.Router();

// Define department routes
router.post('/department', limiter, xss, getDepartmentSection);

module.exports = router;
