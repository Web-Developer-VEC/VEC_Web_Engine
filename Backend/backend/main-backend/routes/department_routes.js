const express = require('express');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const {getDepartmentSection, getsidebar } = require('../controllers/department_controllers');


const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });

const router = express.Router();

// Define department routes
router.post('/department', limiter, xss, getDepartmentSection);
router.get('/:deptId/sidebar' ,limiter, xss, getsidebar);

module.exports = router;
